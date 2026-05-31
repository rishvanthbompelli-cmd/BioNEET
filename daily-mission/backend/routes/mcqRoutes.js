const express = require('express');
const { getMcqs, submitAttempt, getLeaderboard } = require('../controllers/mcqController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', getMcqs);
router.get('/leaderboard', getLeaderboard);
router.post('/:id/attempt', authMiddleware, submitAttempt);

module.exports = router;
