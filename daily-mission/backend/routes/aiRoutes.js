const express = require('express');
const {
  createStudyPlan,
  getStudyPlans,
  generateQuizHandler,
  getQuizzes,
} = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.post('/study-plan', createStudyPlan);
router.get('/study-plans', getStudyPlans);
router.post('/quiz', generateQuizHandler);
router.get('/quizzes', getQuizzes);

module.exports = router;
