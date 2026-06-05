const prisma = require('../utils/prisma');
const { generateStudyPlan, generateQuiz } = require('../services/aiService');

const createStudyPlan = async (req, res) => {
  try {
    const { examMode, dailyHours, weakSubjects, targetRank, completedChapters, totalDaysRemaining } = req.body;

    const plan = await generateStudyPlan({
      examMode: examMode || 'NEET',
      dailyHours: dailyHours || 4,
      weakSubjects,
      targetRank,
      completedChapters,
      totalDaysRemaining,
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
    const { subject, chapter, topic, examMode, quizType = 'chapter', scope } = req.body;

    if (quizType === 'chapter' && (!subject || !chapter) && scope !== 'Full-Syllabus') {
      return res.status(400).json({ message: 'Subject and chapter are required for chapter quiz' });
    }
    if (quizType === 'subject' && !subject) {
      return res.status(400).json({ message: 'Subject is required for subject quiz' });
    }

    const questions = await generateQuiz({
      quizType,
      subject: subject || 'Mixed',
      chapter,
      topic: topic || chapter || quizType,
      examMode: examMode || (quizType === 'eapcet_full' ? 'EAPCET' : quizType === 'neet_full' ? 'NEET' : 'NEET'),
      scope,
    });

    const quiz = await prisma.quiz.create({
      data: {
        userId: req.user.userId,
        subject: subject || 'Mixed',
        chapter: chapter || quizType,
        topic: topic || chapter || quizType,
        questionsJson: JSON.stringify(questions),
      },
    });

    res.status(201).json({ id: quiz.id, quizType, count: questions.length, questions });
  } catch (error) {
    console.error(error);
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

const generatePlannerHandler = async (req, res) => {
  try {
    const { weakAreas, dailyAvailableHours, targetExam, totalDaysRemaining } = req.body;

    const plan = await generateStudyPlan({
      examMode: targetExam || 'NEET',
      dailyHours: dailyAvailableHours || 4,
      weakSubjects: weakAreas || [],
      targetRank: 'Top Tier',
      completedChapters: [],
      totalDaysRemaining: totalDaysRemaining || 30,
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
    res.status(500).json({ message: 'Failed to generate planner' });
  }
};

module.exports = { createStudyPlan, getStudyPlans, generateQuizHandler, getQuizzes, generatePlannerHandler };
