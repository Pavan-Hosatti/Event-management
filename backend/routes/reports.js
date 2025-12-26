const express = require('express');
const router = express.Router();
const { getReports, exportReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('organizer', 'admin'));

router.get('/', getReports);
router.get('/export', exportReport);

module.exports = router;