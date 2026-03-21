/**
 * Analytics Controller
 * Handles reporting and analytics endpoints (admin only)
 */
const analyticsService = require('../services/analyticsService');

/**
 * GET /api/admin/analytics/stats
 * Get overall registration statistics
 */
async function getStats(req, res) {
  try {
    const stats = await analyticsService.getRegistrationStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/admin/analytics/courses
 * Get course fill rate analysis
 */
async function getCourseAnalytics(req, res) {
  try {
    const data = await analyticsService.getCourseAnalytics();
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/admin/analytics/lecturers
 * Get lecturer-wise registration data
 */
async function getLecturerAnalytics(req, res) {
  try {
    const data = await analyticsService.getLecturerAnalytics();
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/admin/analytics/students
 * Get student registration summary
 */
async function getStudentAnalytics(req, res) {
  try {
    const data = await analyticsService.getStudentRegistrations();
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/admin/analytics/students/:id
 * Get detailed registration for a specific student
 */
async function getStudentDetail(req, res) {
  try {
    const { id } = req.params;
    const data = await analyticsService.getStudentDetailedRegistrations(id);
    
    if (data.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/admin/analytics/students/search
 * Search students with filters
 */
async function searchStudents(req, res) {
  try {
    const filters = {
      collegeId: req.query.collegeId,
      name: req.query.name,
      email: req.query.email,
      isAllowed: req.query.isAllowed ? req.query.isAllowed === 'true' : undefined,
      isSubmitted: req.query.isSubmitted ? req.query.isSubmitted === 'true' : undefined
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const data = await analyticsService.searchStudents(filters);
    
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/admin/analytics/export/excel
 * Export analytics to Excel
 */
async function exportExcel(req, res) {
  try {
    const result = await analyticsService.exportToExcel();
    
    res.download(result.filepath, result.filename, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/admin/analytics/export/pdf
 * Export analytics to PDF
 */
async function exportPDF(req, res) {
  try {
    const result = await analyticsService.exportToPDF();
    
    res.download(result.filepath, result.filename, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getStats,
  getCourseAnalytics,
  getLecturerAnalytics,
  getStudentAnalytics,
  getStudentDetail,
  searchStudents,
  exportExcel,
  exportPDF
};
