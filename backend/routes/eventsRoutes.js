// REPLACE eventsRoutes.js WITH THIS CORRECT ORDER:

const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { protect, authorize } = require('../middleware/auth');

// ✅ PUBLIC ROUTES FIRST (NO AUTH)
router.get('/', eventsController.getEvents);
router.get('/upcoming', eventsController.getUpcomingEvents || eventsController.getEvents);
router.get('/clubs', eventsController.getClubs || ((req, res) => res.json({ success: true, clubs: [] })));

// ✅ SPECIFIC ROUTES BEFORE :id
router.post('/verify-qr', protect, eventsController.verifyQRCode || ((req, res) => res.status(501).json({ success: false })));

// ✅ SINGLE EVENT (MUST BE AFTER SPECIFIC ROUTES)
router.get('/:id', eventsController.getEvent);

// ✅ PROTECTED CREATE/UPDATE
router.post('/', protect, authorize('organizer', 'admin'), eventsController.createEvent);
router.post('/create', protect, authorize('organizer', 'admin'), eventsController.createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), eventsController.updateEvent || ((req, res) => res.status(501).json({ success: false })));

// ✅ REGISTRATION ROUTES (STUDENT)
router.post('/:id/register', protect, eventsController.registerForEvent);
router.get('/registrations/user/:userId', protect, eventsController.getRegistrationsForUser || ((req, res) => res.json({ success: true, registrations: [] })));
router.get('/registrations/past/user/:userId', protect, eventsController.getPastEventsForUser || ((req, res) => res.json({ success: true, events: [] })));
router.patch('/registrations/:regId', protect, eventsController.updateRegistration || ((req, res) => res.status(501).json({ success: false })));
router.delete('/registrations/:regId', protect, eventsController.deleteRegistration || ((req, res) => res.status(501).json({ success: false })));

// ✅ ORGANIZER ROUTES
router.get('/registrations/event/:eventId', protect, authorize('organizer', 'admin'), eventsController.getRegistrationsForEvent || ((req, res) => res.json({ success: true, registrations: [] })));
router.patch('/:eventId/registrations/:regId/checkin', protect, authorize('organizer', 'admin'), eventsController.checkinRegistration || ((req, res) => res.status(501).json({ success: false })));

// ✅ CERTIFICATE ROUTES
router.get('/:eventId/registrations/:regId/certificate/status', protect, eventsController.getCertificateStatus || ((req, res) => res.json({ success: true, available: false })));
router.post('/:eventId/registrations/:regId/certificate', protect, authorize('organizer', 'admin'), eventsController.issueCertificate || ((req, res) => res.status(501).json({ success: false })));
router.get('/:eventId/registrations/:regId/certificate/download', protect, eventsController.getCertificate || ((req, res) => res.status(404).json({ success: false })));

// ✅ FEEDBACK
router.post('/:eventId/feedback', protect, eventsController.submitFeedback || ((req, res) => res.status(501).json({ success: false })));
router.get('/:eventId/feedback', eventsController.getEventFeedback || ((req, res) => res.json({ success: true, feedback: [] })));

// ✅ ANALYTICS
router.get('/analytics/:eventId', protect, authorize('organizer', 'admin'), eventsController.getEventAnalytics || ((req, res) => res.json({ success: true, analytics: {} })));

module.exports = router;