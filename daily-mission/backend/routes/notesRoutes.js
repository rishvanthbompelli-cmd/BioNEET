const express = require('express');
const {
  getNotes, getNoteById, createNote, updateNote, deleteNote, toggleFavorite,
} = require('../controllers/notesController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
