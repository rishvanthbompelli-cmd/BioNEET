const prisma = require('../utils/prisma');
const { chatWithAssistant } = require('../services/aiService');
const { sanitizeString } = require('../utils/validate');

const sendMessage = async (req, res) => {
  try {
    const message = sanitizeString(req.body.message, 2000);
    const sessionId = sanitizeString(req.body.sessionId || 'default', 100);

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userId = req.user.userId;
    const history = await prisma.chatMessage.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    await prisma.chatMessage.create({
      data: { userId, role: 'user', content: message, sessionId },
    });

    const reply = await chatWithAssistant(message, history);

    await prisma.chatMessage.create({
      data: { userId, role: 'assistant', content: reply, sessionId },
    });

    res.json({ reply, sessionId });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to process chat message' });
  }
};

const getHistory = async (req, res) => {
  try {
    const sessionId = sanitizeString(req.query.sessionId || 'default', 100);
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user.userId, sessionId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

module.exports = { sendMessage, getHistory };
