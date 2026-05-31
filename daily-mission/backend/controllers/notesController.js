const prisma = require('../utils/prisma');
const { sanitizeString, validateSubject } = require('../utils/validate');

const getNotes = async (req, res) => {
  try {
    const { subject, search } = req.query;
    const userId = req.user.userId;

    const notes = await prisma.note.findMany({
      where: {
        OR: [{ isShared: true }, { userId }],
        ...(subject && subject !== 'All' ? { subject } : {}),
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: { chapter: { select: { name: true } } },
      orderBy: [{ isShared: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

const getNoteById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const note = await prisma.note.findFirst({
      where: {
        id,
        OR: [{ isShared: true }, { userId }],
      },
      include: { chapter: true },
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

const createNote = async (req, res) => {
  try {
    const title = sanitizeString(req.body.title, 200);
    const content = sanitizeString(req.body.content, 10000);
    const subject = req.body.subject;
    const { highlights, memoryTrick, chapterId } = req.body;

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
        chapterId: chapterId ? parseInt(chapterId, 10) : null,
        userId: req.user.userId,
        isShared: req.user.role === 'ADMIN' && req.body.isShared === true,
      },
      include: { chapter: { select: { name: true } } },
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Note not found' });
    if (existing.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, subject, highlights, memoryTrick, chapterId } = req.body;
    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title && { title: sanitizeString(title, 200) }),
        ...(content && { content: sanitizeString(content, 10000) }),
        ...(subject && validateSubject(subject) && subject !== 'All' && { subject }),
        ...(highlights !== undefined && { highlights: highlights ? sanitizeString(highlights, 1000) : null }),
        ...(memoryTrick !== undefined && { memoryTrick: memoryTrick ? sanitizeString(memoryTrick, 500) : null }),
        ...(chapterId !== undefined && { chapterId: chapterId ? parseInt(chapterId, 10) : null }),
      },
      include: { chapter: { select: { name: true } } },
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Note not found' });
    if (existing.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (existing.isShared && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Cannot delete shared notes' });
    }

    await prisma.note.delete({ where: { id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const note = await prisma.note.findFirst({
      where: { id, OR: [{ isShared: true }, { userId }] },
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const updated = await prisma.note.update({
      where: { id },
      data: { isFavorite: !note.isFavorite },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note' });
  }
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote, toggleFavorite };
