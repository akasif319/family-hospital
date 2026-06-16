const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    title: {
        type: String,
        default: ''
    },
    specialty: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male'
    },
    experience: {
        type: String,
        default: ''
    },
    qualification: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: ''
    },
    schedule: {
        type: Map,
        of: [String],
        default: {}
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);