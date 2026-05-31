const prisma = require('../utils/prisma');

const getAdminStats = async (req, res) => {
  try {
    const [users, notes, mcqs, mockTests, diagrams] = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.mcq.count(),
      prisma.mockTest.count(),
      prisma.diagram.count(),
    ]);
    res.json({ users, notes, mcqs, mockTests, diagrams });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, streak: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const createMcq = async (req, res) => {
  try {
    const mcq = await prisma.mcq.create({ data: req.body });
    res.status(201).json(mcq);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create MCQ' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = await prisma.announcement.create({ data: { title, content } });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

module.exports = { getAdminStats, getUsers, createMcq, createAnnouncement, getAnnouncements };
