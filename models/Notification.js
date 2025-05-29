const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'academic', 'placement', 'internship'],
        required: true
    },
    company: String,
    location: String,
    deadline: Date,
    requirements: [{
        type: String,
        trim: true
    }],
    audience: {
        type: [String],
        enum: ['student', 'faculty', 'alumni', 'all'],
        default: ['all']
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);