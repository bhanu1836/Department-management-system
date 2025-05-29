const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Notification = require('../models/Notification');

// View all notifications
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort('-createdAt')
      .populate('postedBy', 'name role');
      
    res.render('notifications/index', { notifications });
  } catch (err) {
    req.flash('error', 'Error loading notifications');
    res.redirect('/');
  }
});

// View single notification
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('postedBy', 'name role');
      
    if (!notification) {
      req.flash('error', 'Notification not found');
      return res.redirect('/notifications');
    }
    
    res.render('notifications/show', { notification });
  } catch (err) {
    req.flash('error', 'Error loading notification');
    res.redirect('/notifications');
  }
});

module.exports = router;