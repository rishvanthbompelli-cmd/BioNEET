const express = require('express');
const {
  getAdminStats,
  getUsers,
  createMcq,
  createAnnouncement,
  getAnnouncements,
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/announcements', getAnnouncements);
router.use(authMiddleware, adminMiddleware);
router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.post('/mcqs', createMcq);
router.post('/announcements', createAnnouncement);

module.exports = router;
