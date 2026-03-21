/**
 * Notifications Controller
 * Handles in-app notification endpoints
 */
const notificationService = require('../services/notificationService');

/**
 * GET /api/notifications
 * Get all notifications for current user
 */
async function getNotifications(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userType = req.user.type; // 'student' or 'admin'
    const userId = req.user.id;

    const result = await notificationService.getAllNotifications(userType, userId, page, limit);
    
    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/notifications/unread
 * Get unread notifications count
 */
async function getUnreadCount(req, res) {
  try {
    const userType = req.user.type;
    const userId = req.user.id;

    const count = await notificationService.getNotificationCount(userType, userId);
    
    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    await notificationService.markAsRead(id);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
async function markAllAsRead(req, res) {
  try {
    const userType = req.user.type;
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userType, userId);
    
    res.status(200).json({
      success: true,
      message: `${result.updatedCount} notifications marked as read`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    await notificationService.deleteNotification(id);
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/admin/notifications/broadcast
 * Broadcast notification to all students (admin only)
 */
async function broadcastNotification(req, res) {
  try {
    const { title, message, type = 'info' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const result = await notificationService.broadcastToAllStudents(title, message, type);
    
    res.status(201).json({
      success: true,
      message: `Broadcast to ${result.recipientCount} students`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification
};
