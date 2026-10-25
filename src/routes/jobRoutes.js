const express = require('express');
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/jobController');

const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job listing management endpoints
 */

// Create job (private - Staff, Admin, Organization)
router.post('/', protect, createJob);

// Get all jobs (public)
router.get('/', getAllJobs);

// Get single job (public)
router.get('/:id', getJobById);

// Update job (poster only)
router.patch('/:id', protect, updateJob);

// Delete job (poster only)
router.delete('/:id', protect, deleteJob);

module.exports = router;
