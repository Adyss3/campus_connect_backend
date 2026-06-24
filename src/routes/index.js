const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the current server and database status. No authentication required.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Campus Connect API is running
 *                 environment:
 *                   type: string
 *                   example: development
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 120.5
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campus Connect API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const verificationRoutes = require('./verificationRoutes');
const conversationRoutes = require('./conversationRoutes');
const feedRoutes = require('./feedRoutes');
const storeRoutes = require('./storeRoutes');
const productRoutes = require('./productRoutes');
const jobRoutes = require('./jobRoutes');
const eventRoutes = require('./eventRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/verification', verificationRoutes);
router.use('/conversations', conversationRoutes);
router.use('/feed', feedRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/jobs', jobRoutes);
router.use('/events', eventRoutes);

module.exports = router;
