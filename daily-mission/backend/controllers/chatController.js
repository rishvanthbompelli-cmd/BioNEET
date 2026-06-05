const prisma = require('../utils/prisma');
const { chatWithAssistant, analyzeImage } = require('../services/aiService');
const { sanitizeString } = require('../utils/validate');

const sendMessage = async (req, res) => {
  try {
    const message = sanitizeString(req.body.message, 2000);
    const sessionId = sanitizeString(req.body.sessionId || 'default', 100);
    const imageUrl = req.body.imageUrl ? sanitizeString(req.body.imageUrl, 500) : null;
    const imageData = req.body.imageData || null;

    if (!message && !imageUrl && !imageData) {
      return res.status(400).json({ message: 'Message or image is required' });
    }

    const userId = req.user.userId;
    const history = await prisma.chatMessage.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const storedImageUrl = imageData || imageUrl;
    await prisma.chatMessage.create({
      data: { userId, role: 'user', content: message || '[Image]', imageUrl: storedImageUrl, sessionId },
    });

    let reply;
    if (imageData || imageUrl) {
      reply = await analyzeImage(imageData || imageUrl, message || 'Analyze this image for NEET/EAPCET BiPC content');
    } else {
      reply = await chatWithAssistant(message, history);
    }

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
