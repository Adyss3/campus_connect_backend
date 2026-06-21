const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * @desc    Send a message request
 * @route   POST /api/conversations/request
 * @access  Private/Verified
 */
const sendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Target userId is required' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot send a request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser || !targetUser.isVerified) {
      return res.status(404).json({ success: false, error: 'Target verified user not found' });
    }

    // Sort participants to ensure consistent querying for the unique index
    const participants = [req.user.id, userId].sort();

    let conversation = await Conversation.findOne({ participants });

    if (conversation) {
      if (conversation.status === 'pending') {
        return res.status(400).json({ success: false, error: 'A pending request already exists between these users' });
      }
      if (conversation.status === 'active') {
        return res.status(400).json({ success: false, error: 'You are already connected with this user' });
      }
      if (conversation.status === 'blocked') {
        return res.status(403).json({ success: false, error: 'Cannot send request to this user' });
      }
      if (conversation.status === 'declined') {
        // If it was declined previously, allow retrying by updating the existing doc
        conversation.requestedBy = req.user.id;
        conversation.requestedTo = userId;
        conversation.status = 'pending';
        await conversation.save();

        return res.status(200).json({
          success: true,
          data: conversation,
        });
      }
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants,
      requestedBy: req.user.id,
      requestedTo: userId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a sent message request
 * @route   DELETE /api/conversations/:id/cancel
 * @access  Private/Verified
 */
const cancelRequest = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (conversation.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this request' });
    }

    if (conversation.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Can only cancel pending requests' });
    }

    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get incoming message requests
 * @route   GET /api/conversations/requests/incoming
 * @access  Private/Verified
 */
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await Conversation.find({
      requestedTo: req.user.id,
      status: 'pending',
    }).populate('requestedBy', 'firstName lastName profileImage university department role isVerified');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sent message requests
 * @route   GET /api/conversations/requests/sent
 * @access  Private/Verified
 */
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await Conversation.find({
      requestedBy: req.user.id,
      status: 'pending',
    }).populate('requestedTo', 'firstName lastName profileImage university department role isVerified');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a message request
 * @route   PATCH /api/conversations/:id/accept
 * @access  Private/Verified
 */
const acceptRequest = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (conversation.requestedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to accept this request' });
    }

    if (conversation.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Can only accept pending requests' });
    }

    conversation.status = 'active';
    await conversation.save();

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a message request
 * @route   PATCH /api/conversations/:id/reject
 * @access  Private/Verified
 */
const rejectRequest = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (conversation.requestedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to reject this request' });
    }

    if (conversation.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Can only reject pending requests' });
    }

    conversation.status = 'declined';
    await conversation.save();

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block a user/conversation
 * @route   PATCH /api/conversations/:id/block
 * @access  Private/Verified
 */
const blockRequest = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to block this conversation' });
    }

    conversation.status = 'blocked';
    await conversation.save();

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequest,
  cancelRequest,
  getIncomingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  blockRequest,
};
