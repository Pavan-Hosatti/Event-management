const DocumentRequest = require('../models/DocumentRequest');
const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

// Student: Get all document requests
exports.getDocumentRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ studentId: req.user.id })
      .sort({ requestedAt: -1 })
      .populate('eventId', 'title date');
    
    res.json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch document requests', error: err.message });
  }
};

// Student: Request a new document
exports.requestDocument = async (req, res) => {
  try {
    const { documentType, eventId, purpose, urgency } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if document already exists
    if (documentType === 'certificate' && eventId) {
      const existingCert = await Certificate.findOne({ 
        userId: req.user.id, 
        eventId 
      });
      
      if (existingCert) {
        return res.status(400).json({
          success: false,
          message: 'Certificate already exists for this event',
          certificate: existingCert
        });
      }
      
      // Check if user attended the event
      const registration = await Registration.findOne({
        userId: req.user.id,
        eventId,
        status: 'attended'
      });
      
      if (!registration) {
        return res.status(400).json({
          success: false,
          message: 'You must have attended the event to request a certificate'
        });
      }
    }
    
    const event = eventId ? await Event.findById(eventId) : null;
    
    const documentRequest = await DocumentRequest.create({
      studentId: req.user.id,
      studentName: user.name,
      studentEmail: user.email,
      documentType,
      eventId,
      eventTitle: event?.title,
      purpose,
      urgency: urgency || 'normal',
      status: 'pending',
      requestedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Document request submitted successfully',
      request: documentRequest
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to request document', error: err.message });
  }
};

// Admin: Get pending document requests
exports.getPendingRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const requests = await DocumentRequest.find(query)
      .sort({ urgency: -1, requestedAt: -1 })
      .populate('eventId', 'title date')
      .limit(50);
    
    res.json({
      success: true,
      requests,
      counts: {
        pending: await DocumentRequest.countDocuments({ status: 'pending' }),
        processing: await DocumentRequest.countDocuments({ status: 'processing' }),
        completed: await DocumentRequest.countDocuments({ status: 'completed' }),
        rejected: await DocumentRequest.countDocuments({ status: 'rejected' })
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending requests', error: err.message });
  }
};

// Admin: Process document request
exports.processRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, fileUrl } = req.body;
    
    const request = await DocumentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Document request not found' });
    }
    
    request.status = status;
    request.processedBy = req.user.id;
    request.adminNotes = adminNotes;
    
    if (status === 'completed') {
      if (!fileUrl) {
        return res.status(400).json({ success: false, message: 'File URL is required for completed requests' });
      }
      request.fileUrl = fileUrl;
      request.completedAt = new Date();
      
      // If it's a certificate request, create the certificate
      if (request.documentType === 'certificate' && request.eventId) {
        const certificate = await Certificate.create({
          certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          registrationId: request.studentId + '-' + request.eventId,
          eventId: request.eventId,
          userId: request.studentId,
          studentName: request.studentName,
          eventTitle: request.eventTitle,
          eventDate: request.eventDate,
          certificateUrl: fileUrl,
          issuedAt: new Date(),
          issuedBy: req.user.id
        });
        
        // Update registration if exists
        await Registration.findOneAndUpdate(
          { userId: request.studentId, eventId: request.eventId },
          { certificateIssued: true, certificateId: certificate.certificateId }
        );
      }
    } else if (status === 'rejected') {
      request.rejectedAt = new Date();
    }
    
    await request.save();
    
    res.json({
      success: true,
      message: `Document request ${status}`,
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to process request', error: err.message });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    
    const request = await DocumentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Document request not found' });
    }
    
    // Check permissions
    if (userRole === 'student' && request.studentId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this document' });
    }
    
    if (!request.fileUrl) {
      return res.status(404).json({ success: false, message: 'Document file not available' });
    }
    
    // For now, return the file URL
    // In production, you would serve the file from storage
    res.json({
      success: true,
      documentUrl: request.fileUrl,
      documentName: `${request.documentType}_${request.eventTitle || 'document'}.pdf`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to download document', error: err.message });
  }
};