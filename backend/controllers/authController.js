const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Input validation helper
function validateInput(input, type) {
  if (!input) return false;
  input = String(input).trim();
  
  if (type === 'collegeId') {
    return /^[A-Za-z0-9]{3,30}$/.test(input);
  } else if (type === 'email') {
    return validator.isEmail(input);
  } else if (type === 'password') {
    return input.length >= 6 && input.length <= 128;
  }
  return true;
}

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { college_id, password } = req.body;

    // Input validation
    if (!college_id || !password) {
      return res.status(400).json({ message: 'College ID and password required' });
    }

    if (!validateInput(college_id, 'collegeId')) {
      return res.status(400).json({ message: 'Invalid college ID format' });
    }

    if (!validateInput(password, 'password')) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Query database with prepared statement (SQL injection prevention)
    const [results] = await db.query(
      'SELECT id, college_id, password, first_name, is_allowed, is_submitted FROM students WHERE college_id = ? LIMIT 1',
      [college_id.toUpperCase()]
    );

    if (results.length === 0) {
      // Generic response to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const student = results[0];

    // Check if allowed
    if (!student.is_allowed) {
      return res.status(403).json({ message: 'You are not allowed to register. Contact admin.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, student.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ message: 'Server error' });
    }

    // Generate JWT token with expiration
    const token = jwt.sign(
      { id: student.id, college_id: student.college_id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
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
    console.error('Student login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log('Admin login: Missing email or password');
      return res.status(400).json({ message: 'Email and password required' });
    }

    console.log('Admin login attempt with email:', email);

    if (!validateInput(email, 'email')) {
      console.log('Admin login: Email validation failed for:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validateInput(password, 'password')) {
      console.log('Admin login: Password validation failed');
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Query database with prepared statement
    const [results] = await db.query(
      'SELECT id, email, password FROM admins WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );

    if (results.length === 0) {
      console.log('Admin login: No admin found with email:', email);
      // Generic response to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = results[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (!passwordMatch) {
      console.log('Admin login: Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ message: 'Server error' });
    }

    console.log('Admin login: Successful for email:', email);

    // Generate JWT token with expiration
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
