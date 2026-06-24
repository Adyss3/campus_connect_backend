const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
      trim: true
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true
    },
    image: {
      type: String,
      default: 'default-event.jpg'
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    organizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event must have an organizer']
    },
    rsvps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
