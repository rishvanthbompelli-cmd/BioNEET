const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../utils/prisma');
const {
  createTokenPair,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  formatUser,
} = require('../utils/tokenService');
const { validateEmail, validatePassword, validateName, sanitizeString } = require('../utils/validate');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const registerUser = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 100);
    const email = sanitizeString(req.body.email, 200).toLowerCase();
    const { password } = req.body;

    if (!validateName(name) || !validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ message: 'Invalid name, email, or password (min 6 chars).' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'STUDENT' },
    });

    const { accessToken, refreshToken } = await createTokenPair(user);
    res.status(201).json({
      message: 'User registered successfully',
      token: accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = sanitizeString(req.body.email, 200).toLowerCase();
    const { password } = req.body;

    if (!validateEmail(email) || !password) {
      return res.status(400).json({ message: 'Please provide valid email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = await createTokenPair(user);
    res.json({
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

const googleLogin = async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(503).json({ message: 'Google login not configured. Set GOOGLE_CLIENT_ID in backend .env' });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account has no email' });
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email: email.toLowerCase() }] },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          googleId,
          role: 'STUDENT',
        },
      });
    }

    const { accessToken, refreshToken } = await createTokenPair(user);
    res.json({
      message: 'Google login successful',
      token: accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = sanitizeString(req.body.email, 200).toLowerCase();
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Valid email required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    console.log(`[Password Reset] ${email}: ${resetUrl}`);

    res.json({
      message: 'If that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !validatePassword(password)) {
      return res.status(400).json({ message: 'Valid token and password (min 6 chars) required' });
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    });
    await prisma.passwordReset.delete({ where: { id: reset.id } });
    await revokeAllUserTokens(reset.userId);

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, name: true, email: true, role: true, streak: true,
        examMode: true, dailyHours: true, targetRank: true, weakSubjects: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, examMode, dailyHours, targetRank, weakSubjects } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && validateName(name) && { name: sanitizeString(name, 100) }),
        ...(examMode && { examMode }),
        ...(dailyHours && { dailyHours: parseInt(dailyHours, 10) }),
        ...(targetRank && { targetRank: parseInt(targetRank, 10) }),
        ...(weakSubjects && { weakSubjects: JSON.stringify(weakSubjects) }),
      },
      select: {
        id: true, name: true, email: true, role: true, streak: true,
        examMode: true, dailyHours: true, targetRank: true, weakSubjects: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenHandler,
  logoutUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};
