const express = require('express');
const { sendMessage, getHistory } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(authMiddleware);

router.post('/', chatLimiter, sendMessage);
router.get('/history', getHistory);

module.exports = router;
