/**
 * Analytics Routes (Admin Only)
 */
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(authenticate);
router.use(authorize(['admin']));

// Get overall statistics
router.get('/stats', analyticsController.getStats);

// Course analytics
router.get('/courses', analyticsController.getCourseAnalytics);

// Lecturer analytics
router.get('/lecturers', analyticsController.getLecturerAnalytics);

// Student analytics
router.get('/students', analyticsController.getStudentAnalytics);

// Get specific student details
router.get('/students/:id', analyticsController.getStudentDetail);

// Search students with filters
router.get('/students/search', analyticsController.searchStudents);

// Export to Excel
router.get('/export/excel', analyticsController.exportExcel);

// Export to PDF
router.get('/export/pdf', analyticsController.exportPDF);

module.exports = router;
