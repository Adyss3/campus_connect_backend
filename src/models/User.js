const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password in queries by default
    },
    role: {
      type: String,
      enum: ['Student', 'Entrepreneur', 'Admin'],
      default: 'Student',
    },
    university: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    matricNumber: {
      type: String,
      trim: true,
      // Not globally required since Admins or Entrepreneurs might not have one,
      // but validation can enforce it based on role later if needed.
    },
    profileImage: {
      type: String,
      default: 'default-avatar.jpg',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [250, 'Bio cannot be more than 250 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    verificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Verification',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to safely return user object without password
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
