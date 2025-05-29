const express = require('express');
const router = express.Router();
const { isFaculty, isAuthenticated } = require('../middleware/auth');
const InternalMark = require('../models/InternalMark');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Mark = require('../models/Mark');

// Faculty dashboard
router.get('/dashboard', isAuthenticated, isFaculty, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort('-createdAt')
      .limit(5)
      .populate('postedBy', 'name');
      
    res.render('faculty/dashboard', { notifications });
  } catch (err) {
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

// Add internal marks
router.post('/marks/add', isAuthenticated, isFaculty, async (req, res) => {
  try {
    const { studentId, subject, midterm, assignment, attendance, semester, academicYear } = req.body;
    
    const mark = new InternalMark({
      student: studentId,
      subject,
      marks: {
        midterm,
        assignment,
        attendance
      },
      semester,
      academicYear,
      updatedBy: req.session.userId
    });

    await mark.save();
    req.flash('success', 'Marks added successfully');
    res.redirect('/faculty/marks');
  } catch (err) {
    req.flash('error', 'Error adding marks');
    res.redirect('/faculty/marks');
  }
});

// View/Edit marks page
router.get('/marks', isAuthenticated, isFaculty, async (req, res) => {
  try {
    const marks = await Mark.find({ faculty: req.session.userId })
      .populate('student', 'name rollNumber');
    res.render('faculty/marks', { marks });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading marks');
    res.redirect('/faculty/dashboard');
  }
});

// Add new marks
router.post('/marks', isAuthenticated, isFaculty, async (req, res) => {
  try {
    const { studentId, subject, marks, examType } = req.body;
    const student = await User.findOne({ rollNumber: studentId, role: 'student' });
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/faculty/marks');
    }

    const newMark = new Mark({
      student: student._id,
      faculty: req.session.userId,
      subject,
      marks: Number(marks),
      examType
    });

    await newMark.save();
    req.flash('success', 'Marks added successfully');
    res.redirect('/faculty/marks');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error adding marks');
    res.redirect('/faculty/marks');
  }
});

// Faculty profile
router.get('/profile', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const faculty = await User.findById(req.session.userId);
        res.render('faculty/profile', { faculty });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error loading profile');
        res.redirect('/faculty/dashboard');
    }
});

// Add notification
router.post('/notifications/add', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { title, description, type, company, location, deadline, requirements, audience } = req.body;
        
        const notificationData = {
            title,
            description,
            type,
            postedBy: req.session.userId,
            audience: audience || ['all'] // Default to all if not specified
        };

        // Only add optional fields if they exist
        if (company) notificationData.company = company;
        if (location) notificationData.location = location;
        if (deadline) notificationData.deadline = deadline;
        if (requirements) {
            notificationData.requirements = Array.isArray(requirements) 
                ? requirements 
                : requirements.split(',').map(req => req.trim()).filter(Boolean);
        }

        const notification = new Notification(notificationData);
        await notification.save();

        req.flash('success', 'Notification added successfully');
        res.redirect('/faculty/notifications');
    } catch (err) {
        console.error('Error adding notification:', err);
        req.flash('error', 'Error adding notification');
        res.redirect('/faculty/notifications');
    }
});

// View notifications page
router.get('/notifications', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { audience: 'faculty' },
                { audience: 'all' },
                { postedBy: req.session.userId } // Show notifications created by the current faculty
            ]
        })
        .sort({ createdAt: -1 })
        .populate('postedBy', 'name')
        .lean();
  
        res.render('faculty/notifications', { 
            notifications,
            currentUser: req.session.user,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
        req.flash('error', 'Error loading notifications');
        res.redirect('/faculty/dashboard');
    }
});

module.exports = router;