const { getDashboardStats, getFullAnalytics } = require('../services/analyticsService');

const getDashboard = async (req, res) => {
  try {
    const data = await getDashboardStats(req.user.userId);
    res.json(data);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const data = await getFullAnalytics(req.user.userId);
    res.json(data);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};

module.exports = { getDashboard, getAnalytics };
