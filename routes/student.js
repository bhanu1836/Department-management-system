const express = require('express');
const router = express.Router();
const { isStudent, isAuthenticated } = require('../middleware/auth');
const InternalMark = require('../models/InternalMark');
const Notification = require('../models/Notification');
const Mark = require('../models/Mark');
// Student dashboard
router.get('/dashboard', isAuthenticated, isStudent, async (req, res) => {
  try {
    // Get student's internal marks
    const marks = await InternalMark.find({ student: req.session.userId })
      .populate('updatedBy', 'name')
      .populate('subject')  // Add subject population
      .sort('-updatedAt')
      .limit(5);
      
    // Get relevant notifications
    const notifications = await Notification.find({
      $or: [
        { audience: 'student' },
        { audience: 'all' }
      ]
    })
    .sort('-createdAt')
    .limit(5)
    .populate('postedBy', 'name');
      
    res.render('student/dashboard', { 
      marks, 
      notifications,
      currentUser: req.session.user,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

// View marks
router.get('/marks', isAuthenticated, isStudent, async (req, res) => {
  try {
    const marks = await InternalMark.find({ student: req.session.userId })
      .populate('updatedBy', 'name')
      .sort('-updatedAt');
      
    res.render('student/marks', { marks });
  } catch (err) {
    req.flash('error', 'Error loading marks');
    res.redirect('/student/dashboard');
  }
});

// View notifications
router.get('/notifications', isAuthenticated, isStudent, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort('-createdAt')
      .populate('postedBy', 'name');
      
    res.render('student/notifications', { notifications });
  } catch (err) {
    req.flash('error', 'Error loading notifications');
    res.redirect('/student/dashboard');
  }
});

module.exports = router;