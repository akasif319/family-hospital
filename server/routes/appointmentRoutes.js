const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment'); // <--- ADDED THIS
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const adminAuth = require('../middleware/authMiddleware');
const userAuth = require('../middleware/authMiddleware'); // <--- ADDED THIS (Using the same auth logic)

// POST /api/appointments - Create appointment (public)
router.post('/', createAppointment);

// GET /api/appointments - Get all appointments (admin only)
router.get('/', adminAuth, getAppointments);

// GET /api/appointments/my - Get current user's appointments
router.get('/my', userAuth, async (req, res) => {
    try {
        // req.user.id comes from your userAuth middleware (JWT decoding)
        const appointments = await Appointment.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
});

// GET /api/appointments/booked?doctor=xxx&date=2025-07-14 (public)
router.get('/booked', async (req, res) => {
    try {
        const { doctor, date } = req.query;
        if (!doctor || !date) return res.json([]);

        const appointments = await Appointment.find({
            doctor: doctor,
            date: date,
            status: { $ne: 'cancelled' }
        }).select('time');

        res.json(appointments.map(a => a.time));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch slots' });
    }
});

// PUT /api/appointments/:id/status - Update status (admin only)
router.put('/:id/status', adminAuth, updateAppointmentStatus);

module.exports = router;