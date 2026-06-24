const Event = require('../models/Event');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Staff, Admin, Organization)
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      image
    } = req.body;

    // Check if user has permission to create events
    const allowedRoles = ['Staff', 'Admin', 'Organization'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to create events'
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      image,
      organizedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events with optional filters
 * @route   GET /api/events
 * @access  Public
 */
const getAllEvents = async (req, res, next) => {
  try {
    const {
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const events = await Event.find(query)
      .populate('organizedBy', 'firstName lastName role')
      .populate('rsvps', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1 }); // Sort by date ascending (upcoming first)

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: { events }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizedBy', 'firstName lastName email role')
      .populate('rsvps', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update event (organizer only)
 * @route   PATCH /api/events/:id
 * @access  Private
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete event (organizer only)
 * @route   DELETE /api/events/:id
 * @access  Private
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    RSVP to an event
 * @route   POST /api/events/:id/rsvp
 * @access  Private
 */
const rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if already RSVP'd
    if (event.rsvps.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'You have already RSVP\'d to this event'
      });
    }

    event.rsvps.push(req.user._id);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'RSVP confirmed',
      data: { rsvpCount: event.rsvps.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel RSVP to an event
 * @route   DELETE /api/events/:id/rsvp
 * @access  Private
 */
const cancelRsvp = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has RSVP'd
    if (!event.rsvps.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'You have not RSVP\'d to this event'
      });
    }

    event.rsvps = event.rsvps.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await event.save();

    res.status(200).json({
      success: true,
      message: 'RSVP cancelled',
      data: { rsvpCount: event.rsvps.length }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp
};
