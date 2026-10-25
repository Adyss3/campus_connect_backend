const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    university: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    matricNumber: {
      type: String,
      trim: true,
    },
    schoolEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    documentUrl: {
      type: String,
      required: [true, 'Verification document is required'],
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: ['student_id', 'admission_letter', 'enrollment_proof', 'other'],
      default: 'student_id',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Verification = mongoose.model('Verification', verificationSchema);

module.exports = Verification;
