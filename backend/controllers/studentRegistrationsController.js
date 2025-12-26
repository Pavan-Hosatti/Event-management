// controllers/studentRegistrationsController.js
exports.getStudentRegistrations = async (req, res) => {
  try {
    console.log('Student registrations requested for user:', req.user?.id);
    
    // Mock data for testing
    const registrations = [
      {
        _id: 'reg1',
        eventId: 'event1',
        eventTitle: 'Tech Talk: AI in Healthcare',
        eventDate: '2025-03-15',
        status: 'registered',
        registeredAt: '2025-03-10T10:00:00Z',
        checkInAt: null,
        certificateIssued: false
      },
      {
        _id: 'reg2',
        eventId: 'event2',
        eventTitle: 'Hackathon 2025',
        eventDate: '2025-03-20',
        status: 'attended',
        registeredAt: '2025-03-05T14:30:00Z',
        checkInAt: '2025-03-20T09:15:00Z',
        certificateIssued: true
      }
    ];
    
    res.json({
      success: true,
      registrations: registrations
    });
  } catch (error) {
    console.error('Error in getStudentRegistrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
};