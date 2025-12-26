const express = require('express');
const router = express.Router();
const aiGraderController = require('../controllers/aiGraderController');

// Simple health/status route for AI grader service
router.get('/status', aiGraderController.getStatus);

// Endpoint to accept a file for grading (mock)
router.post('/grade', aiGraderController.gradeCrop);

module.exports = router;
