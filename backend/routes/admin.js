const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  addStudent,
  getAllStudents,
  toggleStudentAllowed,
  addCourse,
  addLecturer,
  getAllRegistrations,
  getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

// Student management
router.post('/add-student', authMiddleware, adminMiddleware, addStudent);
router.get('/students', authMiddleware, adminMiddleware, getAllStudents);
router.put('/student/:studentId/allow', authMiddleware, adminMiddleware, toggleStudentAllowed);

// Course management
router.post('/add-course', authMiddleware, adminMiddleware, addCourse);

// Lecturer management
router.post('/add-lecturer', authMiddleware, adminMiddleware, addLecturer);

// Registration management
router.get('/registrations', authMiddleware, adminMiddleware, getAllRegistrations);

// Dashboard
router.get('/dashboard-stats', authMiddleware, adminMiddleware, getDashboardStats);

module.exports = router;
