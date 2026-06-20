const Appointment = require('../models/Appointment');
const jwt = require('jsonwebtoken');
const { exceedsLength } = require('../utils/sanitize');

// Create new appointment (public - from website form)
const createAppointment = async (req, res) => {
    try {
        const { doctor, patientName, patientEmail, patientPhone, patientDOB,
                patientGender, patientBloodGroup, reason, date, time,
                insuranceProvider, insurancePolicy } = req.body;

        if (!patientName || !patientEmail || !patientPhone || !doctor || !date || !time) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(patientEmail)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const phoneDigits = patientPhone.replace(/\D/g, '');
        if (phoneDigits.length < 7 || phoneDigits.length > 15) {
            return res.status(400).json({ message: 'Please provide a valid phone number' });
        }

        if (exceedsLength(patientName, 100)) return res.status(400).json({ message: 'Patient name must be 100 characters or fewer' });
        if (exceedsLength(patientPhone, 25)) return res.status(400).json({ message: 'Phone number too long' });
        if (exceedsLength(reason, 500)) return res.status(400).json({ message: 'Reason for visit must be 500 characters or fewer' });
        if (exceedsLength(insuranceProvider, 100)) return res.status(400).json({ message: 'Insurance provider name too long' });
        if (exceedsLength(insurancePolicy, 50)) return res.status(400).json({ message: 'Insurance policy number too long' });

        const refNum = 'FH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000);

        // ✅ NEW: Check if user is logged in by looking for a token in headers
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id; // Grab the user's ID from the token
            } catch (error) {
                // Token invalid, treat as guest
            }
        }

        const appointment = new Appointment({
            reference: refNum,
            user: userId, // ✅ NEW: Save the user ID (or null if guest)
            doctor,
            patientName,
            patientEmail,
            patientPhone,
            patientDOB: patientDOB || '',
            patientGender: patientGender || '',
            patientBloodGroup: patientBloodGroup || '',
            reason: reason || '',
            date,
            time,
            insuranceProvider: insuranceProvider || '',
            insurancePolicy: insurancePolicy || ''
        });

        const saved = await appointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', reference: refNum, appointment: saved });
    } catch (error) {
        res.status(500).json({ message: 'Failed to book appointment', error: error.message });
    }
};

// Get all appointments (admin only)
const getAppointments = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) filter.status = status;

        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name department')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
};

// Update appointment status (admin only)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment status updated', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update appointment', error: error.message });
    }
};

module.exports = { createAppointment, getAppointments, updateAppointmentStatus };