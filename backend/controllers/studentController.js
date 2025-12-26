const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback'); // FIXED: Changed from feedback.model
const Notification = require('../models/Notification');
const DocumentRequest = require('../models/DocumentRequest'); // NEW
const Certificate = require('../models/Certificate'); // NEW
const User = require('../models/User'); // NEW
const QRCode = require('qrcode'); // NEW

// GET /api/student/dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all registrations for user
    const registrations = await Registration.find({ userId }).populate('eventId');
    
    // Get all events for stats
    const events = await Event.find();
    
    // Calculate statistics
    const totalRegistrations = registrations.length;
    const eventsAttended = registrations.filter(r => r.checkInAt).length;
    
    // Upcoming events (user registered for upcoming events)
    const upcomingEvents = events.filter(event => 
      new Date(event.date) >= today && 
      registrations.some(r => r.eventId?._id.toString() === event._id.toString())
    ).length;
    
    // Certificates earned
    const certificatesEarned = registrations.filter(r => r.certificateIssued).length;
    
    // Recent registrations (last 5)
    const recentRegistrations = registrations
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
      .slice(0, 5)
      .map(reg => ({
        eventId: reg.eventId?._id,
        eventTitle: reg.eventId?.title,
        eventDate: reg.eventId?.date,
        status: reg.status,
        registeredAt: reg.registeredAt,
        checkInAt: reg.checkInAt,
        certificateIssued: reg.certificateIssued
      }));
    
    // Upcoming events (all, not just registered)
    const allUpcomingEvents = await Event.find({
      date: { $gte: today }
    })
    .sort({ date: 1 })
    .limit(10)
    .lean();
    
    // Add registration status to upcoming events
    const upcomingEventsWithStatus = allUpcomingEvents.map(event => {
      const registration = registrations.find(r => 
        r.eventId?._id.toString() === event._id.toString()
      );
      return {
        ...event,
        isRegistered: !!registration,
        registrationStatus: registration?.status,
        registrationId: registration?._id
      };
    });
    
    // Category breakdown for charts
    const categories = {};
    registrations.forEach(reg => {
      if (reg.eventId?.category) {
        const category = reg.eventId.category;
        categories[category] = (categories[category] || 0) + 1;
      }
    });
    
    const categoryStats = Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }));
    
    // Activity timeline (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const activityTimeline = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = monthNames[date.getMonth()];
      
      const registrationsThisMonth = registrations.filter(reg => {
        const regDate = new Date(reg.registeredAt);
        return regDate.getMonth() === date.getMonth() && 
               regDate.getFullYear() === date.getFullYear();
      }).length;
      
      activityTimeline.push({
        month: `${month} ${date.getFullYear().toString().slice(2)}`,
        events: registrationsThisMonth
      });
    }
    
    // Recent notifications (if notification model exists)
    let recentNotifications = [];
    try {
      recentNotifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    } catch (err) {
      console.log('Notifications not configured yet');
    }
    
    // Dashboard data
    const dashboardData = {
      stats: {
        totalRegistrations,
        eventsAttended,
        upcomingEvents,
        certificatesEarned
      },
      recentRegistrations,
      upcomingEvents: upcomingEventsWithStatus,
      charts: {
        categoryStats,
        activityTimeline
      },
      recentNotifications,
      user: {
        id: req.user.id,
        name: req.user.name || req.user.studentName || 'Student',
        email: req.user.email,
        department: req.user.department
      }
    };
    
    res.json({ success: true, ...dashboardData });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load dashboard', 
      error: err.message 
    });
  }
};

// GET /api/student/upcoming-events
exports.getStudentUpcomingEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get user's registrations
    const registrations = await Registration.find({ userId });
    
    // Get upcoming events
    const events = await Event.find({
      date: { $gte: today }
    }).sort({ date: 1 });
    
    // Add registration info to events
    const eventsWithRegistration = events.map(event => {
      const registration = registrations.find(r => 
        r.eventId.toString() === event._id.toString()
      );
      
      return {
        ...event.toObject(),
        isRegistered: !!registration,
        registrationId: registration?._id,
        registrationStatus: registration?.status,
        checkInAt: registration?.checkInAt
      };
    });
    
    res.json({ success: true, events: eventsWithRegistration });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch upcoming events', 
      error: err.message 
    });
  }
};

// GET /api/student/past-events
exports.getStudentPastEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registeredAt: -1 });
    
    // Filter past events
    const pastRegistrations = registrations.filter(reg => 
      reg.eventId && new Date(reg.eventId.date) < today
    );
    
    // Add feedback info if available
    const registrationsWithFeedback = await Promise.all(
      pastRegistrations.map(async (reg) => {
        const feedback = await Feedback.findOne({
          eventId: reg.eventId._id,
          userId
        });
        
        return {
          ...reg.toObject(),
          feedbackSubmitted: !!feedback,
          feedbackRating: feedback?.rating,
          feedbackComment: feedback?.comment
        };
      })
    );
    
    res.json({ success: true, registrations: registrationsWithFeedback });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch past events', 
      error: err.message 
    });
  }
};

// GET /api/student/certificates
exports.getStudentCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const registrations = await Registration.find({ 
      userId, 
      certificateIssued: true 
    })
    .populate('eventId')
    .sort({ checkInAt: -1 });
    
    const certificates = registrations.map(reg => ({
      certificateId: reg.certificateId,
      eventId: reg.eventId._id,
      eventTitle: reg.eventId.title,
      eventDate: reg.eventId.date,
      studentName: reg.studentName,
      issuedAt: reg.updatedAt, // When certificate was issued
      downloadUrl: `/api/events/${reg.eventId._id}/registrations/${reg._id}/certificate/download`
    }));
    
    res.json({ success: true, certificates });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch certificates', 
      error: err.message 
    });
  }
};

// GET /api/student/activity
exports.getStudentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;
    
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registeredAt: -1 })
      .limit(parseInt(limit));
    
    const activity = registrations.map(reg => {
      const activityType = reg.checkInAt ? 'attended' : 
                         reg.status === 'cancelled' ? 'cancelled' : 
                         'registered';
      
      let description = '';
      switch (activityType) {
        case 'registered':
          description = `Registered for "${reg.eventId?.title}"`;
          break;
        case 'attended':
          description = `Attended "${reg.eventId?.title}"`;
          break;
        case 'cancelled':
          description = `Cancelled registration for "${reg.eventId?.title}"`;
          break;
      }
      
      return {
        type: activityType,
        description,
        eventId: reg.eventId?._id,
        eventTitle: reg.eventId?.title,
        date: activityType === 'attended' ? reg.checkInAt : reg.registeredAt,
        certificateIssued: reg.certificateIssued
      };
    });
    
    res.json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch activity', 
      error: err.message 
    });
  }
};

// GET /api/student/calendar
exports.getStudentCalendar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    const targetDate = month && year ? 
      new Date(year, month - 1, 1) : 
      new Date();
    
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    // Get user's registered events
    const registrations = await Registration.find({ userId })
      .populate('eventId');
    
    // Get all events in this month
    const events = await Event.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Combine data
    const calendarEvents = events.map(event => {
      const registration = registrations.find(r => 
        r.eventId?._id.toString() === event._id.toString()
      );
      
      return {
        id: event._id,
        title: event.title,
        start: new Date(event.date),
        end: new Date(event.date),
        allDay: true,
        type: registration ? 'registered' : 'available',
        registrationId: registration?._id,
        venue: event.venue,
        category: event.category
      };
    });
    
    res.json({ success: true, events: calendarEvents });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch calendar', 
      error: err.message 
    });
  }
};

// PUT /api/student/profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Update user profile (assuming you have a User model)
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: err.message 
    });
  }
};

// GET /api/student/notifications
exports.getStudentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false } = req.query;
    
    const query = { userId };
    if (unreadOnly) {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, notifications });
  } catch (err) {
    // If Notification model doesn't exist yet, return empty array
    res.json({ success: true, notifications: [] });
  }
};


// GET /api/student/registrations
exports.getStudentRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registeredAt: -1 });
    
    const formattedRegistrations = registrations.map(reg => ({
      _id: reg._id,
      eventId: reg.eventId?._id,
      eventTitle: reg.eventId?.title,
      eventDate: reg.eventId?.date,
      eventVenue: reg.eventId?.venue,
      status: reg.status,
      registeredAt: reg.registeredAt,
      checkInAt: reg.checkInAt,
      certificateIssued: reg.certificateIssued,
      certificateId: reg.certificateId
    }));
    
    res.json({ success: true, registrations: formattedRegistrations });
  } catch (err) {
    console.error('Get student registrations error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch registrations', 
      error: err.message 
    });
  }
};

// PATCH /api/student/notifications/:id/read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read', 
      error: err.message 
    });
  }
};

// GET /api/student/export-data
exports.exportStudentData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registeredAt: -1 });
    
    const feedbacks = await Feedback.find({ userId });
    
    const csvData = [];
    
    // Add header
    csvData.push([
      'Event Title',
      'Event Date',
      'Event Category',
      'Registration Date',
      'Status',
      'Check-in Time',
      'Certificate Issued',
      'Feedback Rating',
      'Feedback Comment'
    ].join(','));
    
    // Add data rows
    registrations.forEach(reg => {
      const feedback = feedbacks.find(f => 
        f.eventId.toString() === reg.eventId?._id.toString()
      );
      
      csvData.push([
        `"${reg.eventId?.title || 'N/A'}"`,
        reg.eventId?.date ? new Date(reg.eventId.date).toISOString().split('T')[0] : 'N/A',
        `"${reg.eventId?.category || 'N/A'}"`,
        reg.registeredAt ? new Date(reg.registeredAt).toISOString() : 'N/A',
        reg.status || 'pending',
        reg.checkInAt ? new Date(reg.checkInAt).toISOString() : 'N/A',
        reg.certificateIssued ? 'Yes' : 'No',
        feedback?.rating || 'N/A',
        `"${feedback?.comment || ''}"`
      ].join(','));
    });
    
    const csvContent = csvData.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="student-data-${userId}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data', 
      error: err.message 
    });
  }
};

// ========== NEW FUNCTIONS ADDED ==========

// GET /api/student/documents - Get student documents (certificates, letters, etc.)
exports.getStudentDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get certificates
    const certificates = await Certificate.find({ userId })
      .sort({ issuedAt: -1 });
    
    // Get document requests
    const documentRequests = await DocumentRequest.find({ studentId: userId })
      .sort({ requestedAt: -1 });
    
    // Get attendance proofs (registrations with check-in)
    const registrations = await Registration.find({ 
      userId, 
      status: 'attended' 
    })
    .populate('eventId')
    .sort({ checkInAt: -1 });
    
    const attendanceProofs = registrations.map(reg => ({
      id: reg._id,
      eventId: reg.eventId._id,
      eventTitle: reg.eventId.title,
      eventDate: reg.eventId.date,
      checkInAt: reg.checkInAt,
      certificateIssued: reg.certificateIssued,
      certificateId: reg.certificateId,
      downloadUrl: reg.certificateIssued ? 
        `/api/student/certificates/${reg.certificateId}/download` : null
    }));
    
    res.json({ 
      success: true, 
      certificates,
      documentRequests,
      attendanceProofs 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch documents', 
      error: err.message 
    });
  }
};

// POST /api/student/documents/request - Request a document
exports.requestDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, eventId, purpose, urgency } = req.body;
    
    // Get student info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get event info if provided
    let eventTitle = '';
    if (eventId) {
      const event = await Event.findById(eventId);
      eventTitle = event ? event.title : '';
    }
    
    // Check if similar request already pending
    const existingRequest = await DocumentRequest.findOne({
      studentId: userId,
      documentType,
      eventId: eventId || null,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending request for this document' 
      });
    }
    
    // Create document request
    const documentRequest = await DocumentRequest.create({
      studentId: userId,
      studentName: user.name,
      studentEmail: user.email,
      documentType,
      eventId,
      eventTitle,
      purpose,
      urgency: urgency || 'normal',
      status: 'pending',
      requestedAt: new Date()
    });
    
    // TODO: Notify admin about new document request
    
    res.status(201).json({ success: true, documentRequest });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to request document', 
      error: err.message 
    });
  }
};

// POST /api/student/feedback - Submit feedback for an event
exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, rating, comment, anonymous } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Check if user attended the event
    const registration = await Registration.findOne({
      userId,
      eventId,
      status: 'attended'
    });
    
    if (!registration) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must have attended the event to submit feedback' 
      });
    }
    
    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ userId, eventId });
    if (existingFeedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted feedback for this event' 
      });
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      userId,
      eventId,
      rating,
      comment,
      anonymous: anonymous || false,
      submittedAt: new Date()
    });
    
    // Update event average rating
    const eventFeedbacks = await Feedback.find({ eventId });
    const averageRating = eventFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / eventFeedbacks.length;
    
    await Event.findByIdAndUpdate(eventId, {
      averageRating,
      feedbackCount: eventFeedbacks.length
    });
    
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feedback', 
      error: err.message 
    });
  }
};

// GET /api/student/feedback - Get student's submitted feedback
exports.getStudentFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const feedbacks = await Feedback.find({ userId })
      .populate('eventId', 'title date venue')
      .sort({ submittedAt: -1 });
    
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feedback', 
      error: err.message 
    });
  }
};

// GET /api/student/events/:eventId/qr-code - Get QR code for event check-in
exports.getStudentQRCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    // Check if user is registered for the event
    const registration = await Registration.findOne({ userId, eventId });
    if (!registration) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are not registered for this event' 
      });
    }
    
    // Generate QR code data
    const qrData = {
      eventId,
      registrationId: registration._id,
      studentId: userId,
      studentName: req.user.name,
      timestamp: Date.now()
    };
    
    const qrCodeString = JSON.stringify(qrData);
    
    // Generate QR code image
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeString);
      
      res.json({
        success: true,
        qrCode: qrCodeDataUrl,
        eventId,
        registrationId: registration._id,
        studentId: userId
      });
    } catch (qrErr) {
      // If QR code generation fails, return the data for manual scanning
      res.json({
        success: true,
        qrData: qrCodeString, // JSON data for manual processing
        eventId,
        registrationId: registration._id,
        studentId: userId,
        message: 'Scan this data with QR code scanner'
      });
    }
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate QR code', 
      error: err.message 
    });
  }
};

// POST /api/student/verify-qr - Verify QR code for check-in
exports.verifyQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR code data is required' 
      });
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid QR code data' 
      });
    }
    
    const { eventId, registrationId, studentId } = parsedData;
    
    // Verify the registration exists
    const registration = await Registration.findOne({
      _id: registrationId,
      eventId,
      userId: studentId
    });
    
    if (!registration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid registration' 
      });
    }
    
    // Check if already checked in
    if (registration.checkInAt) {
      return res.json({ 
        success: true, 
        alreadyCheckedIn: true,
        message: 'Already checked in',
        checkInTime: registration.checkInAt 
      });
    }
    
    // Perform check-in
    registration.checkInAt = new Date();
    registration.status = 'attended';
    await registration.save();
    
    res.json({
      success: true,
      message: 'Check-in successful',
      registration: {
        eventId,
        registrationId,
        studentId,
        checkInTime: registration.checkInAt
      }
    });
  } catch (err) {
    console.error('QR verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify QR code', 
      error: err.message 
    });
  }
};

// GET /api/student/stats - Get student statistics
exports.getStudentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const registrations = await Registration.find({ userId }).populate('eventId');
    
    // Calculate stats
    const totalRegistrations = registrations.length;
    const attendedEvents = registrations.filter(r => r.checkInAt).length;
    const upcomingEvents = registrations.filter(r => 
      r.eventId && new Date(r.eventId.date) > new Date()
    ).length;
    const certificatesEarned = registrations.filter(r => r.certificateIssued).length;
    
    // Calculate attendance rate
    const attendanceRate = totalRegistrations > 0 ? 
      Math.round((attendedEvents / totalRegistrations) * 100) : 0;
    
    // Category breakdown
    const categories = {};
    registrations.forEach(reg => {
      if (reg.eventId?.category) {
        const category = reg.eventId.category;
        categories[category] = (categories[category] || 0) + 1;
      }
    });
    
    const categoryStats = Object.keys(categories).map(category => ({
      category,
      count: categories[category]
    }));
    
    res.json({
      success: true,
      stats: {
        totalRegistrations,
        eventsAttended: attendedEvents,
        upcomingEvents,
        certificatesEarned,
        attendanceRate
      },
      categoryStats,
      recentActivity: registrations
        .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
        .slice(0, 5)
        .map(reg => ({
          eventTitle: reg.eventId?.title,
          date: reg.registeredAt,
          status: reg.checkInAt ? 'attended' : 'registered'
        }))
    });
  } catch (err) {
    console.error('Get student stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student statistics', 
      error: err.message 
    });
  }
};


// POST /api/student/feedback - Submit feedback for an event
exports.submitFeedback = async (req, res)