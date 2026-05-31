const express = require('express');
const { getFormulas, getDiagrams, getHandbooks, getChapters } = require('../controllers/contentController');

const router = express.Router();
router.get('/formulas', getFormulas);
router.get('/diagrams', getDiagrams);
router.get('/handbooks', getHandbooks);
router.get('/chapters', getChapters);

module.exports = router;
