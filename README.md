# 🎓 LIMAT Semester Registration System

A controlled semester registration system where admin manages student access, and students select lecturers for courses with slot limits.

## 📁 Project Structure

```
LIMAT sem/
├── backend/                 # Node.js + Express backend
│   ├── config/
│   │   ├── database.js      # PostgreSQL connection
│   │   └── schema.sql       # Database schema
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── adminController.js
│   │   └── courseController.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── student.js
│   │   ├── admin.js
│   │   └── course.js
│   ├── middleware/          # Authentication middleware
│   │   └── auth.js
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env                 # Environment variables
│
└── frontend/                # HTML + CSS + JS frontend
    ├── assets/
    │   ├── css/
    │   │   └── style.css    # Global styles
    │   └── js/
    │       └── auth.js      # Utility functions
    ├── student/
    │   ├── dashboard.html   # Course selection & registration
    │   └── success.html     # Confirmation page
    ├── admin/
    │   └── dashboard.html   # Admin management panel
    └── index.html           # Login page
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL database
- Browser

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up PostgreSQL:**
   ```bash
   # Create database
   createdb limat_registration

   # Run schema (using psql or your PostgreSQL client)
   psql -U postgres -d limat_registration -f config/schema.sql
   ```

3. **Configure .env file** (already created):
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=limat_registration
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=your_secret_key_change_in_production
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

   You should see:
   ```
   Server running on port 5000
   Database connected: ...
   ```

### Frontend Setup

1. **Simple HTTP Server** (recommended for development):
   ```bash
   # Using Python 3
   cd frontend
   python -m http.server 8000

   # or using Node.js
   npx http-server frontend -p 8000
   ```

2. **Open in browser:**
   ```
   http://localhost:8000
   ```

---

## 🔐 Default Admin Account

Add this to your database or create via backend:

```sql
INSERT INTO admins (email, password) 
VALUES ('admin@limat.edu', '$2a$10/...');  -- password: "admin123" (bcrypt hashed)
```

Use the SQL file to set up with a tool, or manually create with bcrypt.

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/student-login` - Student login
- `POST /api/auth/admin-login` - Admin login

### Student Routes
- `GET /api/student/dashboard` - Get courses & registration status
- `GET /api/student/registered-courses` - Get student's registrations
- `POST /api/student/register-course` - Register for a course
- `POST /api/student/submit-registration` - Lock registration
- `GET /api/student/registration-status` - Check registration status

### Admin Routes
- `POST /api/admin/add-student` - Add new student
- `GET /api/admin/students` - List all students
- `PUT /api/admin/student/:studentId/allow` - Allow/Block student
- `POST /api/admin/add-course` - Add course
- `POST /api/admin/add-lecturer` - Add lecturer
- `GET /api/admin/registrations` - View all registrations
- `GET /api/admin/dashboard-stats` - Get statistics

### Course Routes
- `GET /api/course/all` - Get all courses
- `GET /api/course/:courseId` - Get course with lecturers
- `GET /api/course/:courseId/lecturers` - Get lecturers for course

---

## 🎯 User Flows

### Student Registration Flow
1. Login with College ID + Password
2. System checks if allowed by admin
3. Dashboard shows all courses
4. Click course → Select one lecturer per course
5. View slots availability (real-time)
6. Submit registration (locks permanently)
7. Success page with summary

### Admin Management Flow
1. Login with email + password
2. Dashboard shows statistics
3. Add students (bulk or manual)
4. Allow/Block students based on requirements
5. Add courses and lecturers
6. Monitor registrations in real-time
7. View slot usage

---

## 🔧 Key Features

✅ **Access Control** - Only allowed students can register
✅ **Lecturer Selection** - 1 lecturer per course
✅ **Slot Limiting** - Max 60 students per lecturer
✅ **Lock Mechanism** - Registration locked after submission
✅ **Real-time Updates** - Slot availability updates instantly
✅ **Progress Indicator** - Shows completion percentage
✅ **Admin Dashboard** - Full management panel
✅ **Data Persistence** - PostgreSQL database

---

## 📊 Database Schema

### Students Table
```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  college_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(100),
  is_allowed BOOLEAN DEFAULT FALSE,
  is_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Lecturers Table
```sql
CREATE TABLE lecturers (
  id SERIAL PRIMARY KEY,
  lecturer_name VARCHAR(255) NOT NULL,
  course_id INT NOT NULL,
  max_slots INT DEFAULT 60,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### Registrations Table
```sql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  lecturer_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(id)
);
```

---

## 🔐 Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Role-based access control (Student/Admin)
- CORS enabled for frontend-backend communication
- Registration lock prevents unauthorized changes

---

## 🛠️ Troubleshooting

### Database Connection Error
```
Error: Database connection error
```
**Solution:** Check PostgreSQL is running and credentials in .env are correct.

### CORS Error
**Solution:** Ensure `http://localhost:8000` is accessible and backend is running on port 5000.

### Login Fails
**Solution:** Check that student `is_allowed` is set to `true` in database.

### Slots Not Updating
**Solution:** Refresh the page to see latest slot counts.

---

## 📝 Next Steps

1. **Create seed data** - Add initial admin, courses, lecturers
2. **Testing** - Test complete flows end-to-end
3. **Production** - Replace JWT_SECRET, set NODE_ENV=production
4. **Deployment** - Deploy to cloud (Heroku, AWS, DigitalOcean, etc.)

---

## 📧 Support

For issues or questions, review the code comments or check database logs.

---

**Built with ❤️ | LIMAT Registration System MVP**
