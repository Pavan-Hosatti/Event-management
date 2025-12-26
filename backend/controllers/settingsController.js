const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      settings: {
        profile: {
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          department: user.department,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio
        },
        notifications: {
          emailNotifications: user.emailNotifications !== false,
          eventReminders: user.eventReminders !== false,
          certificateAlerts: user.certificateAlerts !== false,
          feedbackRequests: user.feedbackRequests !== false
        },
        privacy: {
          showProfile: user.showProfile !== false,
          showEmail: user.showEmail === true,
          showActivity: user.showActivity !== false
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'department', 'phone', 'avatar', 'bio', 'year'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update password', error: err.message });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, eventReminders, certificateAlerts, feedbackRequests } = req.body;
    
    const updates = {};
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (eventReminders !== undefined) updates.eventReminders = eventReminders;
    if (certificateAlerts !== undefined) updates.certificateAlerts = certificateAlerts;
    if (feedbackRequests !== undefined) updates.feedbackRequests = feedbackRequests;
    
    await User.findByIdAndUpdate(req.user.id, { $set: updates });
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
};

exports.updatePrivacySettings = async (req, res) => {
  try {
    const { showProfile, showEmail, showActivity } = req.body;
    
    const updates = {};
    if (showProfile !== undefined) updates.showProfile = showProfile;
    if (showEmail !== undefined) updates.showEmail = showEmail;
    if (showActivity !== undefined) updates.showActivity = showActivity;
    
    await User.findByIdAndUpdate(req.user.id, { $set: updates });
    
    res.json({
      success: true,
      message: 'Privacy settings updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update privacy settings', error: err.message });
  }
};