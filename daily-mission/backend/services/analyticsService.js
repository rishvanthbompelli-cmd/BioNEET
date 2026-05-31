const prisma = require('../utils/prisma');

const SUBJECTS = ['Botany', 'Zoology', 'Physics', 'Chemistry'];

async function getDashboardStats(userId) {
  const [
    user,
    totalChapters,
    completedRevisions,
    mcqAttempts,
    mockScores,
    studySessions,
    studyPlan,
    recentQuizzes,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.chapter.count(),
    prisma.revision.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.mcqAttempt.findMany({
      where: { userId },
      include: { mcq: { select: { subject: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mockScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { mockTest: { select: { title: true, mode: true } } },
    }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    }),
    prisma.studyPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalAttempts = mcqAttempts.length;
  const correctAttempts = mcqAttempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalStudyHours = Math.round(totalStudyMinutes / 60);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekMinutes = studySessions
    .filter((s) => new Date(s.date) >= weekAgo)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const avgMockScore = mockScores.length
    ? Math.round(mockScores.reduce((s, m) => s + (m.score / m.totalQuestions) * 100, 0) / mockScores.length)
    : 0;

  const dailyGoalProgress = Math.min(100, Math.round((weekMinutes / ((user?.dailyHours || 4) * 60 * 7)) * 100));

  const subjectAccuracy = SUBJECTS.map((subject) => {
    const attempts = mcqAttempts.filter((a) => a.mcq.subject === subject);
    const correct = attempts.filter((a) => a.isCorrect).length;
    return {
      subject,
      accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
      attempts: attempts.length,
    };
  });

  const heatmap = buildHeatmap(studySessions, mcqAttempts);

  let dailyMission = [];
  if (studyPlan?.planJson) {
    try {
      const plan = JSON.parse(studyPlan.planJson);
      dailyMission = plan.dailyMissions || plan.tasks || [];
    } catch {
      dailyMission = [];
    }
  }

  const recentActivity = buildRecentActivity(mcqAttempts, studySessions, mockScores, recentQuizzes);

  return {
    user: {
      name: user?.name,
      streak: user?.streak || 0,
      examMode: user?.examMode || 'NEET',
      targetRank: user?.targetRank,
    },
    stats: {
      dailyGoalProgress,
      chaptersRevised: completedRevisions,
      totalChapters,
      accuracy,
      avgMockScore,
      totalStudyHours,
      weekStudyHours: Math.round(weekMinutes / 60),
      totalMcqAttempts: totalAttempts,
    },
    subjectAccuracy,
    heatmap,
    recentMockScores: mockScores.map((m) => ({
      id: m.id,
      title: m.mockTest.title,
      mode: m.mockTest.mode,
      score: m.score,
      total: m.totalQuestions,
      percentage: Math.round((m.score / m.totalQuestions) * 100),
      date: m.createdAt,
    })),
    dailyMission,
    studyPlanId: studyPlan?.id || null,
    recentActivity,
    savedPlan: studyPlan
      ? {
          id: studyPlan.id,
          goal: studyPlan.goal,
          plan: (() => { try { return JSON.parse(studyPlan.planJson); } catch { return null; } })(),
        }
      : null,
  };
}

function buildHeatmap(studySessions, mcqAttempts) {
  const map = {};
  const today = new Date();

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  studySessions.forEach((s) => {
    const key = new Date(s.date).toISOString().slice(0, 10);
    if (map[key] !== undefined) map[key] += s.durationMinutes;
  });

  mcqAttempts.forEach((a) => {
    const key = new Date(a.createdAt).toISOString().slice(0, 10);
    if (map[key] !== undefined) map[key] += 5;
  });

  return Object.entries(map).map(([date, minutes]) => ({ date, minutes, level: getHeatLevel(minutes) }));
}

function getHeatLevel(minutes) {
  if (minutes === 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

function buildRecentActivity(mcqAttempts, studySessions, mockScores, quizzes) {
  const items = [];

  mcqAttempts.slice(0, 15).forEach((a) => {
    items.push({
      type: 'mcq',
      label: `${a.isCorrect ? 'Correct' : 'Wrong'} MCQ in ${a.mcq?.subject || 'Unknown'}`,
      subject: a.mcq?.subject,
      success: a.isCorrect,
      date: a.createdAt,
    });
  });

  studySessions.slice(0, 10).forEach((s) => {
    items.push({
      type: 'study',
      label: `Studied ${s.subject} for ${s.durationMinutes} min`,
      subject: s.subject,
      minutes: s.durationMinutes,
      date: s.date,
    });
  });

  mockScores.slice(0, 5).forEach((m) => {
    items.push({
      type: 'mock',
      label: `Mock test: ${m.mockTest?.title} — ${Math.round((m.score / m.totalQuestions) * 100)}%`,
      date: m.createdAt,
    });
  });

  quizzes.forEach((q) => {
    items.push({
      type: 'quiz',
      label: `AI quiz: ${q.subject} — ${q.topic}`,
      subject: q.subject,
      date: q.createdAt,
    });
  });

  return items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
}

async function getFullAnalytics(userId) {
  const dashboard = await getDashboardStats(userId);

  const [weakRevisions, mcqByDifficulty, weeklyTrend] = await Promise.all([
    prisma.revision.findMany({
      where: { userId, status: 'WEAK' },
      include: { chapter: true },
    }),
    prisma.mcqAttempt.groupBy({
      by: ['isCorrect'],
      where: { userId },
      _count: true,
    }),
    getWeeklyTrend(userId),
  ]);

  const aiSuggestions = buildAiSuggestions(dashboard, weakRevisions);

  return {
    ...dashboard,
    weakChapters: weakRevisions.map((r) => ({
      id: r.chapter.id,
      name: r.chapter.name,
      subject: r.chapter.subject,
      revisionCount: r.revisionCount,
    })),
    mcqBreakdown: {
      correct: mcqByDifficulty.find((g) => g.isCorrect)?._count || 0,
      incorrect: mcqByDifficulty.find((g) => !g.isCorrect)?._count || 0,
    },
    weeklyTrend,
    aiSuggestions,
  };
}

async function getWeeklyTrend(userId) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const [sessions, attempts] = await Promise.all([
      prisma.studySession.aggregate({
        where: { userId, date: { gte: d, lt: next } },
        _sum: { durationMinutes: true },
      }),
      prisma.mcqAttempt.count({
        where: { userId, createdAt: { gte: d, lt: next } },
      }),
    ]);

    days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      studyMinutes: sessions._sum.durationMinutes || 0,
      mcqCount: attempts,
    });
  }
  return days;
}

function buildAiSuggestions(dashboard, weakRevisions) {
  const suggestions = [];
  const weakest = [...dashboard.subjectAccuracy].sort((a, b) => a.accuracy - b.accuracy)[0];

  if (weakest && weakest.attempts > 0 && weakest.accuracy < 70) {
    suggestions.push(`Focus on ${weakest.subject} — your accuracy is ${weakest.accuracy}%. Revise NCERT diagrams and solve 30 MCQs today.`);
  }

  if (weakRevisions.length > 0) {
    suggestions.push(`Revisit weak chapter: ${weakRevisions[0].chapter.name} (${weakRevisions[0].chapter.subject}).`);
  }

  if (dashboard.stats.dailyGoalProgress < 50) {
    suggestions.push('You are behind your weekly study goal. Block 2 focused hours for Biology today.');
  }

  if (dashboard.stats.accuracy >= 80) {
    suggestions.push('Strong accuracy! Attempt a full NEET mock test to benchmark your rank.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Maintain your streak. Complete today\'s daily mission and revise one weak topic.');
  }

  return suggestions;
}

module.exports = { getDashboardStats, getFullAnalytics };
