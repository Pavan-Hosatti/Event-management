const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  issuerName: {
    type: String,
    default: 'University Event Management'
  },
  issuerSignature: {
    type: String,
    default: ''
  },
  certificateUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    default: 'pdf'
  },
  verified: {
    type: Boolean,
    default: true
  },
  verificationCode: {
    type: String,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  downloadedAt: {
    type: Date
  }
}, { timestamps: true });

// Generate verification code
certificateSchema.pre('save', function(next) {
  if (!this.verificationCode) {
    this.verificationCode = 'CERT-' + 
      Math.random().toString(36).substr(2, 9).toUpperCase() +
      '-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);