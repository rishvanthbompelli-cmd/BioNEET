const express = require('express');
const { getRevisions, updateRevision } = require('../controllers/revisionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.get('/', getRevisions);
router.put('/:chapterId', updateRevision);

module.exports = router;
