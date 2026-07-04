require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS - Allow all origins for production
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import Routes
const authRoutes = require('./src/routes/auth');
const projectRoutes = require('./src/routes/projects');
const judgeRoutes = require('./src/routes/judge');
const ratingRoutes = require('./src/routes/ratings');
const adminRoutes = require('./src/routes/admin');
const teacherRoutes = require('./src/routes/teacher');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Science Fair API is running!' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: /api/health`);
});