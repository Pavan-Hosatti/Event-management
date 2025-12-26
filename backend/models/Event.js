const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String },
  venue: { type: String, default: '' },
  venueDetails: { type: String, default: '' },
  capacity: { type: Number, default: 100 },
  registeredCount: { type: Number, default: 0 },
  status: { type: String, enum: ['published', 'draft', 'cancelled'], default: 'published' },
  category: { type: String, default: 'general' },
  organizer: { type: String, default: '' },
  organizerContact: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  isFree: { type: Boolean, default: true },
  certificateEnabled: { type: Boolean, default: true },
  poster: { type: String, default: '' },
  registrationDeadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
