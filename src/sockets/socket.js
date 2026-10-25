const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Map userId → Set of socketIds (a user can have multiple tabs)
const onlineUsers = new Map();

/**
 * Setup Socket.IO event handlers
 * @param {import('socket.io').Server} io
 */
const setupSocket = (io) => {
  // ─── Authentication middleware ───────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // ─── Track online status ────────────────
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join a personal room so we can target messages to this user
    socket.join(`user_${userId}`);

    // Send current online users to the newly connected user
    socket.emit('online_users_list', { userIds: Array.from(onlineUsers.keys()) });

    // Broadcast online status to all others
    socket.broadcast.emit('user_online', { userId });

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔌  Socket connected: ${socket.id} (user: ${userId})`);
      console.log(`📊  Total online users: ${onlineUsers.size}`);
    }

    // ─── Join a conversation room ───────────
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // ─── Typing indicators ──────────────────
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('typing_start', {
        conversationId,
        userId,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('typing_stop', {
        conversationId,
        userId,
      });
    });

    // ─── Disconnect ─────────────────────────
    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_offline', { userId });
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔌  Socket disconnected: ${socket.id} (user: ${userId})`);
      }
    });
  });
};

/**
 * Get list of online user IDs
 */
const getOnlineUserIds = () => Array.from(onlineUsers.keys());

module.exports = { setupSocket, getOnlineUserIds };
