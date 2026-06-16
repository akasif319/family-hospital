const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, addDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const adminAuth = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-originalname
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Allow only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// GET /api/doctors - Get all doctors (public)
router.get('/', getDoctors);

// GET /api/doctors/:id - Get single doctor (public)
router.get('/:id', getDoctorById);

// POST /api/doctors - Add doctor (admin only, with image upload)
router.post('/', adminAuth, upload.single('image'), addDoctor);

// PUT /api/doctors/:id - Update doctor (admin only, with image upload)
router.put('/:id', adminAuth, upload.single('image'), updateDoctor);

// DELETE /api/doctors/:id - Delete doctor (admin only)
router.delete('/:id', adminAuth, deleteDoctor);

module.exports = router;