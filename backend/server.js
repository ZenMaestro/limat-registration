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

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
