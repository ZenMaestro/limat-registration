const db = require('../config/database');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM courses ORDER BY course_code');
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get lecturers for a course with slot count
exports.getLecturers = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [results] = await db.query(
      `SELECT 
        l.id, l.lecturer_name, l.course_id, l.max_slots,
        COUNT(r.id) as enrolled_students
      FROM lecturers l
      LEFT JOIN registrations r ON l.id = r.lecturer_id
      WHERE l.course_id = ?
      GROUP BY l.id, l.lecturer_name, l.course_id, l.max_slots
      ORDER BY l.lecturer_name`,
      [courseId]
    );

    const lecturers = results.map(lecturer => ({
      ...lecturer,
      available_slots: lecturer.max_slots - parseInt(lecturer.enrolled_students),
      is_full: parseInt(lecturer.enrolled_students) >= lecturer.max_slots
    }));

    res.json(lecturers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single course with lecturers
exports.getCourseWithLecturers = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [courseResult] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courseResult.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [lecturersResult] = await db.query(
      `SELECT 
        l.id, l.lecturer_name, l.course_id, l.max_slots,
        COUNT(r.id) as enrolled_students
      FROM lecturers l
      LEFT JOIN registrations r ON l.id = r.lecturer_id
      WHERE l.course_id = ?
      GROUP BY l.id, l.lecturer_name, l.course_id, l.max_slots
      ORDER BY l.lecturer_name`,
      [courseId]
    );

    const lecturers = lecturersResult.map(lecturer => ({
      ...lecturer,
      available_slots: lecturer.max_slots - parseInt(lecturer.enrolled_students),
      is_full: parseInt(lecturer.enrolled_students) >= lecturer.max_slots
    }));

    res.json({
      course: courseResult[0],
      lecturers
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
