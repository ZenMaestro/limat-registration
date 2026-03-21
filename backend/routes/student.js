const express = require('express');
const { authMiddleware, studentMiddleware } = require('../middleware/auth');
const {
  getDashboard,
  getStudentDetails,
  getRegistrationStatus,
  registerCourse,
  getRegisteredCourses,
  submitRegistration
} = require('../controllers/studentController');

const router = express.Router();

router.get('/dashboard', authMiddleware, studentMiddleware, getDashboard);
router.get('/details', authMiddleware, studentMiddleware, getStudentDetails);
router.get('/registration-status', authMiddleware, studentMiddleware, getRegistrationStatus);
router.post('/register-course', authMiddleware, studentMiddleware, registerCourse);
router.get('/registered-courses', authMiddleware, studentMiddleware, getRegisteredCourses);
router.post('/submit-registration', authMiddleware, studentMiddleware, submitRegistration);

module.exports = router;
