const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { college_id, password } = req.body;

    if (!college_id || !password) {
      return res.status(400).json({ message: 'College ID and password required' });
    }

    const [results] = await db.query(
      'SELECT id, college_id, password, first_name, is_allowed, is_submitted FROM students WHERE college_id = ?',
      [college_id]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const student = results[0];

    // Check if allowed
    if (!student.is_allowed) {
      return res.status(403).json({ message: 'You are not allowed to register. Contact admin.' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: student.id, college_id: student.college_id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      student: {
        id: student.id,
        college_id: student.college_id,
        first_name: student.first_name,
        is_submitted: student.is_submitted
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const [results] = await db.query(
      'SELECT id, email, password FROM admins WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = results[0];

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
