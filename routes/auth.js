const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Login logic
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    req.session.userId = user._id;
    req.session.user = user;
    req.flash('success', 'Welcome back!');
    
    switch (user.role) {
      case 'faculty':
        res.redirect('/faculty/dashboard');
        break;
      case 'student':
        res.redirect('/student/dashboard');
        break;
      case 'alumni':
        res.redirect('/alumni/dashboard');
        break;
      default:
        res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during login');
    res.redirect('/login');
  }
});

// Main registration route
router.get('/register', (req, res) => {
    res.render('auth/register', {
        currentUser: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
    });
});

// Registration form submission
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/register');
        }

        // Create new user with default student role
        const user = new User({
            name,
            email,
            password,
            department
        });

        await user.save();
        req.flash('success', 'Registration successful. Please login.');
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Registration failed');
        res.redirect('/register');
    }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;