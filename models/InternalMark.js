const mongoose = require('mongoose');

const internalMarkSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  marks: {
    midterm: {
      type: Number,
      min: 0,
      max: 100
    },
    assignment: {
      type: Number,
      min: 0,
      max: 100
    },
    attendance: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  semester: {
    type: Number,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InternalMark', internalMarkSchema);