const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check against env credentials
        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token (expires in 24 hours)
        const token = jwt.sign(
            { username: username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: 'Login successful', token: token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Verify token (for checking if login is still valid)
const verifyToken = (req, res) => {
    res.json({ message: 'Token is valid', admin: req.admin });
};

module.exports = { login, verifyToken };