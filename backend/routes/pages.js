const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Admin pages - render basic HTML or handle redirects
router.get('/admin/events', protect, authorize('organizer', 'admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Events management page',
        data: {
            totalEvents: 24,
            upcomingEvents: 6,
            pastEvents: 18
        }
    });
});

router.get('/admin/qr-codes', protect, authorize('organizer', 'admin'), (req, res) => {
    res.json({
        success: true,
        message: 'QR Codes management page',
        data: {
            generatedQRs: 42,
            pendingQRs: 8
        }
    });
});

router.get('/admin/reports', protect, authorize('organizer', 'admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Reports page',
        data: {
            availableReports: ['Attendance', 'Registrations', 'Certificates', 'Financial']
        }
    });
});

router.get('/admin/attendance', protect, authorize('organizer', 'admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Attendance management page',
        data: {
            totalStudents: 1240,
            todayAttendance: 312
        }
    });
});

module.exports = router;