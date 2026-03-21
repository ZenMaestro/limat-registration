/**
 * Notification Routes
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticate, notificationController.getNotifications);

// Get unread notification count
router.get('/unread', authenticate, notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.put('/read-all', authenticate, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Admin: Broadcast to all students
router.post('/admin/broadcast', authenticate, authorize(['admin']), notificationController.broadcastNotification);

module.exports = router;
