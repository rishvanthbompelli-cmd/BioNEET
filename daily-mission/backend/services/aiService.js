const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

async function callOllama(prompt) {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7 },
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response || null;
  } catch {
    return null;
  }
}

function parseJsonFromText(text) {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function generateStudyPlan({ examMode, dailyHours, weakSubjects, targetRank, completedChapters }) {
  const prompt = `You are an expert NEET/EAPCET BiPC coach for AP/TS students.
Create a JSON study plan for:
- Exam: ${examMode}
- Daily hours: ${dailyHours}
- Weak subjects: ${weakSubjects?.join?.(', ') || weakSubjects || 'none'}
- Target rank: ${targetRank || 'top 1000'}
- Completed chapters: ${completedChapters?.join?.(', ') || completedChapters || 'none'}

Return ONLY valid JSON:
{
  "goal": "string",
  "dailyMissions": ["task1", "task2", "task3"],
  "weeklySchedule": [{"day":"Mon","subjects":["Botany"],"hours":2}],
  "revisionPlan": ["chapter names"],
  "mockSchedule": ["when to take mocks"],
  "weakTopicFocus": ["topics"]
}`;

  const aiText = await callOllama(prompt);
  const parsed = aiText ? parseJsonFromText(aiText) : null;

  if (parsed) return parsed;

  const subjects = examMode === 'EAPCET'
    ? ['Botany', 'Zoology', 'Physics', 'Chemistry']
    : ['Botany', 'Zoology', 'Physics', 'Chemistry'];

  const weak = Array.isArray(weakSubjects) ? weakSubjects : (weakSubjects ? [weakSubjects] : ['Chemistry']);

  return {
    goal: `${examMode} BiPC preparation — target rank ${targetRank || 1000}`,
    dailyMissions: [
      `Revise ${weak[0]} NCERT chapter (45 min)`,
      `Solve 40 ${examMode === 'EAPCET' ? 'rapid-fire' : 'conceptual'} MCQs in ${weak[0]}`,
      'Review yesterday\'s mistakes & update revision tracker',
      examMode === 'NEET' ? 'Practice 5 assertion-reason questions' : 'Speed drill: 20 math-heavy Physics MCQs',
    ],
    weeklySchedule: subjects.map((s, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7],
      subjects: [s],
      hours: dailyHours || 4,
    })),
    revisionPlan: ['Plant Physiology', 'Human Reproduction', 'Organic Chemistry', 'Thermodynamics'],
    mockSchedule: ['Full mock every Sunday', 'Chapter test every Wednesday'],
    weakTopicFocus: weak,
  };
}

async function generateQuiz({ subject, chapter, topic, examMode }) {
  const prompt = `Generate 5 ${examMode || 'NEET'} level BiPC questions for:
Subject: ${subject}, Chapter: ${chapter || 'general'}, Topic: ${topic}

Return ONLY JSON array:
[{"type":"MCQ","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correctOption":"A","explanation":"..."}]`;

  const aiText = await callOllama(prompt);
  const parsed = aiText ? parseJsonFromText(aiText) : null;
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;

  return [
    {
      type: 'MCQ',
      question: `Which concept is most important in ${topic} (${subject})?`,
      options: { A: 'Definition & NCERT lines', B: 'Only numericals', C: 'Only diagrams', D: 'Previous year trends only' },
      correctOption: 'A',
      explanation: `${topic} in ${subject} is NCERT-centric for ${examMode || 'NEET'}. Master definitions first.`,
    },
    {
      type: 'Assertion-Reason',
      question: `Assertion: ${topic} is high-weightage for ${examMode}. Reason: It appears frequently in AP/TS papers.`,
      options: { A: 'Both true, R explains A', B: 'Both true, R does not explain A', C: 'A true R false', D: 'Both false' },
      correctOption: 'A',
      explanation: 'Both statements are valid for BiPC EAPCET/NEET preparation strategy.',
    },
    {
      type: 'One-Word',
      question: `One-word answer: Primary focus area in ${chapter || topic}?`,
      options: { A: 'Concepts', B: 'Speed', C: 'Guessing', D: 'Skipping' },
      correctOption: examMode === 'EAPCET' ? 'B' : 'A',
      explanation: examMode === 'EAPCET' ? 'EAPCET rewards speed with accuracy.' : 'NEET rewards deep conceptual clarity.',
    },
  ];
}

module.exports = { generateStudyPlan, generateQuiz };
