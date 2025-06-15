const Notification = require('../models/notification.model');

// Admin: Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, targetAudience, expiresAt } = req.body;
    
    const notification = new Notification({
      title,
      message,
      type,
      targetAudience,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Find notifications that haven't expired and are targeted to this user role or 'all'
    const notifications = await Notification.find({
      expiresAt: { $gt: new Date() },
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole === 'student' ? 'students' : 'teachers' }
      ]
    }).sort({ createdAt: -1 });
    
    // Mark read status for each notification
    const processedNotifications = notifications.map(notification => {
      const notificationObj = notification.toObject();
      notificationObj.isRead = notification.isRead.get(userId.toString()) || false;
      return notificationObj;
    });
    
    res.status(200).json({
      success: true,
      notifications: processedNotifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Update the isRead map with this user
    notification.isRead.set(userId.toString(), true);
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification status',
      error: error.message
    });
  }
};

// Admin: Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Admin: Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};
