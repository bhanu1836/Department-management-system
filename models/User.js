const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'alumni', 'admin'],
    default: 'student'  // Set default role to 'student'
  },
  department: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    sparse: true
  },
  batch: {
    type: Number,
    required: function() {
      return this.role === 'student' || this.role === 'alumni';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if model exists before compiling
module.exports = mongoose.models.User || mongoose.model('User', userSchema);