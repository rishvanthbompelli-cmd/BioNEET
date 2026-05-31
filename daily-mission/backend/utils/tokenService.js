const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('./prisma');

const ACCESS_EXPIRY = '15m';
const REFRESH_DAYS = 30;

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

async function createTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return { accessToken, refreshToken };
}

async function refreshAccessToken(refreshToken) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) return null;

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  return createTokenPair(user);
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    streak: user.streak,
    examMode: user.examMode,
    dailyHours: user.dailyHours,
    targetRank: user.targetRank,
    weakSubjects: user.weakSubjects,
  };
}

module.exports = {
  signAccessToken,
  createTokenPair,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  formatUser,
};
