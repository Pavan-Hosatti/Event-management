const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', eventsController.getEvents);
router.get('/upcoming', eventsController.getUpcomingEvents);
router.get('/:id', eventsController.getEvent);
router.get('/clubs', eventsController.getClubs || ((req, res) => res.json({ clubs: [] })));

// Protected routes - Registration
router.post('/:id/register', protect, eventsController.registerForEvent);
router.get('/registrations/user/:userId', protect, eventsController.getRegistrationsForUser);
router.get('/registrations/past/user/:userId', protect, eventsController.getPastEventsForUser);
router.patch('/registrations/:regId', protect, eventsController.updateRegistration);
router.delete('/registrations/:regId', protect, eventsController.deleteRegistration);

// Check-in & QR Code
router.patch('/:eventId/registrations/:regId/checkin', protect, eventsController.checkinRegistration);
router.post('/verify-qr', protect, eventsController.verifyQRCode);

// Certificate routes
router.get('/:eventId/registrations/:regId/certificate/status', protect, eventsController.getCertificateStatus);
router.get('/:eventId/registrations/:regId/certificate/download', protect, eventsController.getCertificate);

// Feedback routes
router.post('/:eventId/feedback', protect, eventsController.submitFeedback);
router.get('/:eventId/feedback', eventsController.getEventFeedback);

// Analytics
router.get('/analytics/:eventId', protect, eventsController.getEventAnalytics);

module.exports = router;