const Job = require('../models/Job');

/**
 * @desc    Create a new job listing
 * @route   POST /api/jobs
 * @access  Private (Staff, Admin, Organization)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      description
    } = req.body;

    // Check if user has permission to post jobs
    const allowedRoles = ['Staff', 'Admin', 'Organization', 'Entrepreneur'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to post job listings'
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      type,
      salary,
      description,
      postedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs with optional filters
 * @route   GET /api/jobs
 * @access  Public
 */
const getAllJobs = async (req, res, next) => {
  try {
    const {
      type,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Search by title, company, or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: { jobs }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName email role');

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update job (poster only)
 * @route   PATCH /api/jobs/:id
 * @access  Private
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete job (poster only)
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
};
