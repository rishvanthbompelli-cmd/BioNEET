const express = require('express');
const cors = require('cors');

// 1. IMPORT YOUR ACTUAL ROUTE FILES HERE
const authRoutes = require('./routes/authRoutes'); // Make sure this path matches your project structure!
const paperRoutes = require('./routes/paperRoutes'); // Import your papers filters route too

const app = express();

// Advanced Dynamic CORS Configuration (Leave this exactly as it is)
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

// 2. LINK THE ROUTES TO THE EXPRESS APP HERE
app.use('/api/auth', authRoutes);      // Links /api/auth/register
app.use('/api/papers', paperRoutes);  // Links /api/papers/filters

app.get('/', (req, res) => {
    res.send('BioNEET Backend Server is Running Perfectly!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});