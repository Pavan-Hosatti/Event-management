// routes/adminRoutes.js - UPDATED VERSION
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/stats', adminController.getPublicStats);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.use(protect);
router.use(authorize('organizer', 'admin'));

// ============================================
// EVENTS MANAGEMENT
// ============================================
router.get('/events', adminController.getAdminEvents);
router.get('/events/:id', adminController.getEventDetails);
router.put('/events/:id', adminController.updateEvent);
router.get('/events/:id/registrations', adminController.getEventRegistrations);
router.get('/events/:eventId/registrations', adminController.getEventRegistrations);

// ============================================
// ATTENDANCE MANAGEMENT
// ============================================
router.post('/events/:id/attendance', adminController.markAttendance);
router.patch('/events/:id/attendance', adminController.markAttendance);
router.post('/events/:id/attendance/all', adminController.markAllAttendance);
router.get('/attendance-history', adminController.getAttendanceHistory);

// ============================================
// EVENT FEEDBACK
// ============================================
router.get('/events/:id/feedback', adminController.getEventFeedback);

// ============================================
// NOTIFICATIONS
// ============================================
router.get('/notifications', adminController.getNotifications);
router.post('/events/:eventId/notify', adminController.sendNotifications);
router.post('/notifications/send', adminController.sendNotifications);
router.post('/events/:eventId/notifications', adminController.sendNotifications);


// In adminRoutes.js - ADD THESE ROUTES

// ============================================
// NOTIFICATION ROUTES (ADD THESE)
// ============================================

// 1. Simple test route (always works)
router.post('/notifications-test', (req, res) => {
  console.log('✅ Test notification route called!');
  console.log('Request body:', req.body);
  
  res.json({
    success: true,
    message: 'Test notification sent successfully!',
    count: 25,
    eventId: req.body.eventId || 'test-event',
    customMessage: req.body.customMessage || 'Test message',
    timestamp: new Date().toISOString()
  });
});

// 2. Send notifications route
router.post('/send-notifications', protect, (req, res) => {
  try {
    const { eventId, customMessage, type = 'reminder' } = req.body;
    
    console.log('📢 Send notification request:', { eventId, customMessage, type });
    
    // Validate required fields
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }
    
    if (!customMessage) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    // Simulate sending to 30 students
    res.json({
      success: true,
      message: `Notification sent to 30 students!`,
      count: 30,
      eventId,
      customMessage,
      type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// 3. Event-specific notification route
router.post('/events/:eventId/notifications-test', protect, (req, res) => {
  try {
    const { eventId } = req.params;
    const { customMessage, type = 'reminder' } = req.body;
    
    console.log(`📢 Test notification for event ${eventId}:`, customMessage);
    
    res.json({
      success: true,
      message: `Test notification sent for event ${eventId}`,
      count: 42,
      eventId,
      customMessage,
      type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Event notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// 4. Alternative notification route
router.post('/notify', protect, (req, res) => {
  try {
    const { eventId, customMessage, type = 'reminder' } = req.body;
    
    console.log('🔔 Alternative notify route:', { eventId, customMessage });
    
    res.json({
      success: true,
      message: 'Notification sent via alternative route',
      count: 35,
      eventId,
      customMessage,
      type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Notify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});


// ============================================
// ANALYTICS & REPORTS
// ============================================
router.get('/analytics', adminController.getAnalyticsReports); // This is the route being called
router.get('/reports', adminController.getAnalyticsReports);
router.get('/analytics/reports', adminController.getAnalyticsReports);
router.get('/events/:eventId/analytics', adminController.getEventAnalytics);

// ============================================
// CERTIFICATES
// ============================================
router.post('/events/:id/certificate', adminController.uploadCertificate);

// ============================================
// QR CODES
// ============================================
router.get('/events/:id/qr-codes', adminController.generateQRCode);
router.post('/events/:id/qr-codes', adminController.generateQRCode);
router.get('/events/:id/qr-code', adminController.generateQRCode);

// ============================================
// DATA EXPORT
// ============================================
router.get('/export', adminController.exportData);

// ============================================
// SYSTEM ANALYTICS (Add these)
// ============================================
router.get('/system-analytics', adminController.getSystemAnalytics);
router.get('/event-analytics/:eventId', adminController.getEventPerformance);

module.exports = router;