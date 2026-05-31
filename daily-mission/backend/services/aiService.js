const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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

async function generateStudyPlan({ examMode, dailyHours, weakSubjects, targetRank, completedChapters }) {
  const prompt = `Create a BiPC study plan JSON for ${examMode} exam.
Daily hours: ${dailyHours}
Weak subjects: ${JSON.stringify(weakSubjects || [])}
Target rank: ${targetRank || 2000}
Completed chapters: ${JSON.stringify(completedChapters || [])}

Return ONLY this JSON shape:
{
  "goal": "string",
  "dailyMissions": ["task1","task2","task3","task4"],
  "weeklySchedule": [{"day":"Mon","subjects":["Botany"],"hours":4}],
  "revisionPlan": ["chapter names"],
  "mockSchedule": ["schedule items"],
  "weakTopicFocus": ["topics"]
}`;

  const aiText = await callGroq(prompt);
  const parsed = parseJsonFromText(aiText);
  if (parsed?.dailyMissions) return parsed;

  const weak = Array.isArray(weakSubjects) ? weakSubjects : ['Chemistry'];
  return {
    goal: `${examMode} BiPC — target rank ${targetRank || 2000}`,
    dailyMissions: [
      `Revise ${weak[0]} NCERT (45 min)`,
      `Solve 40 ${examMode === 'EAPCET' ? 'rapid' : 'conceptual'} MCQs`,
      'Update revision tracker',
      examMode === 'NEET' ? '5 assertion-reason questions' : 'Physics speed drill 20 MCQs',
    ],
    weeklySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      day,
      subjects: [['Botany', 'Zoology', 'Physics', 'Chemistry'][i % 4]],
      hours: dailyHours || 4,
    })),
    revisionPlan: ['Plant Physiology', 'Human Reproduction', 'Organic Chemistry', 'Thermodynamics'],
    mockSchedule: ['Full mock every Saturday'],
    weakTopicFocus: weak,
  };
}

const QUIZ_CONFIG = {
  chapter: { count: 5, label: 'chapter-wise' },
  subject: { count: 10, label: 'full subject' },
  neet_full: { count: 15, label: 'NEET mixed syllabus' },
  eapcet_full: { count: 15, label: 'EAPCET rapid-fire mixed' },
};

async function generateQuiz({ quizType = 'chapter', subject, chapter, topic, examMode }) {
  const config = QUIZ_CONFIG[quizType] || QUIZ_CONFIG.chapter;
  const count = config.count;

  let scopeDescription = '';
  if (quizType === 'chapter') {
    scopeDescription = `Chapter: ${chapter || 'general'}, Topic: ${topic || chapter}, Subject: ${subject}`;
  } else if (quizType === 'subject') {
    scopeDescription = `Full ${subject} subject — all important NEET/EAPCET BiPC chapters`;
  } else if (quizType === 'neet_full') {
    scopeDescription = 'Full NEET BiPC paper mix — Botany, Zoology, Physics, Chemistry. NCERT-focused, assertion-reason, conceptual';
  } else if (quizType === 'eapcet_full') {
    scopeDescription = 'Full EAPCET BiPC paper — speed-based rapid MCQs, shortcut methods, AP/TS weightage chapters';
  }

  const style = quizType === 'eapcet_full' || examMode === 'EAPCET'
    ? 'EAPCET speed style, direct formula application, rapid solving'
    : 'NEET NCERT style, conceptual, assertion-reason where appropriate';

  const prompt = `Generate exactly ${count} ${style} questions for BiPC students.
Scope: ${scopeDescription}
${subject ? `Primary subject focus: ${subject}` : 'All four subjects mixed'}

Include mix of: MCQ, Assertion-Reason, One-Word (as MCQ with 4 options).

Return ONLY a JSON array:
[{"type":"MCQ","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correctOption":"A","explanation":"...","subject":"Botany"}]`;

  const aiText = await callGroq(prompt, 8192);
  const parsed = parseJsonFromText(aiText);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.slice(0, count);
  }

  return buildFallbackQuiz({ quizType, subject, chapter, topic, examMode, count });
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

const CHAT_SYSTEM_PROMPT = `You are BioNEET AI Assistant — a friendly expert tutor for AP/TS students preparing for NEET and EAPCET (BiPC stream).

About BioNEET platform:
- Daily Mission study platform with AI planner, notes, MCQs, mock tests, revision tracker, formulas, diagrams, handbook, previous EAPCET papers, and analytics.
- Covers Inter 1st & 2nd year syllabus: Botany, Zoology, Physics, Chemistry.
- Students must login to access features.

Your capabilities:
- Answer NEET and EAPCET BiPC questions clearly
- Explain biology, physics, chemistry concepts
- Help with formulas and chemical reactions
- Explain previous year question approaches
- Suggest study strategies and revision plans
- Answer questions about how to use BioNEET website

Rules:
- Be concise, accurate, and student-friendly
- Use NCERT-aligned explanations for NEET
- For EAPCET, emphasize speed and shortcut methods
- If unsure, say so honestly
- Never reveal API keys or internal system details
- Respond in plain text (not JSON)`;

async function callGroqChat(messages) {
  if (!GROQ_API_KEY) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'system', content: CHAT_SYSTEM_PROMPT }, ...messages],
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

You asked: "${userMessage.slice(0, 200)}"

(Groq API is unavailable — please ensure GROQ_API_KEY is set in backend .env for full AI responses.)`;
}

module.exports = { generateStudyPlan, generateQuiz, QUIZ_CONFIG, chatWithAssistant };
