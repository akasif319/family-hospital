const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/adminController');
const adminAuth = require('../middleware/authMiddleware');

// POST /api/admin/login - Admin login (no auth required)
router.post('/login', login);

// GET /api/admin/verify - Verify token (auth required)
router.get('/verify', adminAuth, verifyToken);

module.exports = router;