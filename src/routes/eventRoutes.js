const express = require('express');
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

// Create event (private - Staff, Admin, Organization)
router.post('/', protect, createEvent);

// Get all events (public)
router.get('/', getAllEvents);

// Get single event (public)
router.get('/:id', getEventById);

// Update event (organizer only)
router.patch('/:id', protect, updateEvent);

// Delete event (organizer only)
router.delete('/:id', protect, deleteEvent);

// RSVP to event
router.post('/:id/rsvp', protect, rsvpEvent);

// Cancel RSVP
router.delete('/:id/rsvp', protect, cancelRsvp);

module.exports = router;
