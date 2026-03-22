const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    console.log('Student login attempt with body:', req.body);
    const { college_id, password } = req.body;

    if (!college_id || !password) {
      return res.status(400).json({ message: 'College ID and password required' });
    }

    console.log('Querying database for college_id:', college_id);
    const [results] = await db.query(
      'SELECT id, college_id, password, first_name, is_allowed, is_submitted FROM students WHERE college_id = ?',
      [college_id]
    );

    console.log('Database query results:', results.length > 0 ? 'Found' : 'Not found');

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const student = results[0];

    // Check if allowed
    if (!student.is_allowed) {
      return res.status(403).json({ message: 'You are not allowed to register. Contact admin.' });
    }

    console.log('Student found, comparing passwords...');
    // Check password
    const passwordMatch = await bcrypt.compare(password, student.password);
    console.log('Password match result:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing' });
    }

    console.log('Generating JWT token...');
    // Generate token
    const token = jwt.sign(
      { id: student.id, college_id: student.college_id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', college_id);
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    console.log('Admin login attempt with body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    console.log('Querying database for email:', email);
    const [results] = await db.query(
      'SELECT id, email, password FROM admins WHERE email = ?',
      [email]
    );

    console.log('Database query results:', results.length > 0 ? 'Found' : 'Not found');

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = results[0];
    console.log('Admin found, comparing passwords...');

    const passwordMatch = await bcrypt.compare(password, admin.password);
    console.log('Password match result:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing' });
    }

    console.log('Generating JWT token...');
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
