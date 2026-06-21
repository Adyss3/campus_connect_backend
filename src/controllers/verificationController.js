const Verification = require('../models/Verification');
const User = require('../models/User');

/**
 * @desc    Submit verification proof
 * @route   POST /api/verification/submit
 * @access  Private
 */
const submitVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user already has a pending or approved verification
    if (user.verificationStatus === 'pending' || user.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        error: `Cannot submit verification. Current status is: ${user.verificationStatus}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a verification document',
      });
    }

    const { fullName, email, university, matricNumber, schoolEmail, documentType } = req.body;

    const fileUrl = `/uploads/verifications/${req.file.filename}`;

    const verification = await Verification.create({
      userId: user._id,
      fullName: fullName || `${user.firstName} ${user.lastName}`,
      email: email || user.email,
      university: university || user.university,
      matricNumber: matricNumber || user.matricNumber,
      schoolEmail,
      documentUrl: fileUrl,
      documentType,
      status: 'pending',
    });

    // Update user status
    user.verificationStatus = 'pending';
    user.verificationId = verification._id;
    await user.save();

    res.status(201).json({
      success: true,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my verification status
 * @route   GET /api/verification/me
 * @access  Private
 */
const getMyVerification = async (req, res, next) => {
  try {
    const verification = await Verification.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'No verification record found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pending verifications (Admin only)
 * @route   GET /api/verification/pending
 * @access  Private/Admin
 */
const getPendingVerifications = async (req, res, next) => {
  try {
    const verifications = await Verification.find({ status: 'pending' }).populate('userId', 'firstName lastName email university');

    res.status(200).json({
      success: true,
      count: verifications.length,
      data: verifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a verification (Admin only)
 * @route   PATCH /api/verification/:id/approve
 * @access  Private/Admin
 */
const approveVerification = async (req, res, next) => {
  try {
    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ success: false, error: 'Verification record not found' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Verification is not pending' });
    }

    verification.status = 'approved';
    verification.reviewedBy = req.user.id;
    verification.reviewedAt = Date.now();
    await verification.save();

    // Update User
    const user = await User.findById(verification.userId);
    if (user) {
      user.isVerified = true;
      user.verificationStatus = 'approved';
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a verification (Admin only)
 * @route   PATCH /api/verification/:id/reject
 * @access  Private/Admin
 */
const rejectVerification = async (req, res, next) => {
  try {
    const { adminNote } = req.body;

    if (!adminNote) {
      return res.status(400).json({ success: false, error: 'Please provide a rejection reason (adminNote)' });
    }

    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ success: false, error: 'Verification record not found' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Verification is not pending' });
    }

    verification.status = 'rejected';
    verification.adminNote = adminNote;
    verification.reviewedBy = req.user.id;
    verification.reviewedAt = Date.now();
    await verification.save();

    // Update User
    const user = await User.findById(verification.userId);
    if (user) {
      user.isVerified = false;
      user.verificationStatus = 'rejected';
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitVerification,
  getMyVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
};
