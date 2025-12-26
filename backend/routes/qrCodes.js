const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const QRCode = require('qrcode');

// Generate QR codes for an event (ORGANIZER/ADMIN)
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const registrations = await Registration.find({ eventId }).limit(50);
    
    const qrCodes = [];
    for (const registration of registrations) {
      const qrData = {
        registrationId: registration._id,
        eventId,
        studentId: registration.userId,
        studentName: registration.studentName,
        checkInCode: `CHECKIN-${registration._id.toString().slice(-8)}`
      };
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      
      qrCodes.push({
        registrationId: registration._id,
        studentName: registration.studentName,
        email: registration.email,
        qrCode,
        checkInCode: qrData.checkInCode,
        downloadUrl: `/api/qr-codes/${registration._id}/download`
      });
    }
    
    res.json({
      success: true,
      event: { title: event.title, date: event.date, venue: event.venue },
      qrCodes,
      total: qrCodes.length
    });
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate QR codes', error: err.message });
  }
});

// ⭐ NEW ROUTE FOR STUDENTS - Get your own QR code
router.get('/student/event/:eventId', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id || req.user._id;
    
    console.log('📱 Student requesting QR:', { userId, eventId });
    
    // Find student's registration
    const registration = await Registration.findOne({
      eventId: eventId,
      userId: userId
    });
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }
    
    // Get event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Return existing QR if available
    if (registration.qrCode) {
      return res.json({
        success: true,
        qrCode: registration.qrCode,
        registration: {
          id: registration._id,
          studentName: registration.studentName,
          checkInCode: registration._id.toString().slice(-8).toUpperCase()
        },
        event: {
          title: event.title,
          date: event.date,
          venue: event.venue
        }
      });
    }
    
    // Generate new QR code
    const qrData = {
      registrationId: registration._id.toString(),
      eventId: eventId,
      studentId: userId.toString(),
      studentName: registration.studentName,
      checkInCode: `CHECKIN-${registration._id.toString().slice(-8)}`,
      timestamp: Date.now()
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2
    });
    
    // Save to registration
    registration.qrCode = qrCodeDataUrl;
    await registration.save();
    
    console.log('✅ QR generated for:', registration.studentName);
    
    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      registration: {
        id: registration._id,
        studentName: registration.studentName,
        checkInCode: registration._id.toString().slice(-8).toUpperCase()
      },
      event: {
        title: event.title,
        date: event.date,
        venue: event.venue
      }
    });
    
  } catch (err) {
    console.error('❌ Student QR error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: err.message
    });
  }
});

// Download single QR code
router.get('/:registrationId/download', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { registrationId } = req.params;
    
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    const qrData = {
      registrationId: registration._id,
      eventId: registration.eventId,
      studentId: registration.userId,
      studentName: registration.studentName,
      checkInCode: `CHECKIN-${registration._id.toString().slice(-8)}`
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    
    // Return as downloadable PNG
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length,
      'Content-Disposition': `attachment; filename="qr-${registration.studentName.replace(/\s+/g, '-')}.png"`
    });
    
    res.end(imgBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to download QR code', error: err.message });
  }
});

// Bulk download QR codes
router.get('/event/:eventId/bulk-download', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    
    res.json({
      success: true,
      message: 'Bulk download prepared. In production, this would generate a ZIP file.',
      downloadUrl: `/api/qr-codes/bulk/${eventId}/zip`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to prepare bulk download', error: err.message });
  }
});

module.exports = router;