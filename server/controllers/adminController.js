const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { exceedsLength } = require('../utils/sanitize');

// Admin login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        if (exceedsLength(username, 100) || exceedsLength(password, 200)) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

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