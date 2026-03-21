const express = require('express');
const { getAllCourses, getLecturers, getCourseWithLecturers } = require('../controllers/courseController');

const router = express.Router();

router.get('/all', getAllCourses);
router.get('/:courseId/lecturers', getLecturers);
router.get('/:courseId', getCourseWithLecturers);

module.exports = router;
