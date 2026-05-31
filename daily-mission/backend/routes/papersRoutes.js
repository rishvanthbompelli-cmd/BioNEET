const express = require('express');
const { getPapers, getPaperFilters } = require('../controllers/papersController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/filters', getPaperFilters);
router.get('/', authMiddleware, getPapers);

module.exports = router;
