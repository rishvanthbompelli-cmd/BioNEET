const prisma = require('../utils/prisma');

const getMcqs = async (req, res) => {
  try {
    const { subject, difficulty, chapterId } = req.query;
    const mcqs = await prisma.mcq.findMany({
      where: {
        ...(subject && subject !== 'All' ? { subject } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(chapterId ? { chapterId: parseInt(chapterId, 10) } : {}),
      },
      include: { chapter: { select: { name: true } } },
    });
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch MCQs' });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const mcqId = parseInt(req.params.id, 10);
    const { selectedOption, timeSpentSec = 0 } = req.body;

    const mcq = await prisma.mcq.findUnique({ where: { id: mcqId } });
    if (!mcq) return res.status(404).json({ message: 'MCQ not found' });

    const isCorrect = selectedOption === mcq.correctOption;

    const attempt = await prisma.mcqAttempt.create({
      data: {
        userId: req.user.userId,
        mcqId,
        selectedOption,
        isCorrect,
        timeSpentSec,
      },
    });

    res.json({
      attempt,
      isCorrect,
      correctOption: mcq.correctOption,
      explanation: mcq.explanation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit attempt' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const attempts = await prisma.mcqAttempt.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { isCorrect: true },
    });

    const userIds = attempts.map((a) => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, streak: true },
    });

    const leaderboard = attempts
      .map((a) => ({
        ...users.find((u) => u.id === a.userId),
        correctCount: a._count.id,
      }))
      .sort((a, b) => b.correctCount - a.correctCount)
      .slice(0, 10);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

module.exports = { getMcqs, submitAttempt, getLeaderboard };
