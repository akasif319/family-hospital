const Appointment = require('../models/Appointment');

// Create new appointment (public - from website form)
const createAppointment = async (req, res) => {
    try {
        const { doctor, patientName, patientEmail, patientPhone, patientDOB,
                patientGender, patientBloodGroup, reason, date, time,
                insuranceProvider, insurancePolicy } = req.body;

        // Generate reference number
        const refNum = 'FH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000);

        const appointment = new Appointment({
            reference: refNum,
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