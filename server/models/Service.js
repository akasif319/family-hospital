const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required']
    },
    description: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'fa-solid fa-stethoscope'
    },
    features: {
        type: [String],
        default: []
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);