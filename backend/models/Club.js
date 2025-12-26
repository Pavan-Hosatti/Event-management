const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'academic', 'social'],
    default: 'technical'
  },
  presidentId: {
    type: String,
    required: true
  },
  presidentName: {
    type: String,
    required: true
  },
  facultyCoordinator: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  membersCount: {
    type: Number,
    default: 0
  },
  eventsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  socialLinks: {
    instagram: String,
    linkedin: String,
    website: String,
    whatsapp: String
  },
  establishedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);