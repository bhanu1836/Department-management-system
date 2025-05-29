const express = require('express');
const router = express.Router();
const { isAuthenticated, isAlumni } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Alumni dashboard
router.get('/dashboard', isAuthenticated, isAlumni, async (req, res) => {
    try {
        // Fetch notifications posted by the current alumni
        const notifications = await Notification.find({ 
            postedBy: req.session.userId 
        })
        .sort({ createdAt: -1 })
        .lean();

        res.render('alumni/dashboard', { 
            currentUser: req.session.user,
            notifications: notifications,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error('Error loading alumni dashboard:', error);
        req.flash('error', 'Error loading dashboard');
        res.redirect('/');
    }
});

// Add notification route
router.post('/notifications/add', isAuthenticated, isAlumni, async (req, res) => {
    try {
        const { title, description, type, company, location, deadline, requirements } = req.body;
        
        const notificationData = {
            title,
            description,
            type: type || 'internship', // Default to internship if not specified
            company,
            location,
            deadline,
            requirements: requirements.split(',').map(req => req.trim()).filter(Boolean),
            postedBy: req.session.userId,
            audience: ['student', 'faculty'] // Alumni notifications visible to students and faculty
        };
  
        const notification = new Notification(notificationData);
        await notification.save();

        req.flash('success', 'Notification added successfully');
        res.redirect('/alumni/dashboard');
    } catch (error) {
        console.error('Error adding notification:', error);
        req.flash('error', 'Error adding notification: ' + error.message);
        res.redirect('/alumni/dashboard');
    }
});

module.exports = router;