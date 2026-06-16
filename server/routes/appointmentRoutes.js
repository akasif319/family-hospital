const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const adminAuth = require('../middleware/authMiddleware');

// POST /api/appointments - Create appointment (public)
router.post('/', createAppointment);

// GET /api/appointments - Get all appointments (admin only)
router.get('/', adminAuth, getAppointments);

// PUT /api/appointments/:id/status - Update status (admin only)
router.put('/:id/status', adminAuth, updateAppointmentStatus);

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

module.exports = router;