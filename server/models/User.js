const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String, default: null },
    verifyTokenExpiry: { type: Date, default: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
