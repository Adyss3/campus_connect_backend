const express = require('express');
const {
  getMe,
  updateProfile,
  updateAvatar,
  searchVerifiedUsers,
  getPublicProfile,
} = require('../controllers/userController');
const { protect, requireVerified } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profiles and account management
 */

router.use(protect); // All user routes require authentication

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               university:
 *                 type: string
 *               matricNumber:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.route('/me').get(getMe).put(updateProfile);

/**
 * @swagger
 * /api/users/me/avatar:
 *   put:
 *     summary: Update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 */
router.put('/me/avatar', upload.single('avatar'), updateAvatar);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search verified users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search by name or matric number
 *       - in: query
 *         name: university
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of verified users
 */
router.get('/search', requireVerified, searchVerifiedUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get public verified profile
 *     tags: [Users]
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
 *         description: Public user profile
 */
router.get('/:id', requireVerified, getPublicProfile);

module.exports = router;
