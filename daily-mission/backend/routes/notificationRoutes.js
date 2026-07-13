const express = require('express');
const {
  getNotifications,
  markRead,
  deleteNotification,
  broadcast,
} = require('../controllers/notificationController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read', markRead);
router.delete('/:id', deleteNotification);

router.post('/broadcast', isAdmin, broadcast);

module.exports = router;
