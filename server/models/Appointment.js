const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: true,
        unique: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientEmail: {
        type: String,
        required: true
    },
    patientPhone: {
        type: String,
        required: true
    },
    patientDOB: {
        type: String,
        default: ''
    },
    patientGender: {
        type: String,
        default: ''
    },
    patientBloodGroup: {
        type: String,
        default: ''
    },
    reason: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    insuranceProvider: {
        type: String,
        default: ''
    },
    insurancePolicy: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);