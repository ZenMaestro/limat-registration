/**
 * In-App Notification Service
 * Manages in-app notifications for students and admins
 */
const db = require('../database');

/**
 * Create a notification
 */
async function createNotification(userType, userId, title, message, type = 'info', relatedCourseId = null, expiresAt = null) {
  try {
    const query = `
      INSERT INTO notifications (user_type, user_id, title, message, type, related_course_id, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(query, [userType, userId, title, message, type, relatedCourseId, expiresAt]);
    return { success: true, notificationId: result.insertId };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Get unread notifications for a user
 */
async function getUnreadNotifications(userType, userId) {
  try {
    const query = `
      SELECT * FROM notifications
      WHERE user_type = ? AND user_id = ? AND is_read = FALSE
      ORDER BY created_at DESC
      LIMIT 20
    `;
    const notifications = await db.query(query, [userType, userId]);
    return notifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
}

/**
 * Get all notifications for a user (paginated)
 */
async function getAllNotifications(userType, userId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM notifications
      WHERE user_type = ? AND user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const notifications = await db.query(query, [userType, userId, limit, offset]);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM notifications
      WHERE user_type = ? AND user_id = ?
    `;
    const [{ total }] = await db.query(countQuery, [userType, userId]);
    
    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.query(query, [notificationId]);
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userType, userId) {
  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_type = ? AND user_id = ? AND is_read = FALSE
    `;
    const result = await db.query(query, [userType, userId]);
    return { success: true, updatedCount: result.affectedRows };
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
async function deleteNotification(notificationId) {
  try {
    const query = `DELETE FROM notifications WHERE id = ?`;
    await db.query(query, [notificationId]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete expired notifications (automatic cleanup)
 */
async function deleteExpiredNotifications() {
  try {
    const query = `
      DELETE FROM notifications
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
    `;
    const result = await db.query(query);
    console.log(`✅ Cleaned up ${result.affectedRows} expired notifications`);
    return { success: true, deletedCount: result.affectedRows };
  } catch (error) {
    console.error('Error cleaning expired notifications:', error);
    throw error;
  }
}

/**
 * Get notification count for user
 */
async function getNotificationCount(userType, userId) {
  try {
    const query = `
      SELECT COUNT(*) as unread_count FROM notifications
      WHERE user_type = ? AND user_id = ? AND is_read = FALSE
    `;
    const [{ unread_count }] = await db.query(query, [userType, userId]);
    return unread_count;
  } catch (error) {
    console.error('Error getting notification count:', error);
    throw error;
  }
}

/**
 * Broadcast notification to all students
 */
async function broadcastToAllStudents(title, message, type = 'info') {
  try {
    // Get all student IDs
    const studentQuery = `SELECT id FROM students`;
    const students = await db.query(studentQuery);
    
    // Create notification for each student
    const values = students.map(student => [
      'student',
      student.id,
      title,
      message,
      type,
      null,
      null
    ]);

    const query = `
      INSERT INTO notifications (user_type, user_id, title, message, type, related_course_id, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const value of values) {
      await db.query(query, value);
    }

    console.log(`✅ Broadcast notification to ${students.length} students`);
    return { success: true, recipientCount: students.length };
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    throw error;
  }
}

/**
 * Create registration success notification
 */
async function notifyRegistrationSuccess(studentId, studentName, courseCount) {
  try {
    const title = '✅ Registration Completed';
    const message = `Your course registration has been successfully submitted! You have registered for ${courseCount} course(s).`;
    
    return await createNotification('student', studentId, title, message, 'success');
  } catch (error) {
    console.error('Error creating registration notification:', error);
    throw error;
  }
}

/**
 * Create course availability notification
 */
async function notifySlotAvailable(studentId, courseName) {
  try {
    const title = '📚 Slot Available';
    const message = `A slot has opened up for ${courseName}. Rush to complete your registration!`;
    
    return await createNotification('student', studentId, title, message, 'warning');
  } catch (error) {
    console.error('Error creating availability notification:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  getUnreadNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteExpiredNotifications,
  getNotificationCount,
  broadcastToAllStudents,
  notifyRegistrationSuccess,
  notifySlotAvailable
};
