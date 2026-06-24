const express = require('express');
const router = express.Router();

const {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  followStore,
  unfollowStore
} = require('../controllers/storeController');

const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Store management endpoints
 */

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Create a new store
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeName
 *               - description
 *               - category
 *             properties:
 *               storeName:
 *                 type: string
 *                 example: Campus Threads
 *               description:
 *                 type: string
 *                 example: Premium campus apparel and accessories
 *               category:
 *                 type: string
 *                 example: Apparel
 *               logo:
 *                 type: string
 *               banner:
 *                 type: string
 *               contactDetails:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   instagram:
 *                     type: string
 *                   twitter:
 *                     type: string
 *                   website:
 *                     type: string
 *     responses:
 *       201:
 *         description: Store created successfully
 *       400:
 *         description: Validation error or user already has a store
 */
router.post('/', protect, createStore);

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of stores
 */
router.get('/', getAllStores);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Get single store by ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store details
 *       404:
 *         description: Store not found
 */
router.get('/:id', getStoreById);

/**
 * @swagger
 * /api/stores/{id}:
 *   patch:
 *     summary: Update store (owner only)
 *     tags: [Stores]
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
 *     responses:
 *       200:
 *         description: Store updated successfully
 *       403:
 *         description: Not authorized
 */
router.patch('/:id', protect, updateStore);

/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     summary: Delete store (owner only)
 *     tags: [Stores]
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
 *         description: Store deleted successfully
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', protect, deleteStore);

/**
 * @swagger
 * /api/stores/{id}/follow:
 *   post:
 *     summary: Follow a store
 *     tags: [Stores]
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
 *         description: Now following store
 */
router.post('/:id/follow', protect, followStore);

/**
 * @swagger
 * /api/stores/{id}/follow:
 *   delete:
 *     summary: Unfollow a store
 *     tags: [Stores]
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
 *         description: Unfollowed store
 */
router.delete('/:id/follow', protect, unfollowStore);

module.exports = router;
