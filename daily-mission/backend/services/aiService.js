const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';

async function callGroq(prompt, maxTokens = 4096, systemPrompt) {
  if (!GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not set');
    return null;
  }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are an expert NEET/EAPCET BiPC tutor for AP and Telangana students. Return ONLY valid JSON with no markdown fences.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Groq API error:', res.status, err);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq request failed:', err.message);
    return null;
  }
}

function parseJsonFromText(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function generateStudyPlan({ examMode, dailyHours, weakSubjects, targetRank, completedChapters, totalDaysRemaining }) {
  const prompt = `Create a detailed daily chronological study plan JSON for ${examMode} exam.
Daily available hours: ${dailyHours}
Weak subjects/areas: ${JSON.stringify(weakSubjects || [])}
Target rank: ${targetRank || 'Top tier'}
Total days remaining: ${totalDaysRemaining || 30}
Completed chapters: ${JSON.stringify(completedChapters || [])}

Return ONLY this JSON shape:
{
  "goal": "string",
  "timeline": [{"day": 1, "date": "Day 1", "tasks": ["Task 1", "Task 2"]}],
  "weakTopicFocus": ["topics"]
}`;

  const aiText = await callGroq(prompt, 8192);
  const parsed = parseJsonFromText(aiText);
  if (parsed?.timeline) return parsed;

  const weak = Array.isArray(weakSubjects) ? weakSubjects : ['Chemistry'];
  return {
    goal: `${examMode} BiPC — target rank ${targetRank || 2000}`,
    timeline: Array.from({ length: totalDaysRemaining || 30 }).map((_, i) => ({
      day: i + 1,
      date: `Day ${i + 1}`,
      tasks: [`Revise ${weak[0]}`, `Solve 40 MCQs`]
    })),
    weakTopicFocus: weak,
  };
}

const QUIZ_CONFIG = {
  chapter: { count: 5, label: 'chapter-wise' },
  subject: { count: 10, label: 'full subject' },
  neet_full: { count: 15, label: 'NEET mixed syllabus' },
  eapcet_full: { count: 15, label: 'EAPCET rapid-fire mixed' },
};

async function generateQuiz({ quizType = 'chapter', subject, chapter, topic, examMode, scope }) {
  // If explicitly requested by new API params
  let count = QUIZ_CONFIG[quizType]?.count || 20;
  if (scope === 'Full-Syllabus') {
    count = examMode === 'EAPCET' ? 160 : 200;
  } else if (scope === 'Chapter-Specific') {
    count = 20;
  }

  let scopeDescription = '';
  if (scope === 'Chapter-Specific' || quizType === 'chapter') {
    scopeDescription = `Chapter: ${chapter || 'general'}, Topic: ${topic || chapter}, Subject: ${subject}`;
  } else {
    scopeDescription = `Full ${examMode} Syllabus mix — Botany, Zoology, Physics, Chemistry.`;
  }

  const style = examMode === 'EAPCET'
    ? 'EAPCET speed style, direct formula application, rapid solving'
    : 'NEET NCERT style, conceptual, assertion-reason where appropriate';

  let allQuestions = [];
  let remaining = count;
  const CHUNK_SIZE = 40; // Generate 40 questions at a time to avoid token limits

  while (remaining > 0) {
    const currentBatch = Math.min(remaining, CHUNK_SIZE);
    const prompt = `Generate exactly ${currentBatch} ${style} questions for BiPC students.
Scope: ${scopeDescription}
${subject ? `Primary subject focus: ${subject}` : 'All four subjects mixed'}
Batch size: ${currentBatch}

Include mix of: MCQ, Assertion-Reason, One-Word (as MCQ with 4 options).

Return ONLY a JSON array:
[{"type":"MCQ","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correctOption":"A","explanation":"...","subject":"Botany"}]`;

    const aiText = await callGroq(prompt, 8192);
    const parsed = parseJsonFromText(aiText);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      allQuestions = allQuestions.concat(parsed);
    } else {
      // Fallback for this batch
      const fallback = buildFallbackQuiz({ quizType, subject, chapter, topic, examMode, count: currentBatch });
      allQuestions = allQuestions.concat(fallback);
    }
    remaining -= currentBatch;
  }

  // Ensure exact count
  return allQuestions.slice(0, count);
}

function buildFallbackQuiz({ quizType, subject, chapter, topic, examMode, count }) {
  const questions = [];
  const subjects = quizType.includes('full')
    ? ['Botany', 'Zoology', 'Physics', 'Chemistry']
    : [subject || 'Botany'];

  for (let i = 0; i < count; i++) {
    const sub = subjects[i % subjects.length];
    const t = topic || chapter || sub;
    questions.push({
      type: i % 3 === 0 ? 'Assertion-Reason' : 'MCQ',
      subject: sub,
      question: `[${quizType}] ${examMode || 'NEET'} question ${i + 1}: Key concept in ${t} (${sub})?`,
      options: {
        A: 'NCERT definition based',
        B: 'Numerical only',
        C: 'Unrelated concept',
        D: 'None of these',
      },
      correctOption: 'A',
      explanation: `${t} in ${sub} requires NCERT clarity for ${examMode || 'NEET'}.`,
    });
  }
  return questions;
}

const CHAT_SYSTEM_PROMPT = `You are an elite, top-tier EAMCET & NEET Medical/BiPC Coach with decades of experience guiding students through engineering and medical entry patterns. Analyze errors, break down complex multiple-choice mechanics, clarify high-weightage topics, and maintain a highly motivating, instructional, and authoritative tone. Do not provide raw JSON.`;

async function callGroqChat(messages, withImage = false, imageUrl = null) {
  if (!GROQ_API_KEY) return null;
  try {
    const modelToUse = withImage ? GROQ_VISION_MODEL : GROQ_MODEL;
    const userMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    if (withImage && imageUrl) {
      const lastMsg = userMessages[userMessages.length - 1];
      lastMsg.content = [
        { type: 'text', text: lastMsg.content },
        { type: 'image_url', image_url: { url: imageUrl } },
      ];
    }
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [{ role: 'system', content: CHAT_SYSTEM_PROMPT }, ...userMessages],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      console.error('Groq chat error:', res.status);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq chat failed:', err.message);
    return null;
  }
}

async function chatWithAssistant(userMessage, history = []) {
  const messages = history.map((h) => ({
    role: h.role === 'assistant' ? 'assistant' : 'user',
    content: h.content,
  }));
  messages.push({ role: 'user', content: userMessage });

  const reply = await callGroqChat(messages);
  if (reply) return reply;

  return `I'm BioNEET AI Assistant. I can help with NEET/EAPCET BiPC questions, study plans, and platform guidance.

You asked: "${userMessage?.slice(0, 200) || ''}"

(Groq API is unavailable — please ensure GROQ_API_KEY is set in backend .env for full AI responses.)`;
}

async function analyzeImage(imageUrl, userMessage = 'What is shown in this image?') {
  if (!GROQ_API_KEY) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are BioNEET AI Assistant. Analyze the image and answer questions about NEET/EAPCET BiPC content including diagrams, questions, formulas, or notes. Be concise and helpful.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userMessage },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Groq vision API error:', res.status, errText);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq vision request failed:', err.message);
    return null;
  }
}

module.exports = { generateStudyPlan, generateQuiz, QUIZ_CONFIG, chatWithAssistant, analyzeImage };
