const express = require('express');
const { getRevisions, getSubjects, updateRevision } = require('../controllers/revisionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/subjects', getSubjects);
router.get('/', getRevisions);
router.put('/:chapterId', updateRevision);

module.exports = router;
