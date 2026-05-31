const prisma = require('../utils/prisma');

const getRevisions = async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({ orderBy: [{ subject: 'asc' }, { name: 'asc' }] });
    const userRevisions = await prisma.revision.findMany({ where: { userId: req.user.userId } });
    const revisionMap = Object.fromEntries(userRevisions.map((r) => [r.chapterId, r]));

    const data = chapters.map((c) => ({
      chapterId: c.id,
      name: c.name,
      subject: c.subject,
      weightage: c.weightage,
      status: revisionMap[c.id]?.status || 'NOT_STARTED',
      revisionCount: revisionMap[c.id]?.revisionCount || 0,
      lastRevisedAt: revisionMap[c.id]?.lastRevisedAt || null,
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revisions' });
  }
};

const updateRevision = async (req, res) => {
  try {
    const chapterId = parseInt(req.params.chapterId, 10);
    const { status } = req.body;

    const revision = await prisma.revision.upsert({
      where: {
        userId_chapterId: { userId: req.user.userId, chapterId },
      },
      create: {
        userId: req.user.userId,
        chapterId,
        status,
        revisionCount: status === 'COMPLETED' ? 1 : 0,
        lastRevisedAt: new Date(),
      },
      update: {
        status,
        revisionCount: { increment: status === 'COMPLETED' ? 1 : 0 },
        lastRevisedAt: new Date(),
      },
    });

    if (status === 'COMPLETED') {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { streak: (user?.streak || 0) + 1 },
      });
    }

    res.json(revision);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update revision' });
  }
};

module.exports = { getRevisions, updateRevision };
