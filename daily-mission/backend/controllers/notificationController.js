const prisma = require('../utils/prisma');

const PAGE_SIZE = 20;

const getNotifications = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const skip = (parseInt(page, 10) - 1) * PAGE_SIZE;
    const userId = req.user.userId;

    const [items, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.notification.count({ where: { userId } }),
    ]);

    res.json({ items, unreadCount, total, hasMore: skip + items.length < total });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const markRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id, all } = req.body || {};

    if (all) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return res.json({ message: 'All notifications marked as read' });
    }

    if (!id) return res.status(400).json({ message: 'Notification id required' });

    await prisma.notification.updateMany({
      where: { id: parseInt(id, 10), userId },
      data: { read: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    await prisma.notification.deleteMany({
      where: { id: parseInt(req.params.id, 10), userId },
    });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

/**
 * Admin: broadcast an important update to all users (in-app + optional email).
 */
const broadcast = async (req, res) => {
  try {
    const { title, message, link, sendEmail } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    const result = await require('../services/notificationService').broadcastNotification({
      type: 'UPDATE',
      title: sanitize(req.body.title, 200),
      message: sanitize(req.body.message, 2000),
      link: link ? String(link).slice(0, 500) : null,
      sendEmail: sendEmail === true || sendEmail === 'true',
    });
    res.json({ message: `Notification sent to ${result.created} users`, result });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Failed to broadcast notification' });
  }
};

function sanitize(str, maxLen = 1000) {
  return typeof str === 'string' ? str.trim().slice(0, maxLen) : '';
}

module.exports = { getNotifications, markRead, deleteNotification, broadcast };
