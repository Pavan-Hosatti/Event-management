const express = require('express');
const router = express.Router();
const { 
  getSettings, 
  updateProfile, 
  updatePassword, 
  updateNotificationSettings, 
  updatePrivacySettings 
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSettings);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.put('/notifications', updateNotificationSettings);
router.put('/privacy', updatePrivacySettings);

module.exports = router;