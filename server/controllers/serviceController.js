const Service = require('../models/Service');

// Get all services (public - for website)
const getServices = async (req, res) => {
    try {
        const { featured } = req.query;
        let filter = {};
        if (featured === 'true') filter.featured = true;

        const services = await Service.find(filter).sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch services', error: error.message });
    }
};

// Add service (admin only)
const addService = async (req, res) => {
    try {
        const { name, description, icon, features, featured } = req.body;

                let parsedFeatures = [];
        if (features) {
            if (Array.isArray(features)) {
                parsedFeatures = features;
            } else if (typeof features === 'string') {
                parsedFeatures = features.split(',').map(function (f) { return f.trim(); }).filter(function (f) { return f; });
            }
        }
        const service = new Service({
            name, description,
            icon: icon || 'fa-solid fa-stethoscope',
            features: parsedFeatures,
            featured: featured === 'true' || featured === true
        });

        const saved = await service.save();
        res.status(201).json({ message: 'Service added successfully', service: saved });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add service', error: error.message });
    }
};

// Update service (admin only)
const updateService = async (req, res) => {
    try {
        const { name, description, icon, features, featured } = req.body;

               let parsedFeatures = [];
        if (features) {
            if (Array.isArray(features)) {
                parsedFeatures = features;
            } else if (typeof features === 'string') {
                parsedFeatures = features.split(',').map(function (f) { return f.trim(); }).filter(function (f) { return f; });
            }
        }

        const service = await Service.findByIdAndUpdate(req.params.id, {
            name, description,
            icon: icon || 'fa-solid fa-stethoscope',
            features: parsedFeatures,
            featured: featured === 'true' || featured === true
        }, { new: true });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service updated successfully', service: service });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update service', error: error.message });
    }
};

// Delete service (admin only)
const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete service', error: error.message });
    }
};

// Get single service by ID (admin only)
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch service', error: error.message });
    }
};

module.exports = { getServices, getServiceById, addService, updateService, deleteService };