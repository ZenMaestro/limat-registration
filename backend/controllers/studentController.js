const db = require('../config/database');

// Get student dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all courses
    const [coursesResult] = await db.query('SELECT * FROM courses ORDER BY course_code');

    // Get selected lecturers for this student
    const [registrationsResult] = await db.query(
      'SELECT course_id, lecturer_id FROM registrations WHERE student_id = ?',
      [studentId]
    );

    const registrations = {};
    registrationsResult.forEach(reg => {
      registrations[reg.course_id] = reg.lecturer_id;
    });

    const coursesWithStatus = await Promise.all(
      coursesResult.map(async (course) => {
        const [lecturersResult] = await db.query(
          `SELECT 
            l.id, l.lecturer_name, l.max_slots,
            COUNT(r.id) as enrolled_students
          FROM lecturers l
          LEFT JOIN registrations r ON l.id = r.lecturer_id
          WHERE l.course_id = ?
          GROUP BY l.id, l.lecturer_name, l.max_slots`,
          [course.id]
        );

        return {
          ...course,
          selected: registrations[course.id] || null,
          total_lecturers: lecturersResult.length
        };
      })
    );

    const completed = Object.keys(registrations).length;
    const total = coursesResult.length;

    res.json({
      courses: coursesWithStatus,
      progress: { completed, total }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student details
exports.getStudentDetails = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [result] = await db.query(
      `SELECT 
        id,
        college_id,
        first_name,
        last_name,
        email,
        is_allowed,
        is_submitted,
        created_at
      FROM students
      WHERE id = ?`,
      [studentId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student registration status
exports.getRegistrationStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [result] = await db.query(
      `SELECT 
        s.is_submitted,
        s.is_allowed,
        COUNT(r.id) as registered_courses
      FROM students s
      LEFT JOIN registrations r ON s.id = r.student_id
      WHERE s.id = ?
      GROUP BY s.id, s.is_submitted, s.is_allowed`,
      [studentId]
    );

    res.json(result[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register for a course with lecturer
exports.registerCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, lecturerId } = req.body;

    if (!courseId || !lecturerId) {
      return res.status(400).json({ message: 'Course ID and Lecturer ID required' });
    }

    // Check if student is submitted
    const [studentResult] = await db.query(
      'SELECT is_submitted FROM students WHERE id = ?',
      [studentId]
    );

    if (studentResult[0]?.is_submitted) {
      return res.status(403).json({ message: 'Registration already submitted. Cannot modify.' });
    }

    // Check if lecturer is full
    const [lecturerResult] = await db.query(
      `SELECT l.max_slots, COUNT(r.id) as enrolled
      FROM lecturers l
      LEFT JOIN registrations r ON l.id = r.lecturer_id
      WHERE l.id = ?
      GROUP BY l.id, l.max_slots`,
      [lecturerId]
    );

    const lecturer = lecturerResult[0];
    if (parseInt(lecturer.enrolled) >= lecturer.max_slots) {
      return res.status(400).json({ message: 'No slots available for this lecturer' });
    }

    // Insert or update registration
    const [result] = await db.query(
      `INSERT INTO registrations (student_id, course_id, lecturer_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE lecturer_id = VALUES(lecturer_id)`,
      [studentId, courseId, lecturerId]
    );

    res.json({
      message: 'Registration successful',
      registration: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get registered courses
exports.getRegisteredCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [result] = await db.query(
      `SELECT 
        c.id, c.course_code, c.course_name,
        l.id as lecturer_id, l.lecturer_name,
        r.registration_date
      FROM registrations r
      JOIN courses c ON r.course_id = c.id
      JOIN lecturers l ON r.lecturer_id = l.id
      WHERE r.student_id = ?
      ORDER BY c.course_code`,
      [studentId]
    );

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit final registration
exports.submitRegistration = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Check if already submitted
    const [checkResult] = await db.query(
      'SELECT is_submitted FROM students WHERE id = ?',
      [studentId]
    );

    if (checkResult[0]?.is_submitted) {
      return res.status(400).json({ message: 'Registration already submitted' });
    }

    // Get number of courses
    const [coursesResult] = await db.query('SELECT COUNT(*) as total FROM courses');
    const totalCourses = parseInt(coursesResult[0].total);

    // Check if student registered for all courses
    const [registeredResult] = await db.query(
      'SELECT COUNT(*) as total FROM registrations WHERE student_id = ?',
      [studentId]
    );
    const registeredCourses = parseInt(registeredResult[0].total);

    if (registeredCourses < totalCourses) {
      return res.status(400).json({
        message: `Please register for all ${totalCourses} courses before submitting`,
        registered: registeredCourses,
        total: totalCourses
      });
    }

    // Mark as submitted
    const [result] = await db.query(
      'UPDATE students SET is_submitted = true WHERE id = ? LIMIT 1',
      [studentId]
    );

    // Get updated student info
    const [updatedStudent] = await db.query(
      'SELECT id, college_id, first_name, is_submitted FROM students WHERE id = ?',
      [studentId]
    );

    res.json({
      message: 'Registration submitted successfully',
      student: updatedStudent[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
