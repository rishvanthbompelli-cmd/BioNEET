const prisma = require('../utils/prisma');
const { validateRevisionStatus } = require('../utils/validate');

const getRevisions = async (req, res) => {
  try {
    const { year, subject } = req.query;
    const chapters = await prisma.chapter.findMany({
      where: {
        ...(year && year !== 'All' ? { year } : {}),
        ...(subject && subject !== 'All' ? { subject } : {}),
      },
      orderBy: [{ year: 'asc' }, { subject: 'asc' }, { orderIndex: 'asc' }],
    });

    const userRevisions = await prisma.revision.findMany({ where: { userId: req.user.userId } });
    const revisionMap = Object.fromEntries(userRevisions.map((r) => [r.chapterId, r]));

    const data = chapters.map((c) => ({
      chapterId: c.id,
      name: c.name,
      subject: c.subject,
      year: c.year,
      yearLabel: c.year === 'INTER_1' ? 'Inter 1st Year' : 'Inter 2nd Year',
      weightage: c.weightage,
      weightageLevel: c.weightageLevel,
      difficulty: c.difficulty,
      linkedChapters: c.linkedChapters ? JSON.parse(c.linkedChapters) : [],
      isHighPriority: c.isHighPriority,
      isRankBooster: c.isRankBooster,
      isMostDifficult: c.isMostDifficult,
      status: revisionMap[c.id]?.status || 'NOT_STARTED',
      revisionCount: revisionMap[c.id]?.revisionCount || 0,
      lastRevisedAt: revisionMap[c.id]?.lastRevisedAt || null,
    }));

    res.json(data);
  } catch (error) {
    console.error('Revision fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch revisions' });
  }
};

const getSubjects = async (req, res) => {
  try {
    const { year } = req.query;
    const chapters = await prisma.chapter.findMany({
      where: year && year !== 'All' ? { year } : {},
      select: { subject: true },
      distinct: ['subject'],
    });
    res.json(['All', ...chapters.map((c) => c.subject)]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};

const updateRevision = async (req, res) => {
  try {
    const chapterId = parseInt(req.params.chapterId, 10);
    const { status } = req.body;

    if (!validateRevisionStatus(status)) {
      return res.status(400).json({ message: 'Invalid status. Use NOT_STARTED, IN_PROGRESS, REVISED, or MASTERED.' });
    }

    const existing = await prisma.revision.findUnique({
      where: { userId_chapterId: { userId: req.user.userId, chapterId } },
    });

    const revision = await prisma.revision.upsert({
      where: { userId_chapterId: { userId: req.user.userId, chapterId } },
      create: {
        userId: req.user.userId,
        chapterId,
        status,
        revisionCount: ['REVISED', 'MASTERED'].includes(status) ? 1 : 0,
        lastRevisedAt: new Date(),
      },
      update: {
        status,
        revisionCount: {
          increment: ['REVISED', 'MASTERED'].includes(status) && existing?.status !== status ? 1 : 0,
        },
        lastRevisedAt: new Date(),
      },
    });

    if (status === 'MASTERED' && existing?.status !== 'MASTERED') {
      const today = new Date().toDateString();
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const lastMastered = existing?.lastRevisedAt?.toDateString();
      if (lastMastered !== today) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { streak: (user?.streak || 0) + 1 },
        });
      }
    }

    res.json(revision);
  } catch (error) {
    console.error('Revision update error:', error);
    res.status(500).json({ message: 'Failed to update revision' });
  }
};

module.exports = { getRevisions, getSubjects, updateRevision };
