const express = require('express');
const router = express.Router();
const { 
  getDocumentRequests, 
  requestDocument, 
  getPendingRequests, 
  processRequest, 
  downloadDocument 
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

// Student routes
router.get('/my-requests', protect, getDocumentRequests);
router.post('/request', protect, requestDocument);
router.get('/download/:id', protect, downloadDocument);

// Admin routes
router.get('/pending', protect, authorize('organizer', 'admin'), getPendingRequests);
router.patch('/:id/process', protect, authorize('organizer', 'admin'), processRequest);

module.exports = router;