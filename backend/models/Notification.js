const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'reminder', 'alert', 'announcement', 'event_update'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  // Link to event if it's an event notification
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  eventTitle: String,
  // Link to registration if applicable
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  },
  // Metadata for extra info
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);