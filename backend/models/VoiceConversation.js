// models/VoiceConversation.js
const mongoose = require('mongoose');

const voiceConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'anonymous'
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userText: {
    type: String,
    required: true
  },
  aiText: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    default: 'kn-IN'
  }
}, {
  timestamps: true
});

// Index for efficient queries
voiceConversationSchema.index({ userId: 1, timestamp: -1 });
voiceConversationSchema.index({ sessionId: 1, timestamp: 1 });

// TTL index to auto-delete old conversations after 30 days
voiceConversationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const VoiceConversation = mongoose.model('VoiceConversation', voiceConversationSchema);

module.exports = VoiceConversation;