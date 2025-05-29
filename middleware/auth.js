const User = require('../models/User');

exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please login to access this page');
  res.redirect('/login');
};

exports.isFaculty = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'faculty') {
    return next();
  }
  req.flash('error', 'Access denied. Faculty only.');
  res.redirect('/');
};

exports.isStudent = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'student') {
    return next();
  }
  req.flash('error', 'Access denied. Students only.');
  res.redirect('/');
};

exports.isAlumni = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'alumni') {
    return next();
  }
  req.flash('error', 'Access denied. Alumni only.');
  res.redirect('/');
};