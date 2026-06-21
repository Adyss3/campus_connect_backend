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
const { protect, requireVerified } = require('../middleware/authMiddleware');

const router = express.Router();

// All conversation routes require authentication and verification
router.use(protect);
router.use(requireVerified);

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
