# System Validation Checklist

Use this checklist to verify that the entire system is working correctly after MySQL setup.

---

## Pre-Startup Validation

### ✓ Check MySQL Installation

```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT VERSION();"

# Expected output: 8.0.x or higher

# Password: root
```

- [ ] MySQL service is running
- [ ] Connection successful with root/root credentials
- [ ] Version is 8.0 or higher

### ✓ Check Database Creation

```bash
mysql -u root -p -e "USE limat_registration; SHOW TABLES;"

# Expected output: List of 6 tables (students, courses, lecturers, registrations, admins, + indexes)
```

- [ ] Database `limat_registration` exists
- [ ] All 6 tables created successfully
- [ ] Table structures are correct

### ✓ Check Admin Account

```bash
mysql -u root -p -e "USE limat_registration; SELECT * FROM admins;"

# Expected output: 1 row with admin@limat.edu
```

- [ ] Admin account exists with email: `admin@limat.edu`
- [ ] Password is hashed (bcryptjs format starting with $2a$)
- [ ] Column names correct: email, password

### ✓ Verify Backend Configuration

```bash
# Check .env file exists
cat backend/.env

# Should contain:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=limat_registration
# DB_USER=root
# DB_PASSWORD=root
```

- [ ] `.env` file exists in backend folder
- [ ] DB_HOST=localhost
- [ ] DB_PORT=3306 (MySQL port, not 5432)
- [ ] DB_NAME=limat_registration
- [ ] DB_USER=root
- [ ] DB_PASSWORD=root

### ✓ Verify npm Dependencies

```bash
cd backend
npm list | grep mysql2

# Should show: mysql2@3.6.5 or higher
```

- [ ] mysql2 package is installed (not pg)
- [ ] Version is 3.6.5 or higher
- [ ] No missing dependencies (npm install if needed)

---

## Startup Validation

### ✓ Backend Server Startup

```bash
cd backend
npm start

# Monitor output for:
# ✓ Server running on port 5000
# ✓ Database connected successfully
```

- [ ] Server starts without errors
- [ ] "Server running on port 5000" message appears
- [ ] "Database connected successfully" message appears
- [ ] No "ECONNREFUSED" or "Access denied" errors

### ✓ Frontend Server Startup

```bash
cd frontend

# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: VS Code Live Server (right-click index.html → Open with Live Server)
```

- [ ] Server starts on port 8000 (or 5500 for Live Server)
- [ ] No port conflicts
- [ ] "Serving HTTP" or similar message appears

### ✓ Browser Access

```
http://localhost:8000
```

- [ ] Page loads without network errors
- [ ] Login form is visible
- [ ] Images load correctly
- [ ] Styling (CSS) is applied

---

## Authentication Validation

### ✓ Admin Login

**Credentials:**
- Email: `admin@limat.edu`
- Password: `admin123` (or whatever you set)

**Steps:**
1. Click "Admin Login" tab
2. Enter credentials
3. Click "Login"

**Expected Results:**
- [ ] Login successful (no error message)
- [ ] Redirected to admin dashboard
- [ ] Dashboard shows "Dashboard Statistics" section
- [ ] Token saved in browser localStorage

### ✓ Student Login

**Credentials:**
- College ID: `2024001`
- Password: `test123`

**Note:** Create student first via admin panel

**Steps:**
1. Click "Student Login" tab
2. Enter college ID and password
3. Click "Login"

**Expected Results:**
- [ ] Login successful (no error message)
- [ ] Redirected to student dashboard
- [ ] Shows "My Course Registrations" section (initially empty)
- [ ] Token saved in browser localStorage

---

## Admin Panel Validation

### ✓ Dashboard Statistics

**Access:** Admin Panel → Dashboard Tab

**Expected Data:**
- [ ] Total Students: Shows count
- [ ] Total Courses: Shows count (initially 0)
- [ ] Total Lecturers: Shows count (initially 0)
- [ ] Total Registrations: Shows count (initially 0)

### ✓ Add Course

**Access:** Admin Panel → Courses Tab → "Add New Course" button

**Steps:**
1. Fill form:
   - Name: `CS101`
   - Description: `Programming Fundamentals`
   - Max Slots: `60`
   - Semester: `Fall 2024`
2. Click "Add Course"

**Expected Results:**
- [ ] Success message appears: "Course added successfully"
- [ ] Course appears in courses list
- [ ] Table shows: CS101 | Programming Fundamentals | 60 slots | Fall 2024

### ✓ Add Lecturers

**Access:** Admin Panel → Lecturers Tab → "Add New Lecturer" button

**Steps (Add 2 lecturers for CS101):**
1. First lecturer:
   - Name: `Dr. John Smith`
   - Course: `CS101`
   - Schedule: `MWF 9:00-10:00 AM`

2. Second lecturer:
   - Name: `Dr. Jane Doe`
   - Course: `CS101`
   - Schedule: `TTh 2:00-3:30 PM`

**Expected Results:**
- [ ] Success message for each addition
- [ ] Both lecturers appear in lecturers list
- [ ] Both associated with CS101 course
- [ ] Schedules display correctly

### ✓ Add Student

**Access:** Admin Panel → Students Tab → "Add Student" button

**Steps:**
1. Fill form:
   - College ID: `2024001`
   - Email: `student@limat.edu`
   - Password: `test123`
2. Click "Add Student"

**Expected Results:**
- [ ] Success message: "Student added successfully"
- [ ] Student appears in students list
- [ ] College ID: 2024001 visible
- [ ] "Allowed" column shows: "No" (toggle needed)

### ✓ Allow Student to Register

**Access:** Admin Panel → Students Tab → "Allowed" toggle next to student

**Steps:**
1. Find student `2024001` in table
2. Toggle "Allowed" switch

**Expected Results:**
- [ ] Toggle switches to "Yes"
- [ ] Success message appears
- [ ] Allowed column updates immediately
- [ ] Student can now login and register

### ✓ View Registrations

**Access:** Admin Panel → Registrations Tab

**Expected Results:**
- [ ] Table is initially empty (no columns shown yet)
- [ ] After student registration, shows:
  - Student ID / College ID
  - Course Name
  - Lecturer Name
  - Registration Date

---

## Student Registration Flow Validation

### ✓ Student Dashboard

**Credentials:** College ID=2024001, Password=test123

**Access:** After successful login

**Expected Layout:**
- [ ] Header shows: "Student Dashboard" + logout button
- [ ] "My Course Registrations" section (initially empty)
- [ ] Progress indicator section
- [ ] "Available Courses" section

### ✓ Course Selection

**Expected State:**
- [ ] CS101 course card visible
- [ ] Shows course name, description
- [ ] Shows "Available Lecturers" or lecturer selector
- [ ] "Register" button is clickable

**Steps:**
1. Click on CS101 course card OR "Register" button
2. Modal appears with lecturer selection
3. Select a lecturer (Dr. John Smith or Dr. Jane Doe)
4. Click "Register for this course"

**Expected Results:**
- [ ] Modal closes
- [ ] Course added to "My Course Registrations" section
- [ ] Shows selected lecturer name
- [ ] Progress indicator updates (e.g., "1/1 courses registered")

### ✓ Multi-Course Registration

**Test Multiple Courses:**
1. Add another course via admin panel (e.g., CS102)
2. Add lecturers for CS102
3. Student dashboard refreshes
4. Student registers for CS102 as well

**Expected Results:**
- [ ] Both CS101 and CS102 appear in "My Course Registrations"
- [ ] Progress shows "2/2 courses registered"
- [ ] Each shows selected lecturer

### ✓ Submit Registration

**Steps:**
1. After registering for all courses, click "Submit Registration" button
2. Confirm dialog appears
3. Click "Confirm" to submit

**Expected Results:**
- [ ] Success message: "Registration submitted successfully"
- [ ] Redirected to success page
- [ ] Success page shows:
  - List of registered courses + lecturers
  - Confirmation message
  - College ID and student name

### ✓ Re-Login After Submit

**Steps:**
1. Logout from student account
2. Login again with same credentials
3. Go to student dashboard

**Expected Results:**
- [ ] Dashboard shows previous registration
- [ ] "Submit Registration" button is disabled
- [ ] Message shows: "You have already submitted your registration"
- [ ] Courses and lecturers persist from previous session

---

## Database Data Validation

### ✓ Verify Course Data

```bash
mysql -u root -p
USE limat_registration;
SELECT * FROM courses;
```

**Expected:**
- [ ] CS101 row exists with:
  - Name: CS101
  - Description: Programming Fundamentals
  - Max Slots: 60
  - Semester: Fall 2024
  - created_at: timestamp

### ✓ Verify Lecturer Data

```sql
SELECT * FROM lecturers;
```

**Expected:**
- [ ] 2 rows for Dr. John Smith and Dr. Jane Doe
- [ ] Both have course_id pointing to CS101
- [ ] Schedule contains time info
- [ ] created_at timestamps

### ✓ Verify Student Data

```sql
SELECT * FROM students;
```

**Expected:**
- [ ] Student 2024001 row with:
  - College ID: 2024001
  - Email: student@limat.edu
  - is_allowed: 1 (true)
  - is_submitted: 1 (true after registration)
  - password: bcryptjs hash starting with $2a$

### ✓ Verify Registration Data

```sql
SELECT r.*, s.college_id, c.name, l.name 
FROM registrations r 
JOIN students s ON r.student_id = s.id 
JOIN courses c ON r.course_id = c.id 
JOIN lecturers l ON r.lecturer_id = l.id;
```

**Expected:**
- [ ] 1+ rows showing:
  - student_id: 1 (or assigned ID)
  - course_id: 1 (CS101)
  - lecturer_id: 1 or 2 (John Smith or Jane Doe)
  - college_id: 2024001
  - course name: CS101
  - lecturer name: Dr. John Smith or Dr. Jane Doe
  - created_at: timestamp

### ✓ Verify Indexes

```sql
SHOW INDEXES FROM students;
SHOW INDEXES FROM registrations;
```

**Expected:**
- [ ] Primary keys on id columns
- [ ] Unique index on college_id in students
- [ ] Foreign key indexes on course_id, lecturer_id, student_id in registrations

---

## Error Handling Validation

### ✓ Duplicate Registration Prevention

**Steps:**
1. Student tries to register for CS101 again
2. Select same lecturer
3. Click register

**Expected Results:**
- [ ] Course already appears in list
- [ ] Lecturer selection updates (not duplicate added)
- [ ] No error, but registration updates silently

### ✓ Slot Capacity Validation

**Setup:** CS101 with Max Slots = 2

**Steps:**
1. Admin adds 2 more courses with limit of 1 slot each
2. Add students 2024002, 2024003, and 2024004
3. Students 001-003 try to register for CS102 (1 slot max)
4. Student 001 registers first (success)
5. Student 002 registers (should see "No available slots" or similar)

**Expected Results:**
- [ ] Student 001 registration succeeds
- [ ] Student 002 sees error: "No available slots for this course"
- [ ] Student 002 cannot register

### ✓ Pre-Submit Validation

**Steps:**
1. Student registers for only 1 course (if system requires all)
2. Clicks "Submit Registration"

**Expected Results:**
- [ ] Error message appears
- [ ] Submission blocked
- [ ] Must choose all courses before submit

### ✓ Already Submitted Prevention

**Steps:**
1. Student submits registration (completes flow)
2. Student logs out and back in
3. Tries to register for another course

**Expected Results:**
- [ ] Registration form is disabled
- [ ] Message: "You have already submitted your registration"
- [ ] Cannot modify registration

---

## API Endpoint Validation

### ✓ Health Check Endpoint

```bash
curl http://localhost:5000/api/health

# Expected response: {"status":"OK"}
```

- [ ] Returns 200 status code
- [ ] Response body shows {"status":"OK"}

### ✓ Admin Login Endpoint

```bash
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@limat.edu","password":"admin123"}'

# Expected response: {"token":"eyJ..."}
```

- [ ] Returns 200 status code
- [ ] Response includes JWT token
- [ ] Token starts with "eyJ" (JWT format)

### ✓ Student Login Endpoint

```bash
curl -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"college_id":"2024001","password":"test123"}'

# Expected response: {"token":"eyJ..."}
```

- [ ] Returns 200 status code
- [ ] Response includes JWT token
- [ ] Token format valid

### ✓ Get Courses Endpoint

```bash
# Replace TOKEN with actual JWT
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/courses

# Expected response: [{"id":1,"name":"CS101",...}]
```

- [ ] Returns 200 status code
- [ ] Response is JSON array
- [ ] Each course has: id, name, description, max_slots, semester
- [ ] Requires valid token (403 if missing)

### ✓ Get Lecturers Endpoint

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/courses/1/lecturers"

# Expected response: [{"id":1,"name":"Dr. John Smith",...}]
```

- [ ] Returns 200 status code
- [ ] Shows lecturers for specified course
- [ ] Each lecturer includes name and schedule

---

## Performance & Load Testing

### ✓ Multiple Concurrent Students

**Setup:** Add 10 students via admin panel

**Steps:**
1. Open 3 browser windows/tabs
2. Login as 3 different students
3. All register for same course
4. Wait for slot limit to be reached
5. Next student attempts registration

**Expected Results:**
- [ ] No database locks (all complete quickly)
- [ ] Slot counting is accurate
- [ ] Last student sees "No available slots" appropriately
- [ ] Database shows exactly seat limit registrations

### ✓ Page Load Performance

**Measure:**
- Admin dashboard loads in < 2 seconds
- Student dashboard loads in < 2 seconds
- Course list renders smoothly

**Expected:** No lag, smooth interactions

### ✓ Database Query Efficiency

```bash
# Monitor MySQL query logs during heavy testing
mysql -u root -p

# Inside MySQL:
```

```sql
SET GLOBAL log_error_verbosity = 3;
SET GLOBAL general_log = 'ON';
SELECT * FROM mysql.general_log ORDER BY event_time DESC LIMIT 20;
```

**Expected:**
- [ ] No slow queries (< 100ms)
- [ ] No N+1 query patterns
- [ ] Join operations use indexes

---

## Security Validation

### ✓ JWT Token Expiry

**Steps:**
1. Login to student account
2. Copy JWT token from localStorage (browser DevTools)
3. Wait 24+ hours OR modify token expiry in authController.js
4. Try to use expired token

**Expected Results:**
- [ ] API rejects expired token with 401 error
- [ ] User must re-login
- [ ] New token issued

### ✓ Password Hashing

**Verify:**
```bash
mysql -u root -p -e "USE limat_registration; SELECT password FROM admins;"
```

**Expected:**
- [ ] Password field contains bcryptjs hash (starts with $2a$)
- [ ] NOT plaintext password
- [ ] Hash length approximately 60 characters

### ✓ Role-Based Access Control

**Test Admin Access:**
1. Login as student
2. Try to access `/api/admin/students` endpoint
3. Use student token in authorization header

**Expected Results:**
- [ ] Request returns 403 Forbidden
- [ ] Error message: "Admin access required"

**Test Student Cannot Access Admin Routes:**
- Student cannot add courses
- Student cannot view statistics
- Student cannot manage other students

### ✓ SQL Injection Prevention

**Test Input Validation:**
1. Admin adds student with email: `test'; DROP TABLE students; --`
2. Page should escape/validate input

**Expected Results:**
- [ ] Input is safely escaped
- [ ] No SQL error occurs
- [ ] Email stored as literal string (not executed)

---

## Cleanup & Reset

### Clear Test Data

```bash
mysql -u root -p

# Inside MySQL:
```

```sql
USE limat_registration;

-- Delete test data (keep admin)
DELETE FROM registrations;
DELETE FROM students WHERE college_id != 'ADMIN_ID';
DELETE FROM lecturers;
DELETE FROM courses;

-- Reset auto-increment values
ALTER TABLE courses AUTO_INCREMENT = 1;
ALTER TABLE lecturers AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE registrations AUTO_INCREMENT = 1;

-- Verify clean state
SELECT COUNT(*) FROM courses;      -- Should return 0
SELECT COUNT(*) FROM lecturers;    -- Should return 0
SELECT COUNT(*) FROM students;     -- Should return 1 (admin)
SELECT COUNT(*) FROM registrations; -- Should return 0
```

- [ ] All test data removed (except admin)
- [ ] Auto-increment counters reset
- [ ] Database in fresh state for new tests

---

## Summary

**Total Checks:**
- Pre-Startup: 5 sections (17 items)
- Startup: 3 sections (6 items)
- Authentication: 2 sections (8 items)
- Admin Panel: 6 sections (20+ items)
- Student Flow: 5 sections (15+ items)
- Database: 5 sections (10+ items)
- Error Handling: 4 sections (10+ items)
- API Endpoints: 5 sections (8+ items)
- Performance: 3 sections (5+ items)
- Security: 4 sections (8+ items)

**Target:** ✓ All 100+ validations PASSING

---

**Last Validation Date:** ______________________  
**Validated By:** ______________________  
**Issues Found:** ______________________  
**Resolution Status:** ______________________
