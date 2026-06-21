const User = require('../models/User');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('verificationId');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    // Prevent password updates through this route
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update password via profile update route',
      });
    }

    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bio: req.body.bio,
      university: req.body.university,
      matricNumber: req.body.matricNumber,
      department: req.body.department,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update avatar
 * @route   PUT /api/users/me/avatar
 * @access  Private
 */
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file',
      });
    }

    // In a real cloud setup, req.file.path might be a URL. Here we'll store the local path
    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: fileUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search verified users
 * @route   GET /api/users/search
 * @access  Private
 */
const searchVerifiedUsers = async (req, res, next) => {
  try {
    const { query, university, role } = req.query;

    const filter = { isVerified: true };

    if (query) {
      filter.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { matricNumber: { $regex: query, $options: 'i' } },
      ];
    }

    if (university) {
      filter.university = { $regex: university, $options: 'i' };
    }

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('firstName lastName profileImage university role isVerified');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public verified profile
 * @route   GET /api/users/:id
 * @access  Private/Verified
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName profileImage university department bio role isVerified');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, error: 'User profile is not public yet' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
  updateAvatar,
  searchVerifiedUsers,
  getPublicProfile,
};
