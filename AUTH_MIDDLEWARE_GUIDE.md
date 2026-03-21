# Authentication & Authorization Middleware Guide

## Overview

The LIMAT application uses JWT (JSON Web Token) based authentication with role-based access control (RBAC). The authentication middleware validates tokens and enforces role-based permissions on protected routes.

---

## Architecture

### 1. Authentication Flow

```
User Login → Generate JWT with role → Token stored in frontend
    ↓
API Request → Token in Authorization header → Middleware validates
    ↓
Token valid? → Extract user info & role → Attach to req.user
    ↓
✓ Allow request to proceed / ✗ Return 401 or 403 error
```

### 2. JWT Payload Structure

**Admin JWT:**
```json
{
  "id": 1,
  "email": "admin@limat.edu",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Student JWT:**
```json
{
  "id": 1,
  "college_id": "CS001",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## Middleware Functions

### Available Middleware

Located in: `backend/middleware/auth.js`

#### 1. `authMiddleware` / `authenticate`
- **Purpose:** Validates JWT token from Authorization header
- **Usage:** `router.get('/endpoint', authMiddleware, controller)`
- **Returns:** 401 if no token or token invalid
- **Attaches:** `req.user` with decoded token data

```javascript
// Example
router.get('/data', authMiddleware, async (req, res) => {
  // User is authenticated
  console.log(req.user.role); // 'admin' or 'student'
});
```

#### 2. `adminMiddleware`
- **Purpose:** Ensures user has 'admin' role
- **Usage:** `router.post('/admin-only', authMiddleware, adminMiddleware, controller)`
- **Returns:** 403 if user role is not 'admin'
- **Requires:** `authMiddleware` must be used first

```javascript
// Example
router.post('/create-course', authMiddleware, adminMiddleware, addCourse);
```

#### 3. `studentMiddleware`
- **Purpose:** Ensures user has 'student' role
- **Usage:** `router.get('/dashboard', authMiddleware, studentMiddleware, controller)`
- **Returns:** 403 if user role is not 'student'
- **Requires:** `authMiddleware` must be used first

```javascript
// Example
router.get('/dashboard', authMiddleware, studentMiddleware, getDashboard);
```

#### 4. `authorize(allowedRoles)`
- **Purpose:** Generic authorization for multiple roles
- **Usage:** `router.put('/resource', authMiddleware, authorize(['admin', 'student']), controller)`
- **Returns:** 403 if user role not in allowedRoles array
- **Advantage:** Single middleware for multiple role checks

```javascript
// Allow both admin and student
router.get('/notifications', authMiddleware, authorize(['admin', 'student']), getNotifications);

// Admin only (equivalent to adminMiddleware)
router.delete('/user/:id', authMiddleware, authorize(['admin']), deleteUser);
```

---

## Using Middleware in Routes

### Pattern 1: Authentication Only (All Logged-in Users)

```javascript
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getPublicData } = require('../controllers/dataController');

const router = express.Router();

// Any authenticated user can access
router.get('/public-data', authMiddleware, getPublicData);

module.exports = router;
```

### Pattern 2: Admin-Only Endpoints

```javascript
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Admin only - must authenticate AND be admin
router.post('/add-course', authMiddleware, adminMiddleware, addCourse);
router.delete('/student/:id', authMiddleware, adminMiddleware, deleteStudent);
```

### Pattern 3: Student-Only Endpoints

```javascript
const { authMiddleware, studentMiddleware } = require('../middleware/auth');

// Student only
router.get('/dashboard', authMiddleware, studentMiddleware, getDashboard);
router.post('/register-course', authMiddleware, studentMiddleware, registerCourse);
```

### Pattern 4: Multiple Role Authorization

```javascript
const { authMiddleware, authorize } = require('../middleware/auth');

// Accessible by both admin and student
router.get('/notifications', authMiddleware, authorize(['admin', 'student']), getNotifications);

// Only accessible by staff and admin
router.get('/reports', authMiddleware, authorize(['admin', 'staff']), getReports);
```

---

## Complete Route Example

### File: `backend/routes/questions.js`

```javascript
const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const { 
  createQuestion, 
  getQuestions, 
  updateQuestion, 
  deleteQuestion 
} = require('../controllers/questionController');

const router = express.Router();

// Create question (admin only)
router.post('/', authMiddleware, authorize(['admin']), createQuestion);

// Get all questions (authenticated users)
router.get('/', authMiddleware, getQuestions);

// Get specific question (authenticated users)
router.get('/:id', authMiddleware, async (req, res) => {
  // Endpoint implementation
});

// Update question (admin only)
router.patch('/:id', authMiddleware, authorize(['admin']), updateQuestion);

// Delete question (admin only)
router.delete('/:id', authMiddleware, authorize(['admin']), deleteQuestion);

module.exports = router;
```

---

## Current Implementation Status

✅ **Completed:**
- `authMiddleware` - JWT validation
- `authMiddleware` alias as `authenticate`
- `adminMiddleware` - Admin role enforcement
- `studentMiddleware` - Student role enforcement
- `authorize()` - Generic role-based authorization
- Auth controllers generate proper JWT tokens with roles
- Admin and student routes properly protected

**Using middleware:**
- ✅ Admin routes (`/api/admin`) - Protected with admin role
- ✅ Student routes (`/api/student`) - Protected with student role
- ✅ Course routes (`/api/course`) - Protected with authentication
- ✅ Auth routes (`/api/auth`) - Login endpoints (no middleware)

---

## Creating New Protected Routes

### Step 1: Create Controller File

`backend/controllers/newController.js`:
```javascript
exports.getData = async (req, res) => {
  try {
    // Access authenticated user info
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Query logic here
    res.json({ data: 'example' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Step 2: Create Route File

`backend/routes/newroute.js`:
```javascript
const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const { getData } = require('../controllers/newController');

const router = express.Router();

router.get('/', authMiddleware, getData); // Any authenticated user
router.post('/', authMiddleware, authorize(['admin']), createData); // Admin only
router.delete('/:id', authMiddleware, authorize(['admin']), deleteData); // Admin only

module.exports = router;
```

### Step 3: Register in `server.js`

```javascript
// Add to imports
const newRoutes = require('./routes/newroute');

// Register route
app.use('/api/newroute', newRoutes);
```

---

## HTTP Request Format

### With Authentication Token

All requests to protected endpoints must include the Authorization header:

```
GET /api/admin/students HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### cURL Example

```bash
curl -X GET http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### JavaScript Fetch Example

```javascript
const response = await fetch('http://localhost:5000/api/admin/students', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Error Responses

### 401 Unauthorized (No Token)
```json
{
  "message": "No token provided"
}
```

### 403 Forbidden (Invalid Role)
```json
{
  "message": "Admin access required"
}
```

### 403 Forbidden (Multiple Role Check)
```json
{
  "message": "Access denied. Required roles: admin, staff"
}
```

### 403 Forbidden (Token Expired/Invalid)
```json
{
  "message": "Invalid or expired token"
}
```

---

## Frontend Integration

### Login and Store Token

```javascript
// Student login
const loginStudent = async (collegeId, password) => {
  const response = await fetch('http://localhost:5000/api/auth/student-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ college_id: collegeId, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token); // Store token
  return data;
};

// Admin login
const loginAdmin = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};
```

### Make Authenticated Requests

```javascript
// Helper function
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`http://localhost:5000${endpoint}`, options);
  return response.json();
};

// Usage
const students = await apiCall('/api/admin/students');
const dashboardData = await apiCall('/api/student/dashboard');
const newCourse = await apiCall('/api/admin/add-course', 'POST', {
  code: 'CS101',
  name: 'Intro to CS'
});
```

---

## Security Best Practices

1. **Always validate authentication first**
   ```javascript
   // ✅ Correct
   router.post('/admin', authMiddleware, adminMiddleware, controller);
   
   // ❌ Wrong - Only checking role without authentication
   router.post('/admin', adminMiddleware, controller);
   ```

2. **Use authorization for generic roles**
   ```javascript
   // ✅ Prefer this for cleaner code
   router.get('/reports', authMiddleware, authorize(['admin', 'manager']), getReports);
   
   // ❌ Avoid chaining too many specific middleware
   router.get('/reports', authMiddleware, adminMiddleware, managerMiddleware, getReports);
   ```

3. **Never expose sensitive data without checking role**
   ```javascript
   // ✅ Check role before returning sensitive data
   router.get('/salary', authMiddleware, async (req, res) => {
     if (req.user.role !== 'admin') {
       return res.status(403).json({ message: 'Forbidden' });
     }
     // Return salary data
   });
   ```

4. **Validate JWT_SECRET in production**
   - Never commit real secrets to git
   - Use strong, randomly generated secrets
   - Rotate secrets periodically
   - Use environment-specific secrets

---

## Environment Configuration

In `backend/.env`:
```
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

**For Production:**
- Change `JWT_SECRET` to a strong random string
- Set `NODE_ENV=production`
- Use HTTPS only
- Add token refresh rotation

---

## Troubleshooting

### Issue: "No token provided"
**Cause:** Client didn't send Authorization header
**Solution:** 
```javascript
// Frontend must send token
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Issue: "Invalid or expired token"
**Cause:** Token invalid or expired
**Solution:** 
- Request user to login again
- Check JWT_SECRET matches between login and validation
- Check token format is correct (`Bearer <token>`)

### Issue: "Admin access required"
**Cause:** User role is 'student', not 'admin'
**Solution:**
- Verify user logged as admin
- Check login endpoint returns correct role in token
- Check admin user exists in database

### Issue: Route not protected
**Cause:** Forgot to add middleware
**Solution:**
```javascript
// ❌ Forgot middleware
router.get('/data', controller);

// ✅ Add authentication
router.get('/data', authMiddleware, controller);
```

---

## Summary

| Middleware | Purpose | Placement |
|-----------|---------|-----------|
| `authMiddleware` | Validate JWT | First in chain |
| `adminMiddleware` | Require admin role | After authMiddleware |
| `studentMiddleware` | Require student role | After authMiddleware |
| `authorize(roles)` | Check if role in list | After authMiddleware |

**Key Routes Status:**
- ✅ Admin: Protected with `admin` role
- ✅ Student: Protected with `student` role  
- ✅ Auth: No protection (login endpoints)
- ✅ Course: Protected with authentication
- ✅ Notifications: Protected with authentication
- ✅ Announcements: Protected with authentication

For questions or issues, refer to the error responses section or check that tokens are being generated with the correct role information.
