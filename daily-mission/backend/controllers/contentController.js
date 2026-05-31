const prisma = require('../utils/prisma');

const getFormulas = async (req, res) => {
  try {
    const { subject } = req.query;
    const formulas = await prisma.formula.findMany({
      where: subject && subject !== 'All' ? { subject } : {},
      orderBy: { subject: 'asc' },
    });
    res.json(formulas);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch formulas' });
  }
};

const getDiagrams = async (req, res) => {
  try {
    const { subject } = req.query;
    const diagrams = await prisma.diagram.findMany({
      where: subject && subject !== 'All' ? { subject } : {},
    });
    res.json(
      diagrams.map((d) => ({
        ...d,
        labels: JSON.parse(d.labels || '[]'),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagrams' });
  }
};

const getHandbooks = async (req, res) => {
  try {
    const handbooks = await prisma.handbook.findMany({ orderBy: { subject: 'asc' } });
    res.json(handbooks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch handbooks' });
  }
};

const getChapters = async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({ orderBy: [{ subject: 'asc' }, { name: 'asc' }] });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chapters' });
  }
};

module.exports = { getFormulas, getDiagrams, getHandbooks, getChapters };
