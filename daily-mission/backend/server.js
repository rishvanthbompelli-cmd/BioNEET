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

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes('localhost') || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

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
    res.send('BioNEET Backend Server is Running Perfectly!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});