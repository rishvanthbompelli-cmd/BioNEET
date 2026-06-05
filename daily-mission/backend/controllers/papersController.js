const prisma = require('../utils/prisma');

const getPapers = async (req, res) => {
  try {
    const { state, year, subject, page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const papers = await prisma.examPaper.findMany({
      where: {
        ...(state && state !== 'All' ? { state } : {}),
        ...(year ? { year: parseInt(year, 10) } : {}),
        ...(subject && subject !== 'All' ? { subject } : {}),
      },
      select: {
        id: true,
        title: true,
        state: true,
        year: true,
        subject: true,
        shift: true,
        fileUrl: true,
        examType: true,
      },
      orderBy: [{ state: 'asc' }, { year: 'desc' }, { sortOrder: 'asc' }],
      skip,
      take,
    });
    res.json(papers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ message: 'Failed to fetch papers' });
  }
};

const getPaperFilters = async (req, res) => {
  try {
    const papers = await prisma.examPaper.findMany({
      select: { state: true, year: true, subject: true },
    });
    const states = [...new Set(papers.map((p) => p.state))].sort();
    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);
    const subjects = [...new Set(papers.map((p) => p.subject))].sort();
    res.json({ states, years, subjects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch filters' });
  }
};

module.exports = { getPapers, getPaperFilters };
