/**
 * Announcements Controller
 * Handles admin announcements and broadcasts
 */
const db = require('../database');
const notificationService = require('../services/notificationService');

/**
 * GET /api/announcements
 * Get all active announcements
 */
async function getAnnouncements(req, res) {
  try {
    const query = `
      SELECT * FROM announcements
      WHERE is_active = TRUE
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    const announcements = await db.query(query);
    
    res.status(200).json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/admin/announcements
 * Create a new announcement (admin only)
 */
async function createAnnouncement(req, res) {
  try {
    const adminId = req.user.id;
    const { title, content, type = 'general', target_audience = 'all_students', expiresAt = null } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const query = `
      INSERT INTO announcements (admin_id, title, content, announcement_type, target_audience, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(query, [adminId, title, content, type, target_audience, expiresAt]);

    // Also create in-app notifications for students
    if (target_audience === 'all_students') {
      await notificationService.broadcastToAllStudents(title, content, 'info');
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcementId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/admin/announcements/:id
 * Update an announcement (admin only)
 */
async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const { title, content, type, target_audience, expiresAt, is_active } = req.body;

    let query = 'UPDATE announcements SET ';
    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (content) {
      updates.push('content = ?');
      values.push(content);
    }
    if (type) {
      updates.push('announcement_type = ?');
      values.push(type);
    }
    if (target_audience) {
      updates.push('target_audience = ?');
      values.push(target_audience);
    }
    if (expiresAt !== undefined) {
      updates.push('expires_at = ?');
      values.push(expiresAt);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);

    await db.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/admin/announcements/:id
 * Delete an announcement (admin only)
 */
async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM announcements WHERE id = ?';
    await db.query(query, [id]);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/admin/announcements/:id/view-count
 * Increment view count for announcement
 */
async function incrementViewCount(req, res) {
  try {
    const { id } = req.params;

    const query = 'UPDATE announcements SET view_count = view_count + 1 WHERE id = ?';
    await db.query(query, [id]);

    res.status(200).json({
      success: true,
      message: 'View count updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  incrementViewCount
};
