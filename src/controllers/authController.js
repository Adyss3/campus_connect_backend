const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {string} id - The user ID
 * @returns {string} - The signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new student (MTU email required)
 * @route   POST /api/auth/signup/student
 * @access  Public
 */
const registerStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate MTU email format: firstnamelastname@mtu.edu.ng
    const mtuEmailPattern = /^[a-z]+[a-z]+@mtu\.edu\.ng$/i;
    if (!mtuEmailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please use a valid MTU student email format: firstnamelastname@mtu.edu.ng'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Create student user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'Student',
      accountType: 'Student',
      isVerifiedStudent: true,
      university: 'Mountain Top University'
    });

    const safeUser = user.toSafeObject();
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new campus user (Staff, Entrepreneur, Organization)
 * @route   POST /api/auth/signup/campus
 * @access  Public
 */
const registerCampus = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, university } = req.body;

    // Validate role
    const allowedRoles = ['Staff', 'Entrepreneur', 'Organization'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be Staff, Entrepreneur, or Organization'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Create campus user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      accountType: role,
      isVerifiedStudent: false,
      university: university || 'Mountain Top University'
    });

    const safeUser = user.toSafeObject();
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Campus account created successfully',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new user (Generic - for backward compatibility)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      university,
      matricNumber,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Create new user (password is hashed automatically in the model's pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'Student',
      accountType: role || 'Student',
      university,
      matricNumber,
    });

    if (user) {
      const safeUser = user.toSafeObject();
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: safeUser,
          token,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid user data received',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and explicitly select password to compare
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const safeUser = user.toSafeObject();
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear frontend token
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    // For JWT in localStorage, the backend just returns a success message
    // and the client is responsible for deleting the token from storage.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please clear your local token.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set in the auth middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerStudent,
  registerCampus,
  login,
  logout,
  getMe,
};
