const express = require('express');
const { getDashboard, getAnalytics } = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

module.exports = router;
