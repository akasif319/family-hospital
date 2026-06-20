const crypto = require('crypto');
global.crypto = crypto;
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviewRoutes');

const { deepSanitize } = require('./utils/sanitize');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE (Must be at the top)
// ==========================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') req.body = deepSanitize(req.body);
    if (req.query && typeof req.query === 'object') req.query = deepSanitize(req.query);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..')));

// ==========================================
// 2. YOUR SPECIFIC ROUTES (Middle)
// ==========================================

// Test DB Route
app.get('/test-db', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        await mongoose.connection.db.admin().ping();
        res.json({ status: 'success', message: 'MongoDB connected successfully! ✅' });
    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }
});

// Frontend HTML Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '..', 'about.html')));
app.get('/doctors', (req, res) => res.sendFile(path.join(__dirname, '..', 'doctors.html')));
app.get('/appointment', (req, res) => res.sendFile(path.join(__dirname, '..', 'appointment.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, '..', 'services.html')));
app.get('/my-appointments', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'my-appointments.html'));
});

// API Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve admin panel under a secret URL
app.use('/hospital-secure-portal-x9k2', express.static(path.join(__dirname, 'admin')));

// Redirect secret URL to login page
app.get('/hospital-secure-portal-x9k2', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// ==========================================
// 3. CATCH-ALL 404 HANDLERS (MUST BE DEAD LAST!)
// ==========================================
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});
// ==========================================
// ENSURE UPLOADS FOLDER EXISTS
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('📁 Created missing uploads folder');
}

// Error handling middleware (Catches multer crashes)
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({ message: err.message || 'Internal server error' });
});



// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('🚀 Server running at http://localhost:' + PORT);
    });
}).catch(err => console.error('DB Connection Failed:', err));