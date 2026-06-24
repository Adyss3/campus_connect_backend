const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Internship', 'Work-Study'],
      required: [true, 'Job type is required']
    },
    salary: {
      type: String,
      required: [true, 'Salary / pay range information is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },
    requirements: {
      type: [String],
      default: []
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must be posted by a user']
    }
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
