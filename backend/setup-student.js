const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupStudent() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const connection = await pool.getConnection();
    
    const passwordHash = '$2a$10$k00afPKC2/mJzpFzG85KSek9vuTA41CSeD3XWFwZjJ1xu8ELpWhYK';
    
    await connection.query(
      'INSERT INTO students (college_id, password, first_name, last_name, email, is_allowed, is_submitted) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['2024001', passwordHash, 'John', 'Doe', 'student@limat.edu', true, false]
    );
    console.log('✓ Created test student account');
    console.log('  College ID: 2024001');
    console.log('  Password: test123');
    console.log('  Status: Allowed to register');
    
    // Verify
    const [rows] = await connection.query('SELECT id, college_id, first_name, is_allowed FROM students');
    console.log('\n✓ Students in database:');
    rows.forEach(s => console.log(`  - ${s.college_id}: ${s.first_name} (Allowed: ${s.is_allowed})`));
    
    connection.release();
    pool.end();
  } catch (error) {
    console.error('Setup error:', error.message);
    process.exit(1);
  }
}

setupStudent();
