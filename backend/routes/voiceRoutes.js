// routes/voiceRoutes.js - For Web Speech API with Auth
const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const { protect } = require('../middleware/auth'); // Your auth middleware

// Text query route - protected (requires login)
router.post('/query', protect, voiceController.processTextQuery);

// Conversation management
router.get('/conversation/:sessionId', protect, voiceController.getConversationHistory);
router.delete('/conversation/:sessionId', protect, voiceController.clearConversation);

module.exports = router;