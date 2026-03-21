/**
 * Audit Logging Middleware
 * Logs all user actions and changes for compliance and debugging
 */
const db = require('../database');

/**
 * Audit logging middleware
 * Usage: app.use(auditMiddleware);
 */
function auditMiddleware(req, res, next) {
  // Store original send method
  const originalSend = res.send;

  // Override send to capture response
  res.send = function (data) {
    // Only log API requests (not static files)
    if (req.path.startsWith('/api/')) {
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 300;
      
      // Extract user info from token/session
      const userId = req.user?.id || null;
      const userType = req.user?.type || null;

      // Log the action
      logAction(
        userType,
        userId,
        req.method,
        req.path,
        req.body || {},
        statusCode,
        isSuccess
      ).catch(err => console.error('Audit log error:', err));
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Log an action to the audit log
 */
async function logAction(userType, userId, method, endpoint, changes = {}, statusCode = 200, isSuccess = true) {
  try {
    // Determine entity type from endpoint
    let entityType = 'unknown';
    let entityId = null;

    if (endpoint.includes('/student')) entityType = 'student';
    else if (endpoint.includes('/course')) entityType = 'course';
    else if (endpoint.includes('/lecturer')) entityType = 'lecturer';
    else if (endpoint.includes('/registration')) entityType = 'registration';
    else if (endpoint.includes('/admin')) entityType = 'admin';

    const action = `${method} ${endpoint}`;
    const status = isSuccess ? 'success' : 'failure';
    const userAgent = require('express').request.get('user-agent') || 'Unknown';

    const query = `
      INSERT INTO audit_logs (user_type, user_id, action, entity_type, entity_id, changes, user_agent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      userType,
      userId,
      action,
      entityType,
      entityId,
      JSON.stringify(changes),
      userAgent,
      status
    ]);
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

/**
 * Get audit log for a user
 */
async function getUserAuditLog(userId, userType, limit = 50) {
  try {
    const query = `
      SELECT * FROM audit_logs
      WHERE user_id = ? AND user_type = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return await db.query(query, [userId, userType, limit]);
  } catch (error) {
    console.error('Error fetching user audit log:', error);
    throw error;
  }
}

/**
 * Get system-wide audit log
 */
async function getSystemAuditLog(limit = 100) {
  try {
    const query = `
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return await db.query(query, [limit]);
  } catch (error) {
    console.error('Error fetching system audit log:', error);
    throw error;
  }
}

/**
 * Get failed action logs
 */
async function getFailedActionLogs(limit = 50) {
  try {
    const query = `
      SELECT * FROM audit_logs
      WHERE status = 'failure'
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return await db.query(query, [limit]);
  } catch (error) {
    console.error('Error fetching failed action logs:', error);
    throw error;
  }
}

/**
 * Get actions for specific entity
 */
async function getEntityAuditLog(entityType, entityId) {
  try {
    const query = `
      SELECT * FROM audit_logs
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC
    `;
    return await db.query(query, [entityType, entityId]);
  } catch (error) {
    console.error('Error fetching entity audit log:', error);
    throw error;
  }
}

/**
 * Clean old audit logs (keep last 90 days)
 */
async function cleanOldAuditLogs(daysToKeep = 90) {
  try {
    const query = `
      DELETE FROM audit_logs
      WHERE created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)
    `;
    const result = await db.query(query, [daysToKeep]);
    console.log(`✅ Cleaned up ${result.affectedRows} old audit logs`);
    return { success: true, deletedCount: result.affectedRows };
  } catch (error) {
    console.error('Error cleaning old audit logs:', error);
    throw error;
  }
}

module.exports = {
  auditMiddleware,
  logAction,
  getUserAuditLog,
  getSystemAuditLog,
  getFailedActionLogs,
  getEntityAuditLog,
  cleanOldAuditLogs
};
