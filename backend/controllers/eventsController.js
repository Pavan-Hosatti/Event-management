const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback'); // You need to create this model
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');


// ============================================
// CREATE EVENT - ADD THIS FUNCTION
// ============================================
exports.createEvent = async (req, res) => {
  try {
    console.log('📝 Create Event Request:', {
      user: req.user?.email,
      role: req.user?.role,
      body: req.body
    });

    const {
      title,
      description,
      date,
      time,
      venue,
      capacity,
      category,
      organizer,
      tags,
      imageUrl,
      status,
      maxParticipants  // ADD THIS - might be what frontend sends
    } = req.body;

    console.log('🔍 Parsed body fields:', {
      title, date, venue, capacity, maxParticipants
    });

    // FIXED: More flexible validation
    if (!title || !date) {
      console.log('❌ Missing required fields:', { title, date });
      return res.status(400).json({
        success: false,
        message: 'Please provide at least title and date'
      });
    }

    // Use maxParticipants if capacity not provided
    const eventCapacity = capacity || maxParticipants || 50;
    
    // Use organizer name from user if not provided
    const organizerName = organizer || req.user.name || req.user.email;
    
    // Use default venue if not provided
    const eventVenue = venue || 'To be announced';

    // Create event with defaults
    const eventData = {
      title,
      description: description || 'Event description',
      date: new Date(date),
      time: time || '10:00 AM',
      venue: eventVenue,
      capacity: parseInt(eventCapacity),
      category: category || 'General',
      organizer: organizerName,
      organizerId: req.user._id || req.user.id, // Try both
      tags: tags || [],
      imageUrl: imageUrl || '',
      status: status || 'published',
      registeredCount: 0,
      attendedCount: 0,
      certificateEnabled: true,
      qrCodeEnabled: true,
      createdAt: new Date()
    };

    console.log('📄 Final event data:', eventData);

    // Create event
    const event = await Event.create(eventData);

    console.log('✅ Event created successfully:', event._id);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });

  } catch (err) {
    console.error('❌ Create event error:', err);
    
    // More detailed error
    if (err.name === 'ValidationError') {
      console.log('Validation errors:', err.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.keys(err.errors).map(key => ({
          field: key,
          message: err.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: err.message
    });
  }
};

// NOW YOUR EXISTING getUpcomingEvents FUNCTION CONTINUES BELOW...

// ... keep all your existing functions above ...

// NEW: GET /api/events/upcoming - Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await Event.find({
      date: { $gte: today }
    }).sort({ date: 1 });
    
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming events', error: err.message });
  }
};






// NEW: GET /api/events/registrations/past/user/:userId - Get past events for user
exports.getPastEventsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    
    const registrations = await Registration.find({ 
      userId,
      $or: [
        { status: 'attended' },
        { checkInAt: { $exists: true } }
      ]
    }).populate('eventId');
    
    // Filter out events that are in the future
    const pastRegistrations = registrations.filter(reg => 
      reg.eventId && new Date(reg.eventId.date) < today
    );
    
    res.json({ success: true, registrations: pastRegistrations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch past events', error: err.message });
  }
};

// NEW: PATCH /api/events/registrations/:regId - Update registration (cancel, etc.)
exports.updateRegistration = async (req, res) => {
  try {
    const { regId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id || req.body.userId; // From auth middleware
    
    const registration = await Registration.findById(regId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    // Check if user owns this registration
    if (registration.userId !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // If cancelling, decrement event count
    if (status === 'cancelled' && registration.status !== 'cancelled') {
      const event = await Event.findById(registration.eventId);
      if (event) {
        event.registeredCount = Math.max(0, (event.registeredCount || 0) - 1);
        await event.save();
      }
    }
    
    registration.status = status;
    await registration.save();
    
    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update registration', error: err.message });
  }
};

// NEW: DELETE /api/events/registrations/:regId - Cancel registration
exports.deleteRegistration = async (req, res) => {
  try {
    const { regId } = req.params;
    const userId = req.user?.id || req.body.userId;
    
    const registration = await Registration.findById(regId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    // Check if user owns this registration
    if (registration.userId !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Decrement event count
    const event = await Event.findById(registration.eventId);
    if (event) {
      event.registeredCount = Math.max(0, (event.registeredCount || 0) - 1);
      await event.save();
    }
    
    await registration.remove();
    
    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel registration', error: err.message });
  }
};

// NEW: GET /api/events/:eventId/registrations/:regId/certificate/status - Check certificate availability
exports.getCertificate = async (req, res) => {
  try {
    const { eventId, regId } = req.params;
    
    console.log('📥 Download certificate request:', { eventId, regId });
    
    // Find registration
    const registration = await Registration.findOne({
      _id: regId,
      eventId: eventId
    });
    
    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }
    
    console.log('Registration:', {
      student: registration.studentName,
      attended: registration.attended,
      checkInAt: registration.checkInAt,
      status: registration.status,
      certificateIssued: registration.certificateIssued
    });
    
    // Check if attended
    if (!registration.attended && !registration.checkInAt && registration.status !== 'attended') {
      return res.status(403).json({ 
        success: false, 
        message: 'You were marked absent. Cannot download certificate.' 
      });
    }
    
    // Check if certificate issued
    if (!registration.certificateIssued) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not yet issued by organizer' 
      });
    }
    
    // Find certificate in Certificate model
    const Certificate = require('../models/Certificate');
    const certificate = await Certificate.findOne({
      registrationId: regId,
      eventId: eventId
    });
    
    if (!certificate) {
      // Try to find any certificate file in uploads folder
      const certDir = path.join(__dirname, '../uploads/certificates');
      const files = fs.readdirSync(certDir);
      
      // Find file that matches this event
      const certFile = files.find(file => file.includes(eventId));
      
      if (certFile) {
        const filePath = path.join(certDir, certFile);
        console.log('✅ Certificate file found:', certFile);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${certFile}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        return;
      }
      
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate file not found' 
      });
    }
    
    // Certificate found in database
    const certificatePath = path.join(__dirname, '..', certificate.certificateUrl);
    
    console.log('Certificate path:', certificatePath);
    
    if (!fs.existsSync(certificatePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate file not found on server' 
      });
    }
    
    console.log('✅ Sending certificate file');
    
    // Set headers
    res.setHeader('Content-Type', certificate.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${registration.studentName}.pdf"`);
    
    // Stream file
    const fileStream = fs.createReadStream(certificatePath);
    fileStream.pipe(res);
    
  } catch (err) {
    console.error('❌ Certificate download error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download certificate', 
      error: err.message 
    });
  }
};

// NEW: POST /api/events/:eventId/feedback - Submit feedback
// REPLACE your existing submitFeedback with this:

exports.submitFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, rating, comment, anonymous } = req.body;
    
    console.log('📝 Submit feedback:', { eventId, userId, rating });
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Check if event exists
    const Event = require('../models/Event');
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if user attended the event
    const Registration = require('../models/Registration');
    const registration = await Registration.findOne({
      eventId,
      userId,
      $or: [
        { status: 'attended' },
        { attended: true },
        { checkInAt: { $exists: true } }
      ]
    });
    
    if (!registration) {
      return res.status(403).json({ 
        success: false, 
        message: 'You must have attended the event to submit feedback' 
      });
    }
    
    // Check if feedback already exists
    const Feedback = require('../models/Feedback');
    const existingFeedback = await Feedback.findOne({ eventId, userId });
    
    if (existingFeedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted feedback for this event' 
      });
    }
    
    // Get user info for non-anonymous feedback
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    // Create feedback
    const feedback = await Feedback.create({
      eventId,
      userId,
      studentName: anonymous ? null : (user?.name || registration.studentName),
      rating,
      comment: comment || '',
      anonymous: anonymous || false,
      createdAt: new Date()
    });
    
    console.log('✅ Feedback created:', feedback._id);
    
    // Update event's average rating
    const allFeedback = await Feedback.find({ eventId });
    const avgRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;
    
    await Event.findByIdAndUpdate(eventId, {
      averageRating: avgRating.toFixed(1),
      feedbackCount: allFeedback.length
    });
    
    res.status(201).json({ 
      success: true, 
      feedback,
      message: 'Feedback submitted successfully' 
    });
    
  } catch (err) {
    console.error('❌ Submit feedback error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feedback', 
      error: err.message 
    });
  }
};

// NEW: GET /api/events/:eventId/feedback - Get event feedback
exports.getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    console.log('📊 Fetching feedback for event:', eventId);
    
    // Check if event exists
    const Event = require('../models/Event');
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get all feedback for this event
    const Feedback = require('../models/Feedback');
    const feedback = await Feedback.find({ eventId })
      .sort({ createdAt: -1 }) // Changed from submittedAt to createdAt
      .lean();
    
    console.log(`✅ Found ${feedback.length} feedback entries`);
    
    // Calculate stats
    const stats = {
      totalFeedback: feedback.length,
      averageRating: feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0,
      ratingDistribution: {
        5: feedback.filter(f => f.rating === 5).length,
        4: feedback.filter(f => f.rating === 4).length,
        3: feedback.filter(f => f.rating === 3).length,
        2: feedback.filter(f => f.rating === 2).length,
        1: feedback.filter(f => f.rating === 1).length,
      }
    };
    
    res.json({ 
      success: true, 
      feedback,  // Changed from 'feedbacks' to 'feedback'
      stats,
      eventTitle: event.title
    });
    
  } catch (err) {
    console.error('❌ Get feedback error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feedback', 
      error: err.message 
    });
  }
};




// ADD THIS TO eventsController.js - COMPLETE registerForEvent

exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params; // event ID
    const userId = req.user.id;
    const { studentName, email, department } = req.body;
    
    console.log('📝 Registration request:', {
      eventId: id,
      userId,
      studentName,
      email
    });
    
    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if already registered
    const existingReg = await Registration.findOne({ 
      eventId: id, 
      userId 
    });
    
    if (existingReg) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already registered for this event' 
      });
    }
    
    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event is full' 
      });
    }
    
    // Create registration
    const registration = await Registration.create({
      eventId: id,
      userId,
      studentName: studentName || req.user.name,
      email: email || req.user.email,
      department: department || req.user.department || '',
      status: 'registered',
      registeredAt: new Date()
    });
    
    // Update event count
    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();
    
    console.log('✅ Registration created:', registration._id);
    
    res.status(201).json({ 
      success: true, 
      registration,
      message: 'Successfully registered for event' 
    });
    
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register for event', 
      error: err.message 
    });
  }
};

// ✅ Also add getEvents to show ALL events
// ADD THIS TO eventsController.js if it doesn't exist:

exports.getEvents = async (req, res) => {
  try {
    console.log('📋 GET /api/events - Fetching all events');
    
    const { status, category, search } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    } else {
      // Default: only show published events to students
      query.status = 'published';
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search in title/description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Query:', query);
    
    // Fetch events
    const events = await Event.find(query)
      .sort({ date: 1 }) // Sort by date ascending
      .lean();
    
    console.log(`✅ Found ${events.length} events`);
    
    res.json({ 
      success: true, 
      events,
      count: events.length
    });
    
  } catch (err) {
    console.error('❌ Get events error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events', 
      error: err.message 
    });
  }
};


// ✅ Also ensure getEvent (single) exists:
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📄 GET /api/events/${id}`);
    
    const event = await Event.findById(id).lean();
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    console.log('✅ Event found:', event.title);
    
    res.json({ 
      success: true, 
      event 
    });
    
  } catch (err) {
    console.error('❌ Get event error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event', 
      error: err.message 
    });
  }
};

// ✅ Get single event
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event', 
      error: err.message 
    });
  }
};

// NEW: POST /api/events/verify-qr - Verify QR code for check-in
exports.verifyQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format' });
    }
    
    const { registrationId, eventId, userId } = parsedData;
    
    // Find registration
    const registration = await Registration.findOne({
      _id: registrationId,
      eventId,
      userId
    }).populate('eventId');
    
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    // Check if already checked in
    if (registration.checkInAt) {
      return res.json({
        success: true,
        alreadyCheckedIn: true,
        message: 'Already checked in',
        registration,
        event: registration.eventId
      });
    }
    
    // Check event date
    const eventDate = new Date(registration.eventId.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event date has passed' 
      });
    }
    
    // Check if event is today (allow check-in on event day)
    const isToday = eventDate.toDateString() === today.toDateString();
    if (!isToday && eventDate > today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Check-in available only on event day' 
      });
    }
    
    // Perform check-in
    registration.status = 'attended';
    registration.checkInAt = new Date();
    await registration.save();
    
    res.json({
      success: true,
      message: 'Check-in successful',
      registration,
      event: registration.eventId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to verify QR code', error: err.message });
  }
};

// NEW: GET /api/events/analytics/:eventId - Get event analytics
// Add these exports at the END of your adminController.js file
exports.getAnalyticsReports = async (req, res) => {
  try {
    const { eventId, period = 'month' } = req.query;
    
    // If eventId is provided, get specific event analytics
    if (eventId) {
      return getEventAnalytics(req, res);
    }
    
    // Get overall system analytics
    const today = new Date();
    const events = await Event.find();
    const registrations = await Registration.find();
    const feedback = await Feedback.find();
    
    // Calculate monthly stats for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const monthEvents = events.filter(e => 
        e.date >= monthStart && e.date <= monthEnd
      );
      
      const monthRegistrations = registrations.filter(r => 
        r.registeredAt >= monthStart && r.registeredAt <= monthEnd
      );
      
      const monthFeedback = feedback.filter(f => 
        f.createdAt >= monthStart && f.createdAt <= monthEnd
      );
      
      monthlyStats.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        events: monthEvents.length,
        registrations: monthRegistrations.length,
        avgRating: monthFeedback.length > 0 
          ? monthFeedback.reduce((sum, f) => sum + f.rating, 0) / monthFeedback.length 
          : 0,
        attendanceRate: monthRegistrations.length > 0
          ? (monthRegistrations.filter(r => r.attended).length / monthRegistrations.length * 100)
          : 0
      });
    }
    
    // Calculate overall stats
    const overallStats = {
      totalEvents: events.length,
      totalRegistrations: registrations.length,
      totalAttended: registrations.filter(r => r.attended).length,
      averageAttendanceRate: registrations.length > 0
        ? (registrations.filter(r => r.attended).length / registrations.length * 100).toFixed(1)
        : 0,
      averageRating: feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0,
      eventsByStatus: {
        published: events.filter(e => e.status === 'published').length,
        draft: events.filter(e => e.status === 'draft').length,
        completed: events.filter(e => e.status === 'completed').length,
        cancelled: events.filter(e => e.status === 'cancelled').length
      }
    };
    
    // Top performing events
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const eventRegistrations = await Registration.find({ eventId: event._id });
      const eventFeedback = await Feedback.find({ eventId: event._id });
      
      return {
        id: event._id,
        title: event.title,
        date: event.date,
        registrations: eventRegistrations.length,
        attended: eventRegistrations.filter(r => r.attended).length,
        attendanceRate: eventRegistrations.length > 0
          ? (eventRegistrations.filter(r => r.attended).length / eventRegistrations.length * 100).toFixed(1)
          : 0,
        avgRating: eventFeedback.length > 0
          ? (eventFeedback.reduce((sum, f) => sum + f.rating, 0) / eventFeedback.length).toFixed(1)
          : 0,
        capacityUtilization: (eventRegistrations.length / event.capacity * 100).toFixed(1)
      };
    }));
    
    const topEvents = eventsWithStats
      .filter(e => e.registrations > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 5);
    
    res.json({
      success: true,
      monthlyStats,
      overallStats,
      topEvents,
      summary: {
        totalEvents: events.length,
        upcomingEvents: events.filter(e => e.date > today).length,
        activeRegistrations: registrations.filter(r => r.status === 'registered').length,
        completedEvents: events.filter(e => e.date < today && e.status === 'published').length
      }
    });
    
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics', 
      error: err.message 
    });
  }
};

// Event-specific analytics
exports.getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    const registrations = await Registration.find({ eventId });
    const feedback = await Feedback.find({ eventId });
    
    // Registration timeline (last 7 days before event)
    const registrationTimeline = [];
    const eventDate = new Date(event.date);
    const sevenDaysBefore = new Date(eventDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysBefore);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = registrations.filter(r => 
        r.registeredAt >= date && r.registeredAt < nextDate
      ).length;
      
      registrationTimeline.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }
    
    // Department breakdown
    const departmentBreakdown = {};
    registrations.forEach(reg => {
      if (reg.department) {
        departmentBreakdown[reg.department] = 
          (departmentBreakdown[reg.department] || 0) + 1;
      }
    });
    
    // Check-in times
    const checkInTimes = registrations
      .filter(r => r.checkInAt)
      .map(r => ({
        time: r.checkInAt,
        student: r.studentName,
        department: r.department
      }));
    
    const analytics = {
      eventInfo: {
        title: event.title,
        date: event.date,
        venue: event.venue,
        capacity: event.capacity
      },
      registrationStats: {
        totalRegistered: registrations.length,
        attended: registrations.filter(r => r.attended).length,
        attendanceRate: registrations.length > 0
          ? (registrations.filter(r => r.attended).length / registrations.length * 100).toFixed(1)
          : 0,
        capacityUtilization: (registrations.length / event.capacity * 100).toFixed(1),
        noShowRate: registrations.length > 0
          ? (registrations.filter(r => !r.attended).length / registrations.length * 100).toFixed(1)
          : 0
      },
      feedbackStats: {
        totalResponses: feedback.length,
        averageRating: feedback.length > 0
          ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
          : 0,
        ratingDistribution: {
          5: feedback.filter(f => f.rating === 5).length,
          4: feedback.filter(f => f.rating === 4).length,
          3: feedback.filter(f => f.rating === 3).length,
          2: feedback.filter(f => f.rating === 2).length,
          1: feedback.filter(f => f.rating === 1).length
        },
        positivePercentage: feedback.length > 0
          ? (feedback.filter(f => f.rating >= 4).length / feedback.length * 100).toFixed(1)
          : 0
      },
      demographic: {
        departmentBreakdown,
        registrationTimeline,
        checkInTimes
      }
    };
    
    res.json({
      success: true,
      analytics
    });
    
  } catch (err) {
    console.error('Event analytics error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event analytics', 
      error: err.message 
    });
  }
};



// ADD/REPLACE in eventsController.js:

exports.getRegistrationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📋 Get registrations for user:', userId);
    
    // Get registrations with populated event data
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registeredAt: -1 })
      .lean();
    
    console.log(`✅ Found ${registrations.length} registrations`);
    
    // Format response with all needed fields
    const formattedRegistrations = registrations.map(reg => ({
      _id: reg._id,
      eventId: reg.eventId?._id || reg.eventId,
      event: reg.eventId ? {
        _id: reg.eventId._id,
        title: reg.eventId.title,
        date: reg.eventId.date,
        venue: reg.eventId.venue,
        category: reg.eventId.category
      } : null,
      userId: reg.userId,
      studentName: reg.studentName,
      email: reg.email,
      department: reg.department,
      status: reg.status,
      registeredAt: reg.registeredAt,
      checkInAt: reg.checkInAt,
      attended: reg.attended || reg.checkInAt ? true : false,
      certificateIssued: reg.certificateIssued || false,
      certificateId: reg.certificateId || null,
      qrCode: reg.qrCode || null
    }));
    
    res.json({ 
      success: true, 
      registrations: formattedRegistrations,
      count: formattedRegistrations.length
    });
    
  } catch (err) {
    console.error('❌ Get registrations error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch registrations', 
      error: err.message 
    });
  }
};


// ALSO ADD getRegistrationsForEvent:
exports.getRegistrationsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    console.log('📋 Get registrations for event:', eventId);
    
    const registrations = await Registration.find({ eventId })
      .sort({ registeredAt: -1 })
      .lean();
    
    console.log(`✅ Found ${registrations.length} registrations`);
    
    // Format with attendance info
    const formatted = registrations.map(reg => ({
      _id: reg._id,
      studentName: reg.studentName,
      studentId: reg.userId,
      email: reg.email,
      department: reg.department,
      registeredAt: reg.registeredAt,
      status: reg.status,
      checkInAt: reg.checkInAt,
      attended: reg.attended || reg.checkInAt ? true : false,
      certificateIssued: reg.certificateIssued || false
    }));
    
    res.json({ 
      success: true, 
      registrations: formatted,
      totalRegistered: formatted.length,
      totalAttended: formatted.filter(r => r.attended).length
    });
    
  } catch (err) {
    console.error('❌ Get event registrations error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch registrations', 
      error: err.message 
    });
  }
};

// Add these to your eventsController.js

// GET /api/dashboard/stats - Enhanced dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const registrations = await Registration.find({ userId });
    const attended = registrations.filter(r => r.attended).length;
    
    // Calculate points based on various factors
    let points = 0;
    points += attended * 100; // 100 points per attended event
    points += registrations.filter(r => r.certificateIssued).length * 50; // 50 points per certificate
    points += Math.min(attended * 10, 500); // Engagement bonus
    
    // Calculate streak
    const today = new Date();
    const last7Days = registrations.filter(r => {
      const regDate = new Date(r.registeredAt);
      const diffDays = Math.floor((today - regDate) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;
    
    // Calculate level
    const level = Math.floor(points / 500) + 1;
    
    res.json({
      success: true,
      stats: {
        totalRegistrations: registrations.length,
        eventsAttended: attended,
        points,
        streak: last7Days,
        level,
        progress: Math.min((attended / 20) * 100, 100) // Progress toward next milestone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};




// GET /api/achievements/:userId - Get user achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const registrations = await Registration.find({ userId });
    const attended = registrations.filter(r => r.attended).length;
    
    const achievements = [
      {
        id: 'event_explorer',
        title: 'Event Explorer',
        description: 'Attend 10 events',
        unlocked: attended >= 10,
        progress: Math.min((attended / 10) * 100, 100),
        icon: 'Trophy',
        reward: 200
      },
      // Add more achievements...
    ];
    
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/leaderboard - Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    // This would typically aggregate data from all users
    const leaderboard = [
      { userId: '1', name: 'Sarah Chen', points: 2450, avatar: '...' },
      { userId: '2', name: 'Mike Ross', points: 2100, avatar: '...' },
      // Add more...
    ];
    
    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/notifications - Create notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    
    // Save notification to database
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      read: false
    });
    
    // Could integrate with WebSocket for real-time updates
    
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/notifications/:userId - Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};