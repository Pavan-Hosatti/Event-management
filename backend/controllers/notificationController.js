// controllers/notificationController.js
const Notification = require('../models/Notification');

// Get student notifications
exports.getStudentNotifications = async (req, res) => {
  try {
    // ✅ ROBUST USER ID EXTRACTION
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    console.log('📧 Fetching notifications for user:', userId);
    
    const { unreadOnly = 'false' } = req.query;
    
    let query = { userId: userId.toString() };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`✅ Found ${notifications.length} notifications`);
    
    // Count unread
    const unreadCount = await Notification.countDocuments({
      userId: userId.toString(),
      read: false
    });
    
    // Format notifications for frontend
    const formattedNotifications = notifications.map(notif => ({
      id: notif._id.toString(),
      _id: notif._id.toString(),
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: notif.read,
      readAt: notif.readAt,
      createdAt: notif.createdAt,
      metadata: notif.metadata || {}
    }));
    
    res.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount: unreadCount,
      total: notifications.length
    });
    
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    console.log('📖 Marking notification as read:', id, 'for user:', userId);
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: userId.toString() },
      { read: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      userId: userId.toString(),
      read: false
    });
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: {
        id: notification._id.toString(),
        read: notification.read,
        readAt: notification.readAt
      },
      unreadCount
    });
    
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    await Notification.updateMany(
      { userId: userId.toString(), read: false },
      { read: true, readAt: new Date() }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0
    });
    
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const result = await Notification.deleteMany({ 
      userId: userId.toString() 
    });
    
    console.log(`🗑️ Deleted ${result.deletedCount} notifications for user ${userId}`);
    
    res.json({
      success: true,
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('❌ Clear notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications',
      error: error.message
    });
  }
};

// Delete single notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: userId.toString()
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      userId: userId.toString(),
      read: false
    });
    
    res.json({
      success: true,
      message: 'Notification deleted',
      unreadCount
    });
    
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};