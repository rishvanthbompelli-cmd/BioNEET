const express = require('express');
const {
  getFormulas,
  getDiagrams,
  getHandbooks,
  getChapters,
  getSyllabusSummary,
} = require('../controllers/contentController');

const router = express.Router();
router.get('/formulas', getFormulas);
router.get('/diagrams', getDiagrams);
router.get('/handbooks', getHandbooks);
router.get('/chapters', getChapters);
router.get('/syllabus-summary', getSyllabusSummary);

module.exports = router;
