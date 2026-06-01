const express = require('express');
const cors = require('cors');
// Import your database setup (prisma or mysql connection) and custom routes below
// const authRoutes = require('./routes/authRoutes'); 

const app = express();

// ----------------------------------------------------------------
// 🛠️ FIX: ADVANCED DYNAMIC CORS CONFIGURATION
// This auto-accepts your local localhost and ANY Vercel link you use!
// ----------------------------------------------------------------
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or postman)
        if (!origin) return callback(null, true);
        
        // If the request comes from localhost or ANY vercel domain, allow it
        if (origin.includes('localhost') || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Crucial for storing session tokens or cookies safely
}));

// Express middleware to parse json data (Crucial for registration body)
app.use(express.json());

// ----------------------------------------------------------------
// 🚀 YOUR API ROUTES (Ensure your actual routes are attached here)
// ----------------------------------------------------------------
// app.use('/api/auth', authRoutes);

// Simple Health Check Route
app.get('/', (req, res) => {
    res.send('BioNEET Backend Server is Running Perfectly!');
});

// Port listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});