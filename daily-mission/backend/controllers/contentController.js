const prisma = require('../utils/prisma');

const getFormulas = async (req, res) => {
  try {
    const { subject, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const formulas = await prisma.formula.findMany({
      where: subject && subject !== 'All' ? { subject } : {},
      select: {
        id: true,
        chapter: true,
        subject: true,
        expression: true,
        description: true,
        title: true,
        category: true,
        shortcut: true,
        imageUrl: true,
      },
      orderBy: { subject: 'asc' },
      skip,
      take,
    });
    res.json(formulas);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch formulas' });
  }
};

const getDiagrams = async (req, res) => {
  try {
    const { subject, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const diagrams = await prisma.diagram.findMany({
      where: subject && subject !== 'All' ? { subject } : {},
      select: {
        id: true,
        title: true,
        category: true,
        imageUrl: true,
        labels: true,
        subject: true,
      },
      skip,
      take,
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
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const handbooks = await prisma.handbook.findMany({ 
      select: {
        id: true,
        title: true,
        subject: true,
        fileUrl: true,
        category: true,
        content: true,
      },
      orderBy: { subject: 'asc' },
      skip,
      take,
    });
    res.json(handbooks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch handbooks' });
  }
};

const getChapters = async (req, res) => {
  try {
    const { subject, year } = req.query;
    const chapters = await prisma.chapter.findMany({
      where: {
        ...(subject && subject !== 'All' ? { subject } : {}),
        ...(year && year !== 'All' ? { year } : {}),
      },
      orderBy: [{ year: 'asc' }, { subject: 'asc' }, { orderIndex: 'asc' }],
    });
    res.json(
      chapters.map((c) => ({
        ...c,
        linkedChapters: c.linkedChapters ? JSON.parse(c.linkedChapters) : [],
        yearLabel: c.year === 'INTER_1' ? 'Inter 1st Year' : 'Inter 2nd Year',
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chapters' });
  }
};

const getSyllabusSummary = async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({ orderBy: { orderIndex: 'asc' } });
    const summary = {
      INTER_1: { Botany: 0, Zoology: 0, Physics: 0, Chemistry: 0 },
      INTER_2: { Botany: 0, Zoology: 0, Physics: 0, Chemistry: 0 },
      total: chapters.length,
      highPriority: chapters.filter((c) => c.isHighPriority).length,
      rankBooster: chapters.filter((c) => c.isRankBooster).length,
      mostDifficult: chapters.filter((c) => c.isMostDifficult).length,
    };
    chapters.forEach((c) => {
      if (summary[c.year]) summary[c.year][c.subject]++;
    });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch syllabus summary' });
  }
};

module.exports = { getFormulas, getDiagrams, getHandbooks, getChapters, getSyllabusSummary };
