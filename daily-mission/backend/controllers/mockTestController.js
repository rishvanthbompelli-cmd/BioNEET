const prisma = require('../utils/prisma');

const getMockTests = async (req, res) => {
  try {
    const { mode, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const tests = await prisma.mockTest.findMany({
      where: {
        isPublished: true,
        ...(mode ? { mode } : {}),
      },
      select: {
        id: true,
        title: true,
        mode: true,
        durationMinutes: true,
        subject: true,
        totalQuestions: true,
      },
      skip,
      take,
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mock tests' });
  }
};

const getMockTestById = async (req, res) => {
  try {
    const test = await prisma.mockTest.findUnique({
      where: { id: parseInt(req.params.id, 10) },
    });
    if (!test) return res.status(404).json({ message: 'Mock test not found' });
    res.json({
      ...test,
      questions: JSON.parse(test.questionsJson),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mock test' });
  }
};

const submitMockTest = async (req, res) => {
  try {
    const mockTestId = parseInt(req.params.id, 10);
    const { answers, timeTakenMinutes } = req.body;

    const test = await prisma.mockTest.findUnique({ where: { id: mockTestId } });
    if (!test) return res.status(404).json({ message: 'Mock test not found' });

    const questions = JSON.parse(test.questionsJson);
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctOption) score++;
    });

    const allScores = await prisma.mockScore.findMany({ where: { mockTestId } });
    const percentile = allScores.length
      ? Math.round((allScores.filter((s) => s.score < score).length / allScores.length) * 100)
      : 100;

    const result = await prisma.mockScore.create({
      data: {
        userId: req.user.userId,
        mockTestId,
        score,
        totalQuestions: questions.length,
        timeTakenMinutes: timeTakenMinutes || test.durationMinutes,
        answersJson: JSON.stringify(answers),
        percentile,
      },
    });

    res.status(201).json({
      ...result,
      percentage: Math.round((score / questions.length) * 100),
      weakAreas: analyzeWeakAreas(questions, answers),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit mock test' });
  }
};

function analyzeWeakAreas(questions, answers) {
  const weak = {};
  questions.forEach((q, i) => {
    if (answers[i] !== q.correctOption) {
      weak[q.subject] = (weak[q.subject] || 0) + 1;
    }
  });
  return Object.entries(weak)
    .map(([subject, count]) => ({ subject, wrongCount: count }))
    .sort((a, b) => b.wrongCount - a.wrongCount);
}

module.exports = { getMockTests, getMockTestById, submitMockTest };
