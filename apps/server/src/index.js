const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');

const app = express();

// Create uploads directory only if NOT running on Vercel
if (!process.env.VERCEL && !fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
}

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle static uploads only if directory exists
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (fs.existsSync(uploadsPath)) {
    app.use('/uploads', express.static(uploadsPath));
}

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/quiz', require('./routes/quiz.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.VERCEL ? 'vercel' : 'local' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().catch(err => {
    console.error('Database connection error:', err);
});

// Conditionally start the server if not running on Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// Export the app for Vercel serverless functions
module.exports = app;
