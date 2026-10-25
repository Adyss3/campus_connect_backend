const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * @desc    Get all active conversations for the logged-in user
 * @route   GET /api/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      status: 'active',
    })
      .populate('participants', 'firstName lastName profileImage role university')
      .sort({ updatedAt: -1 });

    // For each conversation, attach the latest message
    const withLatest = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .lean();
        return {
          ...conv.toObject(),
          lastMessage: lastMessage || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: withLatest.length,
      data: withLatest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/conversations/:id/messages
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Check the user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Not a participant in this conversation' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'firstName lastName profileImage');

    const total = await Message.countDocuments({ conversationId: req.params.id });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/conversations/:id/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (conversation.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Conversation is not active' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Not a participant in this conversation' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user.id,
      text: text.trim(),
    });

    // Touch conversation updatedAt
    conversation.updatedAt = new Date();
    await conversation.save();

    const populated = await message.populate('senderId', 'firstName lastName profileImage');

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== req.user.id) {
          io.to(`user_${participantId}`).emit('new_message', {
            conversationId: req.params.id,
            message: populated,
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
