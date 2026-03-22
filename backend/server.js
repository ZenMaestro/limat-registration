require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Database connection test
db.getConnection().then(connection => {
  connection.ping();
  connection.release();
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/course');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/course', courseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    jwt_secret_set: !!process.env.JWT_SECRET,
    db_host: process.env.DB_HOST || 'not set',
    node_env: process.env.NODE_ENV
  });
});

// Admin login test endpoint (for debugging only)
app.post('/api/test-login', async (req, res) => {
  try {
    console.log('Test login endpoint hit');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    res.json({ 
      message: 'Test endpoint working',
      body_received: req.body,
      jwt_secret_set: !!process.env.JWT_SECRET
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Temporary endpoint to add department to students table
app.get('/api/setup/update-db', async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.query('ALTER TABLE students ADD COLUMN department VARCHAR(50) DEFAULT NULL;');
    connection.release();
    res.json({ success: true, message: 'Added department column to students table successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      res.json({ success: true, message: 'Department column already exists.' });
    } else {
      console.error('DB Update Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Debug endpoint to check admin password hash in database
app.get('/api/debug/admin-hash', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const results = await connection.query('SELECT email, password FROM admins WHERE email = ?', ['admin@limat.edu']);
    connection.release();
    
    if (results.length === 0) {
      return res.json({ message: 'No admin found', email: 'admin@limat.edu' });
    }
    
    const admin = results[0];
    const passwordLength = admin.password ? admin.password.length : 0;
    const startsWithDollar = admin.password ? admin.password.startsWith('$') : false;
    const startsWithHash = admin.password ? admin.password.startsWith('$2a$10$') : false;
    
    res.json({
      email: admin.email,
      password_hash: admin.password,
      password_length: passwordLength,
      starts_with_dollar: startsWithDollar,
      starts_with_correct_bcrypt_prefix: startsWithHash,
      is_corrupted: !startsWithHash && passwordLength > 0
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN SETUP ENDPOINT - Safely insert admin with properly hashed password
app.get('/api/setup/admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const email = 'admin@limat.edu';
    const password = 'admin123';
    
    // Hash password with bcryptjs (same as used in code)
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated bcrypt hash:', hashedPassword);
    
    const connection = await db.getConnection();
    
    // First delete existing admin
    await connection.query('DELETE FROM admins WHERE email = ?', [email]);
    console.log('Deleted existing admin record');
    
    // Then insert with properly hashed password using parameterized query
    const result = await connection.query(
      'INSERT INTO admins (email, password) VALUES (?, ?)', 
      [email, hashedPassword]
    );
    connection.release();
    
    console.log('Admin inserted successfully with hash:', hashedPassword);
    
    res.json({
      status: 'Admin setup successful',
      email: email,
      password_set_to: password,
      bcrypt_hash: hashedPassword,
      note: 'Use email: admin@limat.edu and password: admin123 to login'
    });
  } catch (error) {
    console.error('Setup endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all non-API routes (SPA fallback)
// Make sure this only catches actual page requests, not static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/student/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/dashboard.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
