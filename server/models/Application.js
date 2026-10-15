const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Please provide an internship role/title'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Interview', 'Offer', 'Rejected'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Applied'
    },
    dateApplied: {
      type: Date,
      default: Date.now
    },
    link: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Application', applicationSchema);
