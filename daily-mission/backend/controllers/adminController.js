const prisma = require('../utils/prisma');
const { sanitizeString, validateSubject } = require('../utils/validate');

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, users, notesCount, papersCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.note.count({ where: { isShared: true } }),
      prisma.examPaper.count(),
    ]);

    res.json({
      totalUsers,
      users,
      notesCount,
      papersCount,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [users, notes, mcqs, mockTests, diagrams, papers] = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.mcq.count(),
      prisma.mockTest.count(),
      prisma.diagram.count(),
      prisma.examPaper.count(),
    ]);
    res.json({ users, notes, mcqs, mockTests, diagrams, papers });
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

const createAdminNote = async (req, res) => {
  try {
    const title = sanitizeString(req.body.title, 200);
    const content = sanitizeString(req.body.content, 10000);
    const subject = req.body.subject;
    const { highlights, memoryTrick } = req.body;

    if (!title || !content || !validateSubject(subject) || subject === 'All') {
      return res.status(400).json({ message: 'Title, content, and valid subject required' });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        subject,
        highlights: highlights ? sanitizeString(highlights, 1000) : null,
        memoryTrick: memoryTrick ? sanitizeString(memoryTrick, 500) : null,
        userId: req.user.userId,
        isShared: true,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Admin create note error:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
};

const createAdminPaper = async (req, res) => {
  try {
    const title = sanitizeString(req.body.title, 300);
    const fileUrl = sanitizeString(req.body.fileUrl, 500);
    const state = sanitizeString(req.body.state || 'AP', 10).toUpperCase();
    const year = parseInt(req.body.year, 10) || new Date().getFullYear();
    const subject = sanitizeString(req.body.subject || 'BiPC', 50);
    const shift = req.body.shift ? sanitizeString(req.body.shift, 50) : null;

    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Title and file URL are required' });
    }

    const paper = await prisma.examPaper.create({
      data: { title, fileUrl, state, year, subject, shift, examType: 'EAPCET' },
    });
    res.status(201).json(paper);
  } catch (error) {
    console.error('Admin create paper error:', error);
    res.status(500).json({ message: 'Failed to create paper' });
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

const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

const deleteNote = async (req, res) => {
  try {
    await prisma.note.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

const deletePaper = async (req, res) => {
  try {
    await prisma.examPaper.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete paper' });
  }
};

const createMockTest = async (req, res) => {
  try {
    const { title, durationMinutes, totalQuestions, instructions, fileUrl } = req.body;
    if (!title || !durationMinutes || !totalQuestions) {
      return res.status(400).json({ message: 'Title, durationMinutes, and totalQuestions are required' });
    }
    const mockTest = await prisma.mockTest.create({
      data: {
        title: sanitizeString(title, 200),
        durationMinutes: parseInt(durationMinutes, 10),
        totalQuestions: parseInt(totalQuestions, 10),
        instructions: instructions ? sanitizeString(instructions, 2000) : null,
        fileUrl: fileUrl ? sanitizeString(fileUrl, 500) : null,
      },
    });
    res.status(201).json(mockTest);
  } catch (error) {
    console.error('Admin create mock test error:', error);
    res.status(500).json({ message: 'Failed to create mock test' });
  }
};

const createFormula = async (req, res) => {
  try {
    const { chapter, subject, expression, description } = req.body;
    if (!subject || !expression) {
      return res.status(400).json({ message: 'Subject and expression are required' });
    }
    const formula = await prisma.formula.create({
      data: {
        chapter: chapter ? sanitizeString(chapter, 100) : null,
        subject: sanitizeString(subject, 50),
        expression: sanitizeString(expression, 1000),
        description: description ? sanitizeString(description, 2000) : null,
      },
    });
    res.status(201).json(formula);
  } catch (error) {
    console.error('Admin create formula error:', error);
    res.status(500).json({ message: 'Failed to create formula' });
  }
};

const createDiagram = async (req, res) => {
  try {
    const { title, category, imageUrl, labels } = req.body;
    if (!title || !imageUrl || !labels) {
      return res.status(400).json({ message: 'Title, imageUrl, and labels are required' });
    }
    const diagram = await prisma.diagram.create({
      data: {
        title: sanitizeString(title, 200),
        category: sanitizeString(category || 'general', 50),
        imageUrl: sanitizeString(imageUrl, 500),
        labels: sanitizeString(labels, 2000),
      },
    });
    res.status(201).json(diagram);
  } catch (error) {
    console.error('Admin create diagram error:', error);
    res.status(500).json({ message: 'Failed to create diagram' });
  }
};

const createHandbook = async (req, res) => {
  try {
    const { title, subject, fileUrl } = req.body;
    if (!title || !subject || !fileUrl) {
      return res.status(400).json({ message: 'Title, subject, and fileUrl are required' });
    }
    const handbook = await prisma.handbook.create({
      data: {
        title: sanitizeString(title, 200),
        subject: sanitizeString(subject, 50),
        fileUrl: sanitizeString(fileUrl, 500),
      },
    });
    res.status(201).json(handbook);
  } catch (error) {
    console.error('Admin create handbook error:', error);
    res.status(500).json({ message: 'Failed to create handbook' });
  }
};

module.exports = {
  getDashboardStats,
  getAdminStats,
  getUsers,
  createAdminNote,
  createAdminPaper,
  createMcq,
  createAnnouncement,
  getAnnouncements,
  deleteUser,
  deleteNote,
  deletePaper,
  createMockTest,
  createFormula,
  createDiagram,
  createHandbook,
};
