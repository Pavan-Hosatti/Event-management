const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// GET /api/admin/events - Get all events for admin
router.get('/', protect, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    
    // Add registration counts
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const registrations = await Registration.countDocuments({ eventId: event._id });
      const attended = await Registration.countDocuments({ 
        eventId: event._id, 
        status: 'attended' 
      });
      
      return {
        ...event.toObject(),
        registered: registrations,
        attended: attended,
        attendanceRate: registrations > 0 ? Math.round((attended / registrations) * 100) : 0
      };
    }));
    
    res.json({ success: true, events: eventsWithStats });
  } catch (err) {
    console.error('Error fetching admin events:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events',
      error: err.message 
    });
  }
});

// GET /api/admin/events/:id - Get event details for admin
router.get('/:id', protect, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const registrations = await Registration.find({ eventId: req.params.id });
    const attended = registrations.filter(r => r.status === 'attended').length;
    
    res.json({
      success: true,
      event: {
        ...event.toObject(),
        registrations: registrations.length,
        attended: attended,
        attendanceRate: registrations.length > 0 ? Math.round((attended / registrations.length) * 100) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch event', error: err.message });
  }
});

// DELETE /api/admin/events/:id - Delete event
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Delete associated registrations
    await Registration.deleteMany({ eventId: req.params.id });
    
    // Delete event
    await event.deleteOne();
    
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete event', error: err.message });
  }
});

module.exports = router;