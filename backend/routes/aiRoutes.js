const express = require('express');
const router = express.Router();
const { getEventSuggestions } = require('../controllers/aiController');

router.post('/event-suggestions', getEventSuggestions);

module.exports = router;
