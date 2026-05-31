const express = require('express');
const { getNotes, getNoteById, toggleFavorite, createNote } = require('../controllers/notesController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.patch('/:id/favorite', authMiddleware, toggleFavorite);
router.post('/', authMiddleware, adminMiddleware, createNote);

module.exports = router;
