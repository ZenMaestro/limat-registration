const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Add student
exports.addStudent = async (req, res) => {
  try {
    const { college_id, password, first_name, last_name, email, department } = req.body;

    if (!college_id || !password) {
      return res.status(400).json({ message: 'College ID and password required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO students (college_id, password, first_name, last_name, email, department, is_allowed)
      VALUES (?, ?, ?, ?, ?, ?, false)`,
      [college_id, hashedPassword, first_name, last_name, email, department || null]
    );

    // Get the inserted student info
    const [insertedStudent] = await db.query(
      'SELECT id, college_id, first_name, last_name, email, department, is_allowed, is_submitted FROM students WHERE id = ?',
      [result.insertId]
    );

    res.json({
      message: 'Student added successfully',
      student: insertedStudent[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') { // Unique constraint violation
      return res.status(400).json({ message: 'College ID already exists' });
    }
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT
        s.id, s.college_id, s.first_name, s.last_name, s.email, s.department,
        s.is_allowed, s.is_submitted,
        (SELECT COUNT(*) FROM registrations r WHERE r.student_id = s.id) as registered_courses
      FROM students s
      ORDER BY s.college_id`,
    );

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle student allowed status
exports.toggleStudentAllowed = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { is_allowed } = req.body;

    const [result] = await db.query(
      'UPDATE students SET is_allowed = ? WHERE id = ?',
      [is_allowed, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get updated student
    const [updatedStudent] = await db.query(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    res.json({
      message: 'Student status updated',
      student: updatedStudent[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add course
exports.addCourse = async (req, res) => {
  try {
    const { course_code, course_name, credits } = req.body;

    if (!course_code || !course_name) {
      return res.status(400).json({ message: 'Course code and name required' });
    }

    const [result] = await db.query(
      `INSERT INTO courses (course_code, course_name, credits)
      VALUES (?, ?, ?)`,
      [course_code, course_name, credits]
    );

    res.json({
      message: 'Course added successfully',
      course: { id: result.insertId, course_code, course_name, credits }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add lecturer
exports.addLecturer = async (req, res) => {
  try {
    const { lecturer_name, course_id, max_slots } = req.body;

    if (!lecturer_name || !course_id) {
      return res.status(400).json({ message: 'Lecturer name and course ID required' });
    }

    const [result] = await db.query(
      `INSERT INTO lecturers (lecturer_name, course_id, max_slots)
      VALUES (?, ?, ?)`,
      [lecturer_name, course_id, max_slots || 60]
    );

    res.json({
      message: 'Lecturer added successfully',
      lecturer: { id: result.insertId, lecturer_name, course_id, max_slots: max_slots || 60 }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all registrations
exports.getAllRegistrations = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT 
        r.id, s.college_id, s.first_name, s.last_name,
        c.course_code, c.course_name,
        l.lecturer_name,
        r.registration_date
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN courses c ON r.course_id = c.id
      JOIN lecturers l ON r.lecturer_id = l.id
      ORDER BY s.college_id, c.course_code`,
    );

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalStudentsResult] = await db.query('SELECT COUNT(*) as total FROM students');
    const [allowedStudentsResult] = await db.query('SELECT COUNT(*) as total FROM students WHERE is_allowed = true');
    const [submittedStudentsResult] = await db.query('SELECT COUNT(*) as total FROM students WHERE is_submitted = true');
    const [totalCoursesResult] = await db.query('SELECT COUNT(*) as total FROM courses');

    res.json({
      total_students: parseInt(totalStudentsResult[0].total),
      allowed_students: parseInt(allowedStudentsResult[0].total),
      submitted_students: parseInt(submittedStudentsResult[0].total),
      total_courses: parseInt(totalCoursesResult[0].total)
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM courses ORDER BY course_code');
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
