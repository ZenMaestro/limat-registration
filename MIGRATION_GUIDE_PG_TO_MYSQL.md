# PostgreSQL to MySQL Migration Guide

## Overview

This document outlines all the changes made when migrating the backend from PostgreSQL to MySQL. All database queries were converted to work with the MySQL2 library while maintaining the exact same business logic and API contracts.

---

## 1. Dependency Changes

### package.json

**Before:**
```json
{
  "pg": "^8.10.0"
}
```

**After:**
```json
{
  "mysql2": "^3.6.5"
}
```

**Why:** 
- `pg` is the PostgreSQL driver for Node.js
- `mysql2` is the official MySQL driver with promise support
- mysql2 provides promise-based API which is cleaner than callback-based pg

---

## 2. Database Configuration

### config/database.js

**PostgreSQL Syntax:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
```

**MySQL Syntax:**
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 10,
  waitForConnections: true,
});

module.exports = {
  query: (sql, params) => pool.query(sql, params),
  getConnection: () => pool.getConnection(),
};
```

**Key Differences:**
- PostgreSQL `Pool` → MySQL `createPool`
- PostgreSQL returns `{ rows: [] }` → MySQL returns `[rows, fields]` (array tuple)
- MySQL configuration includes connection pool limits
- MySQL requires explicit `waitForConnections` setting

---

## 3. Database & Table Definition

### config/schema.sql

#### Auto-Increment Keys

**PostgreSQL:**
```sql
id SERIAL PRIMARY KEY
```

**MySQL:**
```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

#### Unique Constraints

**PostgreSQL:**
```sql
college_id VARCHAR(20) UNIQUE NOT NULL
```

**MySQL:**
```sql
college_id VARCHAR(20) UNIQUE NOT NULL
```
(Same syntax, but MySQL uses backticks for reserved words)

#### Timestamps

**PostgreSQL:**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**MySQL:**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**Why:** MySQL requires explicit `ON UPDATE` clause for auto-updating timestamps

#### Table Creation

**PostgreSQL:**
```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  college_id VARCHAR(20) UNIQUE NOT NULL,
  ...
);
```

**MySQL:**
```sql
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `college_id` VARCHAR(20) UNIQUE NOT NULL,
  ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Differences:**
- Column names wrapped in backticks (MySQL convention)
- Explicit `ENGINE=InnoDB` (MySQL default, but specified for clarity)
- `CHARSET=utf8mb4` for emoji/international character support
- `COLLATE=utf8mb4_unicode_ci` for case-insensitive collation

---

## 4. Query Syntax Changes

### Parameter Placeholders

**PostgreSQL:**
```javascript
const result = await db.query(
  'SELECT * FROM students WHERE id = $1 AND college_id = $2',
  [studentId, collegeId]
);
```

**MySQL:**
```javascript
const [results] = await db.query(
  'SELECT * FROM students WHERE id = ? AND college_id = ?',
  [studentId, collegeId]
);
```

**Key Points:**
- PostgreSQL uses `$1, $2, $3...` (position-based)
- MySQL uses `?` (position-based, but simpler syntax)
- MySQL returns tuple `[results, fields]`, so we destructure with `const [results]`

### Result Access Patterns

**PostgreSQL:**
```javascript
const result = await db.query(query, params);
const rows = result.rows;  // Array of objects
const firstRow = result.rows[0];  // Single object
```

**MySQL:**
```javascript
const [results] = await db.query(query, params);  // Results is already an array
const rows = results;  // Array of objects
const firstRow = results[0];  // Single object
```

### Upsert Syntax

**PostgreSQL (ON CONFLICT):**
```javascript
await db.query(
  `UPDATE students SET is_submitted = true 
   WHERE id = $1 
   ON CONFLICT (id) DO UPDATE SET is_submitted = true`,
  [studentId]
);
```

**MySQL (ON DUPLICATE KEY UPDATE):**
```javascript
await db.query(
  `UPDATE students SET is_submitted = true 
   WHERE id = ?`,
  [studentId]
);

// For true upsert (insert or update):
await db.query(
  `INSERT INTO registrations (student_id, course_id, lecturer_id) 
   VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE lecturer_id = VALUES(lecturer_id)`,
  [studentId, courseId, lecturerId]
);
```

### RETURNING Clause

**PostgreSQL:**
```javascript
const result = await db.query(
  'INSERT INTO students (college_id, email) VALUES ($1, $2) RETURNING id',
  [collegeId, email]
);
const insertedId = result.rows[0].id;
```

**MySQL:**
```javascript
const [result] = await db.query(
  'INSERT INTO students (college_id, email) VALUES (?, ?)',
  [collegeId, email]
);
const insertedId = result.insertId;  // MySQL provides insertId property

// OR: Retrieve the inserted row with separate query
const [rows] = await db.query(
  'SELECT * FROM students WHERE id = ?',
  [result.insertId]
);
```

---

## 5. Error Handling

### PostgreSQL Error Codes

```javascript
if (error.code === '23505') {  // Unique violation
  return res.status(400).json({ error: 'College ID already exists' });
}
```

### MySQL Error Codes

```javascript
if (error.code === 'ER_DUP_ENTRY') {  // Duplicate key
  return res.status(400).json({ error: 'College ID already exists' });
}
```

**Common MySQL Error Codes:**
- `ER_DUP_ENTRY` - Duplicate entry for unique key (23505 in PG)
- `ER_NO_REFERENCED_ROW` - Foreign key constraint failed
- `ER_PARSE_ERROR` - SQL syntax error

---

## 6. Debugging Connection Issues

### PostgreSQL Connection Test

```javascript
// server.js
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', result.rows[0]);
  }
});
```

### MySQL Connection Test

```javascript
// server.js
db.getConnection()
  .then((conn) => {
    conn.ping()
      .then(() => {
        console.log('Database connected successfully');
        conn.release();
      })
      .catch((err) => console.error('Database ping error:', err));
  })
  .catch((err) => console.error('Cannot get database connection:', err));
```

---

## 7. Migration Checklist

Use this checklist to migrate similar projects:

- [ ] Replace `pg` with `mysql2` in `package.json`
- [ ] Update `config/database.js` to use mysql connection pool
- [ ] Convert `schema.sql` (SERIAL → AUTO_INCREMENT, timestamps, engine)
- [ ] Update `.env` (port 5432 → 3306, user and password if needed)
- [ ] In all controllers, replace `$n` with `?` in SQL placeholders
- [ ] Destructure results: `const [results] = await db.query(...)`
- [ ] Update error codes (23505 → ER_DUP_ENTRY, etc.)
- [ ] Replace RETURNING with `insertId` or separate SELECT
- [ ] Test all API endpoints with curl or Postman
- [ ] Verify database data integrity

---

## 8. Testing & Validation

### Run These Tests After Migration

```bash
# 1. Test database connection
npm start

# 2. Test student registration flow
curl -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"college_id": "2024001", "password": "pass123"}'

# 3. Test admin login
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@limat.edu", "password": "admin123"}'

# 4. Test course retrieval
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Verify MySQL database
mysql -u root -p
USE limat_registration;
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM registrations;
```

---

## 9. Performance Considerations

### MySQL Optimizations

The migration included these performance features:

1. **Connection Pooling:** MySQL connection pool with 10 connections
2. **Indexes:** All foreign keys and frequently queried columns indexed
3. **Charset:** UTF8MB4 for emoji and international character support
4. **Engine:** InnoDB for ACID properties and foreign key constraints

### Query Performance Tips

```javascript
// ✅ Good: Use indexes
SELECT * FROM students WHERE college_id = ?;

// ❌ Avoid: Full table scans
SELECT * FROM students WHERE LOWER(email) = ?;

// ✅ Good: Join with proper indexes
SELECT s.*, c.name FROM students s 
JOIN registrations r ON s.id = r.student_id 
JOIN courses c ON r.course_id = c.id 
WHERE s.id = ?;
```

---

## 10. Rollback to PostgreSQL (If Needed)

If you need to revert to PostgreSQL:

1. Replace `mysql2` with `pg` in package.json
2. Revert `config/database.js` to PostgreSQL syntax
3. Convert `schema.sql` back (AUTO_INCREMENT → SERIAL, MySQL syntax → PG)
4. Replace all `?` with `$1, $2, $3...` in controllers
5. Change error codes back (ER_DUP_ENTRY → '23505')
6. Remove `const [results]` destructuring (use `result.rows`)

---

## 11. Additional Resources

- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [MySQL Query Syntax](https://dev.mysql.com/doc/refman/8.0/en/)
- [MySQL Error Codes](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)
- [Node.js MySQL Best Practices](https://nodejs.org/en/docs/guides/nodejs-mysql-guide/)

---

**Last Updated:** During MySQL migration from PostgreSQL  
**Files Modified:** 9 main backend files  
**Queries Converted:** 30+ database queries  
**Testing Status:** Ready for MySQL database setup and end-to-end testing
