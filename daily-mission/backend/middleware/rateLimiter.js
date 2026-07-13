const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { message: 'Chat rate limit reached. Please wait a moment.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many contact submissions, please try again later.' },
});

module.exports = { generalLimiter, authLimiter, chatLimiter, contactLimiter };
