const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAdmin() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const connection = await pool.getConnection();
    
    // Delete existing admin
    await connection.query('DELETE FROM admins WHERE email = ?', ['admin@limat.edu']);
    console.log('✓ Deleted old admin account');
    
    // Insert new admin with correct bcrypt hash for password "admin123"
    const passwordHash = '$2a$10$VRu3Ljab4d/BttuASaBE3.YF5m3F.x.snMSJNpPypKn5uskooBOFG';
    
    await connection.query(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      ['admin@limat.edu', passwordHash]
    );
    console.log('✓ Created admin account');
    console.log('  Email: admin@limat.edu');
    console.log('  Password: admin123');
    
    // Verify
    const [rows] = await connection.query('SELECT id, email, PASSWORD(password) as pwd_hash FROM admins');
    console.log('\n✓ Admin accounts in database:');
    console.log(rows);
    
    connection.release();
    pool.end();
  } catch (error) {
    console.error('Setup error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
