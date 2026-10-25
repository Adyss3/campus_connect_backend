const express = require('express');
const {
  sendRequest,
  cancelRequest,
  getIncomingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  blockRequest,
} = require('../controllers/conversationController');
const {
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect, requireVerified } = require('../middleware/authMiddleware');

const router = express.Router();

// All conversation routes require authentication
router.use(protect);
// Note: requireVerified removed — messaging is open to all authenticated users

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get all active conversations for the logged-in user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active conversations with last message
 */
router.get('/', getConversations);

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated messages
 */
router.get('/:id/messages', getMessages);

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/:id/messages', sendMessage);


/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Message requests and connections
 */

/**
 * @swagger
 * /api/conversations/request:
 *   post:
 *     summary: Send a message request
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to connect with
 *     responses:
 *       201:
 *         description: Request sent
 *       200:
 *         description: Previously declined request reactivated
 */
router.post('/request', sendRequest);

/**
 * @swagger
 * /api/conversations/requests/incoming:
 *   get:
 *     summary: Get incoming message requests
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of incoming requests
 */
router.get('/requests/incoming', getIncomingRequests);

/**
 * @swagger
 * /api/conversations/requests/sent:
 *   get:
 *     summary: Get sent message requests
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent requests
 */
router.get('/requests/sent', getSentRequests);

/**
 * @swagger
 * /api/conversations/{id}/cancel:
 *   delete:
 *     summary: Cancel a sent message request
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request cancelled
 */
router.delete('/:id/cancel', cancelRequest);

/**
 * @swagger
 * /api/conversations/{id}/accept:
 *   patch:
 *     summary: Accept an incoming message request
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request accepted
 */
router.patch('/:id/accept', acceptRequest);

/**
 * @swagger
 * /api/conversations/{id}/reject:
 *   patch:
 *     summary: Reject an incoming message request
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request rejected
 */
router.patch('/:id/reject', rejectRequest);

/**
 * @swagger
 * /api/conversations/{id}/block:
 *   patch:
 *     summary: Block a user from sending further requests
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User/Conversation blocked
 */
router.patch('/:id/block', blockRequest);

module.exports = router;
