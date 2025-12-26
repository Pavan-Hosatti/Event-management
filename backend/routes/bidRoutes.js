// routes/bidRoutes.js
// ============================================
const express = require('express');
const router = express.Router(); // <--- Define router first
const bidController = require('../controllers/bidController'); 

router.post('/place', bidController.placeBid);
router.get('/crop/:cropId', bidController.getBidsForCrop);
router.post('/win/:bidId', bidController.markBidAsWon);

module.exports = router;
