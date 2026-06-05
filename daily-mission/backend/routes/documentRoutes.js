const express = require('express');
const prisma = require('../utils/prisma');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, description, fileUrl, category } = req.body;
    if (!title || !fileUrl || !category) {
      return res.status(400).json({ message: 'Title, fileUrl, and category are required' });
    }
    const document = await prisma.document.create({
      data: { title, description, fileUrl, category },
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create document' });
  }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, category } = req.body;
    const document = await prisma.document.update({
      where: { id: parseInt(id) },
      data: { title, description, fileUrl, category },
    });
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update document' });
  }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.document.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

module.exports = router;
