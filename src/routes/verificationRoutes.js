const express = require('express');
const {
  submitVerification,
  getMyVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} = require('../controllers/verificationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: University student verification system
 */

router.use(protect); // All verification routes require authentication

/**
 * @swagger
 * /api/verification/submit:
 *   post:
 *     summary: Submit verification proof
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               verificationDocument:
 *                 type: string
 *                 format: binary
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               university:
 *                 type: string
 *               matricNumber:
 *                 type: string
 *               schoolEmail:
 *                 type: string
 *               documentType:
 *                 type: string
 *                 enum: [student_id, admission_letter, enrollment_proof, other]
 *     responses:
 *       201:
 *         description: Verification submitted
 */
router.post('/submit', upload.single('verificationDocument'), submitVerification);

/**
 * @swagger
 * /api/verification/me:
 *   get:
 *     summary: Get my verification status
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status
 */
router.get('/me', getMyVerification);

// Admin routes
router.use(authorize('Admin')); // The following routes require Admin role

/**
 * @swagger
 * /api/verification/pending:
 *   get:
 *     summary: Get all pending verifications (Admin only)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending verifications
 */
router.get('/pending', getPendingVerifications);

/**
 * @swagger
 * /api/verification/{id}/approve:
 *   patch:
 *     summary: Approve a verification (Admin only)
 *     tags: [Verification]
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
 *         description: Verification approved
 */
router.patch('/:id/approve', approveVerification);

/**
 * @swagger
 * /api/verification/{id}/reject:
 *   patch:
 *     summary: Reject a verification (Admin only)
 *     tags: [Verification]
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
 *               - adminNote
 *             properties:
 *               adminNote:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Verification rejected
 */
router.patch('/:id/reject', rejectVerification);

module.exports = router;
