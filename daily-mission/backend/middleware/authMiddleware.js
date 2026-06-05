const jwt = require('jsonwebtoken');
const { isAdminEmail } = require('../utils/adminConfig');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user?.email || !isAdminEmail(req.user.email)) {
    return res.status(403).json({ message: 'Forbidden: Admin access restricted to authorized account only' });
  }
  next();
};

const adminMiddleware = isAdmin;

module.exports = { authMiddleware, isAdmin, adminMiddleware };
