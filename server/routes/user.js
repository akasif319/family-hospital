const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const https = require('https');
const User = require('../models/User');
const { sendVerificationEmail, sendOtpEmail, sendPasswordResetEmail } = require('../utils/mailer');

async function verifyRecaptcha(token) {
    return new Promise((resolve) => {
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const postData = `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`;
        const options = {
            hostname: 'www.google.com',
            path: '/recaptcha/api/siteverify',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.success === true);
                } catch {
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.write(postData);
        req.end();
    });
}

// POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dateOfBirth, password, recaptchaToken } = req.body;

        const captchaOk = await verifyRecaptcha(recaptchaToken || '');
        if (!captchaOk) return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });

        const existing = await User.findOne({ email });
        if (existing) {
            if (!existing.isVerified) {
                const verifyToken = crypto.randomBytes(32).toString('hex');
                existing.verifyToken = verifyToken;
                existing.verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
                existing.firstName = firstName;
                existing.lastName = lastName;
                existing.phone = phone || existing.phone;
                existing.dateOfBirth = dateOfBirth || existing.dateOfBirth;
                existing.password = await bcrypt.hash(password, 10);
                await existing.save();
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                await sendVerificationEmail(email, firstName, verifyToken, baseUrl);
                return res.status(201).json({ message: 'Account created! Please check your email to verify your account.' });
            }
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = new User({
            firstName,
            lastName,
            email,
            phone: phone || '',
            dateOfBirth: dateOfBirth || '',
            password: hashedPassword,
            isVerified: false,
            verifyToken,
            verifyTokenExpiry
        });
        await user.save();

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        await sendVerificationEmail(email, firstName, verifyToken, baseUrl);

        res.status(201).json({ message: 'Account created! Please check your email to verify your account.' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// GET /api/users/verify-email?token=...
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verifyToken: token, verifyTokenExpiry: { $gt: new Date() } });

        if (!user) {
            return res.send(`<!DOCTYPE html><html><head><title>Verification Failed</title>
            <style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;}
            .box{background:#fff;border-radius:12px;padding:40px;text-align:center;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.08);}
            h2{color:#BA1A1A;}p{color:#42474F;}a{color:#0F4C81;font-weight:600;}</style></head>
            <body><div class="box"><h2>Link Expired</h2><p>This verification link is invalid or has expired.</p><a href="/signup.html">Register again</a></div></body></html>`);
        }

        user.isVerified = true;
        user.verifyToken = null;
        user.verifyTokenExpiry = null;
        await user.save();

        res.send(`<!DOCTYPE html><html><head><title>Email Verified</title>
        <style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;}
        .box{background:#fff;border-radius:12px;padding:40px;text-align:center;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.08);}
        h2{color:#166534;}p{color:#42474F;}a{display:inline-block;margin-top:16px;background:#0F4C81;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;}</style></head>
        <body><div class="box"><h2>✅ Email Verified!</h2><p>Your account is now active. You can log in.</p><a href="/login.html">Sign In</a></div></body></html>`);
    } catch (error) {
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
});

// POST /api/users/login — step 1: verify credentials, send OTP
router.post('/login', async (req, res) => {
    try {
        const { email, password, recaptchaToken } = req.body;

        const captchaOk = await verifyRecaptcha(recaptchaToken || '');
        if (!captchaOk) return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in. Check your inbox.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOtpEmail(email, user.firstName, otp);

        res.json({ requiresOtp: true, message: 'A 6-digit code has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// POST /api/users/verify-otp — step 2: verify OTP, issue JWT
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email, otp, otpExpiry: { $gt: new Date() } });
        if (!user) return res.status(401).json({ message: 'Invalid or expired code. Please try again.' });

        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'OTP verification failed', error: error.message });
    }
});

// POST /api/users/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        await sendPasswordResetEmail(email, user.firstName, resetToken, baseUrl);

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reset email', error: error.message });
    }
});

// POST /api/users/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
        if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' });

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: 'Password updated successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Password reset failed', error: error.message });
    }
});

module.exports = router;
