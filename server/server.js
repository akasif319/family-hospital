const crypto = require('crypto');
global.crypto = crypto;
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ NEW: Serve frontend static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '..')));

// ✅ NEW: Serve all HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'about.html'));
});

app.get('/doctors', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'doctors.html'));
});

app.get('/appointment', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'appointment.html'));
});

// ✅ NEW: Test MongoDB connection endpoint
app.get('/test-db', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        await mongoose.connection.db.admin().ping();
        res.json({ 
            status: 'success', 
            message: 'MongoDB connected successfully! ✅' 
        });
    } catch (error) {
        res.json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// API Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve admin panel as static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Redirect /admin to login page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// If no route matches, return 404 for API calls
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('🚀 Server running at http://localhost:' + PORT);
        console.log('📋 Admin panel at http://localhost:' + PORT + '/admin');
    });
}).catch(err => {
    console.error('Failed to start server:', err.message);
});