require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const paperRoutes = require('./routes/papersRoutes');
const documentRoutes = require('./routes/documentRoutes');
const notesRoutes = require('./routes/notesRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const contentRoutes = require('./routes/contentRoutes');
const revisionRoutes = require('./routes/revisionRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const prisma = require('./utils/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'BioNEET API running', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database not connected', database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/mock-tests', mockTestRoutes);

app.get('/', (req, res) => {
  res.send('BioNEET Backend Server is Running!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BioNEET server running on port ${PORT}`);
});
