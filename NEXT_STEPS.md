# Next Steps - MySQL Setup & Testing

## Current Status

✅ **Completed:**
- Project structure created (Backend + Frontend)
- Express.js server configured
- 5 API route modules implemented (auth, student, admin, course, health)
- MySQL database queries implemented (30+ queries converted from PostgreSQL)
- Frontend UI created (Login, Student Dashboard, Admin Panel)
- npm dependencies installed (128 packages, 0 vulnerabilities)

❌ **Not Yet Done:**
- MySQL database installation and setup
- Database schema creation
- Admin user creation
- Server connection test
- End-to-end testing

---

## Phase 1: Install MySQL (Windows)

### Option A: MySQL Community Server (Recommended)

1. **Download MySQL 8.0 Community Server**
   - Visit: https://dev.mysql.com/downloads/mysql/
   - Select Windows (x86, 64-bit) MSI Installer
   - Download version 8.0.x

2. **Run the installer**
   - Double-click the .msi file
   - Select "Server only" or "Full" installation
   - Choose "Development Default"
   - Select "Standalone MySQL Server / Classic MySQL"
   - Port: **3306** (default)
   - MySQL Server Instance Configuration Name: **MySQL80**

3. **Configuration**
   - Server Port: 3306
   - Config Type: "Development Machine"
   - TCP/IP: Enable
   - Named Pipes: Disable
   - Shared Memory: Enable

4. **MySQL User Setup**
   - Root Password: **root** (match .env file)
   - Create MySQL User Account: Check "Standard System Account"
   - Username: **mysql80**

5. **Windows Service**
   - Configure MySQL as a Windows Service: ✓ Check
   - Service Name: **MySQL80**
   - Start the MySQL Server now: ✓ Check

6. **Finish Installation**
   - Click "Execute"
   - Wait for configuration to complete
   - Click "Finish"

### Option B: MySQL via Docker (Alternative)

```bash
# If you have Docker installed
docker run --name mysql-limat -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0

# Verify it's running
docker ps  # Should show mysql-limat container
```

### Option C: Windows Subsystem for Linux (WSL)

```bash
# In WSL terminal
sudo apt-get update
sudo apt-get install mysql-server -y
sudo service mysql start

# Set root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

---

## Phase 2: Verify MySQL Installation

### Test Connection

```bash
# From Command Prompt or PowerShell
mysql -u root -p

# When prompted for password, enter: root

# You should see MySQL prompt:
# mysql>
```

### Within MySQL Prompt

```sql
-- Check version
SELECT VERSION();

-- List databases (should see default MySQL databases)
SHOW DATABASES;

-- Exit
EXIT;
```

---

## Phase 3: Create Database & Import Schema

### Method 1: Using Command Line

```bash
# Create database
mysql -u root -p < backend/config/schema.sql
# When prompted: enter password "root"

# Verify it was created
mysql -u root -p -e "SHOW DATABASES;"
```

### Method 2: Using MySQL Workbench (GUI)

1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Open MySQL Workbench
3. Connect to root@localhost with password "root"
4. File → Open SQL Script → Select `backend/config/schema.sql`
5. Click "Execute" button (⚡ icon)
6. Verify in left panel: `limat_registration` database created

### Method 3: Step-by-Step in MySQL Command

```bash
# Connect to MySQL
mysql -u root -p

# Inside MySQL prompt:
```

```sql
-- Create the database
CREATE DATABASE limat_registration;

-- Use the database
USE limat_registration;

-- Create tables (paste entire content from backend/config/schema.sql)
-- Copy everything from schema.sql and paste here

-- Verify tables created
SHOW TABLES;
-- Should show 6 tables: students, courses, lecturers, registrations, admins, + indexes

-- Check one table structure
DESCRIBE students;
```

---

## Phase 4: Create Admin User

### Generate Bcrypt Hash

1. **Using Node.js REPL**

```bash
# Navigate to backend folder
cd backend

# Open Node.js REPL
node

# Inside REPL:
```

```javascript
const bcrypt = require('bcryptjs');

// Replace 'admin123' with desired password
bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) console.error(err);
  else console.log('Bcrypt hash:', hash);
});

// Wait for output, then copy the hash
// Exit with: .exit
```

2. **Or use online tool**: https://bcrypt-generator.com/

### Insert Admin User

```bash
# Connect to MySQL
mysql -u root -p
```

```sql
-- Use the database
USE limat_registration;

-- Insert admin user (replace HASH with bcrypt hash from above)
INSERT INTO admins (email, password) VALUES (
  'admin@limat.edu',
  'PASTE_YOUR_BCRYPT_HASH_HERE'
);

-- Verify it was inserted
SELECT * FROM admins;

-- You should see one admin record
```

**Example:**
```sql
INSERT INTO admins (email, password) VALUES (
  'admin@limat.edu',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye'
);
```

---

## Phase 5: Start Backend Server

### Terminal 1 - Backend Server

```bash
# Navigate to backend
cd backend

# If this is the first time:
npm install
# If already installed:
npm start
```

**Expected Output:**
```
✓ Server running on port 5000
✓ Database connected successfully
```

**If you see error:**
- "ECONNREFUSED" → MySQL not running, go back to Phase 1
- "EACCES" → Port 5000 in use, kill process or change port
- "Access denied for user 'root'@'localhost'" → Check .env file (DB_PASSWORD)

---

## Phase 6: Start Frontend Server

### Terminal 2 - Frontend Server

**Option A: Using Python**
```bash
cd frontend
python -m http.server 8000

# Should show: "Serving HTTP on 0.0.0.0 port 8000"
```

**Option B: Using Node.js**
```bash
cd frontend
npx http-server -p 8000

# Should show: "Server running at http://localhost:8000"
```

**Option C: Using VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click `frontend/index.html`
3. Click "Open with Live Server"
4. Browser opens automatically at `http://localhost:5500`

---

## Phase 7: Test the System

### 1. Open Application

```
http://localhost:8000
```

### 2. Login as Admin

- **Email:** `admin@limat.edu`
- **Password:** `admin123` (whatever you hashed)
- **Expected:** Admin dashboard with add buttons

### 3. Create Test Data

**In Admin Panel:**

1. **Add Course**
   - Name: CS101
   - Description: Programming Fundamentals
   - Max Slots: 60
   - Semester: Fall/Spring

2. **Add Lecturers** (Add 2-3 for same course)
   - Name: Dr. John Smith
   - Course: CS101
   - Schedule: MWF 9:00-10:00 AM

   - Name: Dr. Jane Doe
   - Course: CS101
   - Schedule: TTh 2:00-3:30 PM

3. **Add Student**
   - College ID: 2024001
   - Email: student@limat.edu
   - Password: test123
   - Allowed: Check the toggle

### 4. Login as Student

**Logout admin first, then:**
- **College ID:** 2024001
- **Password:** test123
- **Expected:** Dashboard showing CS101 course

### 5. Test Registration Flow

1. Click on CS101 course card
2. Select a lecturer from dropdown (should show 2 options)
3. Click "Register" button
4. Course should be added to "Registered Courses" list
5. Click "Submit Registration"
6. Message should say "Registration submitted successfully"
7. Redirect to success page

### 6. Verify Database

```bash
# In new terminal (MySQL prompt)
mysql -u root -p

# Inside MySQL:
```

```sql
USE limat_registration;

-- Check students
SELECT COUNT(*) FROM students;

-- Check registrations (should have 1)
SELECT * FROM registrations;

-- Check courses and lecturers
SELECT * FROM courses;
SELECT * FROM lecturers;
```

---

## Phase 8: API Testing (Optional)

### Using Curl Commands

```bash
# 1. Health check
curl http://localhost:5000/api/health

# 2. Admin login
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@limat.edu","password":"admin123"}'
# Returns: {"token": "eyJ..."}

# 3. Save token in variable
$TOKEN = "eyJ..." # (paste from response)

# 4. Get all courses (requires token)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/courses

# 5. Get lecturers for course
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/courses/1/lecturers"
```

---

## Phase 9: Troubleshooting

### Issue: MySQL Port Already in Use

```bash
# Find process using port 3306
netstat -ano | findstr :3306

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: "Access denied for user 'root'@'localhost'"

1. Check `.env` file in backend folder
2. Verify `DB_PASSWORD=root` matches what you set
3. If lost root password, reinstall MySQL

### Issue: "Database limat_registration doesn't exist"

1. Run schema.sql again: `mysql -u root -p < backend/config/schema.sql`
2. Verify: `mysql -u root -p -e "SHOW DATABASES;"`

### Issue: Frontend shows "Connection error"

1. Check backend is running: `npm start` in backend folder
2. Check backend terminal for errors
3. Verify port 5000 is in use: `netstat -ano | findstr :5000`

### Issue: "Course not found" or "No lecturers available"

1. Admin dashboard → Click "Add Course" first
2. Add 1-2 lecturers for that course
3. Allow a student to register
4. Student should see courses after login

---

## Quick Reference

### Directory Structure
```
LIMAT sem/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── controllers/
│   ├── routes/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── student/
│   ├── admin/
│   └── assets/
└── QUICK_START.md
```

### Key Ports
- **Backend:** 5000
- **Frontend:** 8000 (or 5500 with Live Server)
- **MySQL:** 3306

### Key Credentials
- **MySQL Root:** username=root, password=root
- **Admin:** email=admin@limat.edu, password=admin123
- **Test Student:** college_id=2024001, password=test123

---

## Estimated Time

- MySQL Installation: 10-15 minutes
- Database Setup: 5 minutes
- Server Start & Testing: 10-15 minutes
- **Total: 25-35 minutes**

---

## Next Goals After Testing

1. Create multiple test students and courses
2. Test concurrent registrations (multiple students)
3. Test error scenarios (duplicate registration, invalid course)
4. Verify database integrity with complex queries
5. Performance testing with large dataset
6. Deployment planning (production database setup)

---

**Need Help?** Check [MIGRATION_GUIDE_PG_TO_MYSQL.md](./MIGRATION_GUIDE_PG_TO_MYSQL.md) for technical details on the PostgreSQL to MySQL conversion.
