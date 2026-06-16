const express = require('express');
const router = express.Router();
const { getServices, getServiceById, addService, updateService, deleteService } = require('../controllers/serviceController');
const adminAuth = require('../middleware/authMiddleware');

// GET /api/services - Get all services (public)
router.get('/', getServices);

// GET /api/services/:id - Get single service (public)
router.get('/:id', getServiceById);

// POST /api/services - Add service (admin only)
router.post('/', adminAuth, addService);

// PUT /api/services/:id - Update service (admin only)
router.put('/:id', adminAuth, updateService);

// DELETE /api/services/:id - Delete service (admin only)
router.delete('/:id', adminAuth, deleteService);

module.exports = router;