const prisma = require('../utils/prisma');
const { sendUpdateEmail } = require('./emailService');

/**
 * Create a single in-app notification for a user.
 */
async function createNotification({ userId, type = 'SYSTEM', title, message, link = null }) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

/**
 * Broadcast a notification to every user. Optionally also email each user
 * (fire-and-forget — never blocks the request).
 */
async function broadcastNotification({ type = 'UPDATE', title, message, link = null, sendEmail = false }) {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  if (users.length === 0) return { created: 0 };

  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, type, title, message, link })),
  });

  if (sendEmail) {
    users.forEach((u) => {
      sendUpdateEmail(u.email, title, `<p style="line-height:1.6;">${message}</p>${link ? `<p><a href="${link}" style="color:#34d399;">View in BioNEET &rarr;</a></p>` : ''}`).catch(() => {});
    });
  }

  return { created: users.length };
}

module.exports = { createNotification, broadcastNotification };
