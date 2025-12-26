const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: String, required: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, default: '' },
  status: { type: String, enum: ['registered','attended','cancelled'], default: 'registered' },
  registeredAt: { type: Date, default: Date.now },
  // Attendance & certificate fields
  checkInAt: { type: Date, default: null },
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: String, default: null },
  qrCode: String,  // ADD THIS LINE
});

module.exports = mongoose.model('Registration', RegistrationSchema);
