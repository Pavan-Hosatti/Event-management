const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

exports.getReports = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    // Event attendance report
    const events = await Event.find().sort({ date: -1 }).limit(10);
    const eventReports = await Promise.all(events.map(async (event) => {
      const registrations = await Registration.countDocuments({ eventId: event._id });
      const attended = await Registration.countDocuments({ 
        eventId: event._id, 
        status: 'attended' 
      });
      const certificates = await Certificate.countDocuments({ eventId: event._id });

      return {
        eventId: event._id,
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        registrations,
        attended,
        attendanceRate: registrations > 0 ? Math.round((attended / registrations) * 100) : 0,
        certificatesIssued: certificates
      };
    }));

    // User activity report
    const activeUsers = await Registration.aggregate([
      {
        $group: {
          _id: '$userId',
          eventCount: { $sum: 1 },
          attendedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'attended'] }, 1, 0] }
          }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 10 }
    ]);

    const userReports = await Promise.all(activeUsers.map(async (user) => {
      const userInfo = await User.findById(user._id).select('name email role');
      return {
        userId: user._id,
        name: userInfo?.name || 'Unknown',
        email: userInfo?.email || 'N/A',
        role: userInfo?.role || 'student',
        eventsRegistered: user.eventCount,
        eventsAttended: user.attendedCount,
        attendanceRate: user.eventCount > 0 ? Math.round((user.attendedCount / user.eventCount) * 100) : 0
      };
    }));

    // Certificate report
    const certificateReport = await Certificate.aggregate([
      {
        $group: {
          _id: '$eventId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const certificateReports = await Promise.all(certificateReport.map(async (cert) => {
      const event = await Event.findById(cert._id).select('title date');
      return {
        eventId: cert._id,
        eventTitle: event?.title || 'Unknown Event',
        certificatesIssued: cert.count
      };
    }));

    res.json({
      success: true,
      summary: {
        totalEvents,
        totalUsers,
        totalRegistrations,
        totalCertificates,
        overallAttendanceRate: totalRegistrations > 0 
          ? Math.round((await Registration.countDocuments({ status: 'attended' })) / totalRegistrations * 100)
          : 0
      },
      eventReports,
      userReports,
      certificateReports,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Report generation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate reports', 
      error: err.message 
    });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const { type } = req.query;
    
    if (type === 'events') {
      const events = await Event.find().sort({ date: -1 });
      
      let csv = 'Event ID,Title,Date,Capacity,Registrations,Attended,Attendance Rate,Certificates\n';
      events.forEach(event => {
        csv += `${event._id},"${event.title}",${event.date},${event.capacity},${event.registeredCount || 0},${event.attendedCount || 0},${event.registeredCount > 0 ? Math.round(((event.attendedCount || 0) / event.registeredCount) * 100) : 0},${event.certificateCount || 0}\n`;
      });
      
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename="events-report.csv"');
      return res.send(csv);
    }
    
    if (type === 'users') {
      const users = await User.find().select('name email role createdAt');
      
      let csv = 'User ID,Name,Email,Role,Created At\n';
      users.forEach(user => {
        csv += `${user._id},"${user.name}",${user.email},${user.role},${user.createdAt.toISOString()}\n`;
      });
      
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename="users-report.csv"');
      return res.send(csv);
    }
    
    res.status(400).json({ success: false, message: 'Invalid report type' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export report', error: err.message });
  }
};