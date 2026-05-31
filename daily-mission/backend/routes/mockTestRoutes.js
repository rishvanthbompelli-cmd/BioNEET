const express = require('express');
const { getMockTests, getMockTestById, submitMockTest } = require('../controllers/mockTestController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', getMockTests);
router.get('/:id', authMiddleware, getMockTestById);
router.post('/:id/submit', authMiddleware, submitMockTest);

module.exports = router;
