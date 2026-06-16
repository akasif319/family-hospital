const Doctor = require('../models/Doctor');

// Get all doctors (public - for website)
const getDoctors = async (req, res) => {
    try {
        const { department, gender, featured } = req.query;
        let filter = {};

        if (department && department !== 'all') {
            filter.department = department;
        }
        if (gender && gender !== 'all') {
            filter.gender = gender;
        }
        if (featured === 'true') {
            filter.featured = true;
        }

        const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
    }
};

// Get single doctor by ID
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctor', error: error.message });
    }
};

// Add new doctor (admin only)
const addDoctor = async (req, res) => {
    try {
        const { name, department, title, specialty, gender, experience, qualification,
                rating, reviews, location, tags, description, schedule, featured } = req.body;

        // Handle uploaded image
        const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || '';

        // Parse schedule if it's a string
                let parsedSchedule = {};
        if (schedule) {
            if (typeof schedule === 'string') {
                try { parsedSchedule = JSON.parse(schedule); } catch (e) { parsedSchedule = {}; }
            } else {
                parsedSchedule = schedule;
            }
        }

        // Parse tags if it's a string
                let parsedTags = [];
        if (tags) {
            if (Array.isArray(tags)) {
                parsedTags = tags;
            } else if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(function (f) { return f.trim(); }).filter(function (f) { return f; });
            }
        }

        const doctor = new Doctor({
            name, department, title, specialty, gender, experience, qualification,
            rating: parseFloat(rating) || 0,
            reviews: parseInt(reviews) || 0,
            location, image, tags: parsedTags, description,
            schedule: parsedSchedule,
            featured: featured === 'true' || featured === true
        });

        const saved = await doctor.save();
        res.status(201).json({ message: 'Doctor added successfully', doctor: saved });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add doctor', error: error.message });
    }
};

// Update doctor (admin only)
// Update doctor (admin only)
const updateDoctor = async (req, res) => {
    try {
        const { name, department, title, specialty, gender, experience, qualification,
                rating, reviews, location, tags, description, schedule, featured } = req.body;

        const updateData = {
            name, department, title, specialty, gender, experience, qualification,
            rating: parseFloat(rating) || 0,
            reviews: parseInt(reviews) || 0,
            location, description,
            featured: featured === 'true' || featured === true
        };

        // Handle uploaded image
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        // Parse schedule safely
        if (schedule) {
            if (typeof schedule === 'string') {
                try { updateData.schedule = JSON.parse(schedule); } catch (e) { updateData.schedule = {}; }
            } else {
                updateData.schedule = schedule;
            }
        }

        // Parse tags safely
        if (tags) {
            if (Array.isArray(tags)) {
                updateData.tags = tags;
            } else if (typeof tags === 'string') {
                updateData.tags = tags.split(',').map(function (f) { return f.trim(); }).filter(function (f) { return f; });
            }
        }

        const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor updated successfully', doctor: doctor });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update doctor', error: error.message });
    }
};

// Delete doctor (admin only)
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
    }
};

module.exports = { getDoctors, getDoctorById, addDoctor, updateDoctor, deleteDoctor };