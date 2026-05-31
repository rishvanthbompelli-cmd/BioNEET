const prisma = require('../utils/prisma');

const getNotes = async (req, res) => {
  try {
    const { subject, search } = req.query;
    const notes = await prisma.note.findMany({
      where: {
        ...(subject && subject !== 'All' ? { subject } : {}),
        ...(search ? { title: { contains: search } } : {}),
      },
      include: { chapter: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { chapter: true },
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: parseInt(req.params.id, 10) } });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const updated = await prisma.note.update({
      where: { id: note.id },
      data: { isFavorite: !note.isFavorite },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, subject, chapterId, highlights, memoryTrick } = req.body;
    const note = await prisma.note.create({
      data: {
        title,
        content,
        subject,
        chapterId: chapterId ? parseInt(chapterId, 10) : null,
        highlights,
        memoryTrick,
        userId: req.user.userId,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note' });
  }
};

module.exports = { getNotes, getNoteById, toggleFavorite, createNote };
