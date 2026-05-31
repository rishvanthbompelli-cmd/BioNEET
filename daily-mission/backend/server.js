const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const { generalLimiter } = require('./middleware/rateLimiter');

const corsOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use('/papers', express.static(path.join(__dirname, '../frontend/public/papers')));

app.get('/api/health', async (req, res) => {
  try {
    const prisma = require('./utils/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'BioNEET API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      message: 'BioNEET API running but database unreachable',
      database: 'disconnected',
    });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notes', require('./routes/notesRoutes'));
app.use('/api/mcqs', require('./routes/mcqRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/mock-tests', require('./routes/mockTestRoutes'));
app.use('/api/revisions', require('./routes/revisionRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/papers', require('./routes/papersRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`BioNEET server running on port ${PORT}`);
});
