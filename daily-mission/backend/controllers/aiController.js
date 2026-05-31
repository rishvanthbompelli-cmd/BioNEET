const prisma = require('../utils/prisma');
const { generateStudyPlan, generateQuiz } = require('../services/aiService');

const createStudyPlan = async (req, res) => {
  try {
    const { examMode, dailyHours, weakSubjects, targetRank, completedChapters } = req.body;

    const plan = await generateStudyPlan({
      examMode: examMode || 'NEET',
      dailyHours: dailyHours || 4,
      weakSubjects,
      targetRank,
      completedChapters,
    });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        examMode: examMode || 'NEET',
        dailyHours: dailyHours || 4,
        targetRank: targetRank || null,
        weakSubjects: JSON.stringify(weakSubjects || []),
      },
    });

    const saved = await prisma.studyPlan.create({
      data: {
        userId: req.user.userId,
        goal: plan.goal,
        planJson: JSON.stringify(plan),
      },
    });

    res.status(201).json({ id: saved.id, ...plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate study plan' });
  }
};

const getStudyPlans = async (req, res) => {
  try {
    const plans = await prisma.studyPlan.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      plans.map((p) => ({
        id: p.id,
        goal: p.goal,
        createdAt: p.createdAt,
        plan: JSON.parse(p.planJson),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch study plans' });
  }
};

const generateQuizHandler = async (req, res) => {
  try {
    const { subject, chapter, topic, examMode } = req.body;
    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic are required' });
    }

    const questions = await generateQuiz({ subject, chapter, topic, examMode });

    const quiz = await prisma.quiz.create({
      data: {
        userId: req.user.userId,
        subject,
        chapter: chapter || '',
        topic,
        questionsJson: JSON.stringify(questions),
      },
    });

    res.status(201).json({ id: quiz.id, questions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(
      quizzes.map((q) => ({
        id: q.id,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        createdAt: q.createdAt,
        questions: JSON.parse(q.questionsJson),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

module.exports = { createStudyPlan, getStudyPlans, generateQuizHandler, getQuizzes };
