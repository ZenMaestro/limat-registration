# 🎓 LIMAT Semester Registration System

A controlled semester registration system where administrators manage student access and course/lecturer allocations, while students select lecturers for courses with real-time slot tracking and submission locking.

**Live Demo:** [Railway Deployment](https://limat-registration.railway.app) | **Repository:** [GitHub](https://github.com/ZenMaestro/limat-registration)

---

## 📋 Table of Contents
- [Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [User Flows](#-user-flows)
- [Deployment](#-deployment)
- [Security](#-security-features)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Key Features

✅ **Role-Based Access Control** - Admin and Student roles with permission middleware  
✅ **Student Details Display** - Beautiful gradient card showing college ID, name, email, status, and member-since date  
✅ **Lecturer Selection** - One lecturer per course with real-time slot availability  
✅ **Slot Limiting** - Max 60 students per lecturer with automatic tracking  
✅ **Registration Lock** - Permanent lock after final submission prevents unauthorized changes  
✅ **Real-time Updates** - Instant slot availability and registration status updates  
✅ **Progress Tracking** - Visual progress bar shows X/Y courses completed  
✅ **Admin Dashboard** - Full management panel for students, courses, lecturers, and registrations  
✅ **JWT Authentication** - Secure token-based auth with 24-hour expiry  
✅ **Production-Ready** - GitHub Actions CI/CD, environment templates, comprehensive deployment guides  

---

## 💻 Tech Stack

### Backend
- **Runtime:** Node.js 20.x (LTS)
- **Framework:** Express.js 4.x
- **Database:** MySQL 8.0
- **Authentication:** JWT (jsonwebtoken) with Bcryptjs password hashing
- **Port:** 5000

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern gradients, flexbox, animations
- **JavaScript (Vanilla)** - No build step required
- **Fetch API** - Async HTTP requests with Bearer token auth
- **LocalStorage** - Token and user data persistence
- **Port:** 8000

### DevOps & Deployment
- **CI/CD:** GitHub Actions (auto-deploy on git push)
- **Deployment Platforms:** Railway.app (recommended), Azure App Service, Heroku
- **Version Control:** Git with semantic commits
- **Environment Management:** dotenv (.env.example template provided)

---

## 📁 Project Structure

```
LIMAT sem/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD pipeline
│
├── backend/                        # Node.js Express server
│   ├── config/
│   │   ├── database.js             # MySQL connection pool
│   │   └── schema.sql              # Database schema (MySQL 8.0)
│   ├── controllers/
│   │   ├── authController.js       # Login & JWT token generation
│   │   ├── studentController.js    # Student operations (getStudentDetails, register, etc.)
│   │   ├── adminController.js      # Admin operations
│   │   └── courseController.js     # Course & lecturer management
│   ├── routes/
│   │   ├── auth.js                 # POST /api/auth/* endpoints
│   │   ├── student.js              # GET/POST /api/student/* endpoints
│   │   ├── admin.js                # POST/GET/PUT /api/admin/* endpoints
│   │   └── course.js               # GET /api/course/* endpoints
│   ├── middleware/
│   │   └── auth.js                 # authMiddleware, studentMiddleware, adminMiddleware, authorize()
│   ├── server.js                   # Express app setup & port listener
│   ├── package.json                # Dependencies (express, mysql2, bcryptjs, jsonwebtoken)
│   └── .env                        # Environment variables (git-ignored)
│
├── frontend/                       # HTML/CSS/JS client
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css           # Global styles, gradients, animations
│   │   └── js/
│   │       └── auth.js             # JWT handling, API request wrapper
│   ├── student/
│   │   ├── dashboard.html          # Student registration UI with details card
│   │   └── success.html            # Submission confirmation page
│   ├── admin/
│   │   └── dashboard.html          # Admin management interface
│   ├── index.html                  # Login page (redirects to dashboard if token exists)
│   └── 404.html                    # Not found page
│
├── DEPLOYMENT_GUIDE.md             # 80KB comprehensive deployment guide (all platforms)
├── DEPLOYMENT_QUICK_START.md       # 15KB Railway setup (5-minute quick start)
├── DEPLOYMENT_CHECKLIST.md         # Pre/post-deployment verification
├── DEPLOYMENT_SUMMARY.md           # Architecture & auto-deploy workflow overview
├── DEPLOYMENT_QUICK_REFERENCE.md   # Visual reference with flow diagrams
├── AUTH_MIDDLEWARE_GUIDE.md        # Complete authentication documentation
├── .env.example                    # Environment variables template
├── .gitignore                      # Security configuration
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20.x or higher ([Download](https://nodejs.org))
- **MySQL** 8.0 or higher ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com))
- Internet browser (Chrome, Firefox, Safari, Edge)

### Local Development (5 minutes)

#### 1. Clone Repository
```bash
git clone https://github.com/ZenMaestro/limat-registration.git
cd "LIMAT sem"
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create MySQL database:
```bash
# Using MySQL CLI
mysql -u root -p
# Then in MySQL prompt:
CREATE DATABASE limat_registration;
exit

# Import schema
mysql -u root -p limat_registration < config/schema.sql
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=limat_registration
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=change_this_in_production_use_long_random_string
NODE_ENV=development
```

Start server:
```bash
npm start
```

Expected output:
```
Server running on port 5000
Database connected successfully
```

#### 3. Frontend Setup

Open new terminal:
```bash
cd frontend
# Option A: Python (recommended)
python -m http.server 8000

# Option B: Node.js
npx http-server . -p 8000
```

#### 4. Access Application

Open browser: **http://localhost:8000**

**Default Credentials:**
- **Admin:** email: `admin@limat.edu` | password: `admin123`
- **Student:** college_id: `2024001` | password: `student123` (add via database first)

---

## 📊 Database Schema

### Core Tables

#### `students` Table
```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL (bcrypted),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(100),
  is_allowed BOOLEAN DEFAULT FALSE,
  is_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `courses` Table
```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  credit_hours INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `lecturers` Table
```sql
CREATE TABLE lecturers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lecturer_name VARCHAR(255) NOT NULL,
  course_id INT NOT NULL,
  max_slots INT DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

#### `registrations` Table
```sql
CREATE TABLE registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
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

#### `admins` Table
```sql
CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL (bcrypted),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📋 API Endpoints

### Authentication Routes
```
POST   /api/auth/student-login         # Returns JWT token + student info
POST   /api/auth/admin-login           # Returns JWT token + admin info
```

### Student Routes (requires authMiddleware + studentMiddleware)
```
GET    /api/student/details            # Get student profile (college_id, name, email, status)
GET    /api/student/dashboard          # Get all courses + registration progress
GET    /api/student/registered-courses # Get student's course registrations
POST   /api/student/register-course    # Register student for course with lecturer
POST   /api/student/submit-registration # Lock registration permanently
GET    /api/student/registration-status # Check if submitted
```

### Admin Routes (requires authMiddleware + adminMiddleware)
```
POST   /api/admin/add-student          # Create new student record
GET    /api/admin/students             # List all students with pagination
PUT    /api/admin/student/:studentId/allow   # Allow/deny student registration
POST   /api/admin/add-course           # Create new course
POST   /api/admin/add-lecturer         # Create lecturer for course
GET    /api/admin/registrations       # Get all registrations, filterable by status
GET    /api/admin/dashboard-stats     # Get stats (total students, courses, registrations)
```

### Course Routes (public, no auth required)
```
GET    /api/course/all                # Get all courses with lecturer info
GET    /api/course/:courseId          # Get single course details
GET    /api/course/:courseId/lecturers # Get lecturers for course with slot counts
```

**Response Format (JSON):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

---

## 🎯 User Flows

### Student Registration Flow
1. **Login:** Enter college_id and password
2. **Check Permission:** System verifies `is_allowed = true`
3. **View Dashboard:** See all courses with lecturer options
4. **Select Lecturers:** Choose one lecturer per course (see real-time slot availability)
5. **Register:** Click register for selected courses
6. **Submit:** Final submission locks registration permanently
7. **Confirmation:** Success page shows registered courses

### Admin Management Flow
1. **Login:** Use email and password credentials
2. **Dashboard:** View system statistics, student count, registration status
3. **Student Management:** Add new students, allow/block registrations
4. **Course Management:** Create courses and assign lecturers
5. **Reporting:** View detailed registrations, slot usage, completion metrics
6. **Export:** Download registration data for records

---

## 🚀 Deployment

### Cloud Deployment Options

#### **Option 1: Railway.app (Recommended) ⭐**
**Time: ~5 minutes | Cost: Free tier or $5/month**

1. Go to https://railway.app
2. Sign up with GitHub, authorize repo access
3. Create new project → "Deploy from GitHub"
4. Select `ZenMaestro/limat-registration` repository
5. Set environment variables (DB_HOST, DB_PASSWORD, JWT_SECRET)
6. Deploy button → auto-build and deploy (2-5 minutes)
7. Access at `https://limat-registration-xxxx.railway.app`

**Details:** See [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)

#### **Option 2: Azure App Service**
**Time: ~10 minutes | Cost: Free tier available**

1. Create resource group and App Service in Azure Portal
2. Configure MySQL Database for Azure
3. Set environment variables in App Service settings
4. Deploy via `az webapp deployment source config-zip`
5. Access at `https://limat-registration.azurewebsites.net`

**Details:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

#### **Option 3: Heroku / DigitalOcean / Other**

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for step-by-step instructions for all platforms.

### Automatic Deployment (GitHub Actions)
Every time you `git push` to main branch:
1. GitHub Actions runs tests and linting
2. Builds Node.js application
3. Auto-deploys to Railway/Azure
4. Deployment completes in 1-5 minutes
5. Your changes are **live immediately**

**See:** [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)

### Pre-Deployment Checklist
```bash
# Before deploying, verify:
1. All API endpoints tested locally
2. JWT_SECRET is strong and random
3. Database schema imported in production
4. Environment variables configured
5. Student/admin test accounts created
6. CORS settings updated for production domain
```

**Full checklist:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens:** 24-hour expiry, refreshable
- **Password Hashing:** Bcryptjs with salt rounds = 10
- **Role-Based Access:** Student, Admin roles with generic `authorize(roles)` middleware
- **Token Storage:** LocalStorage in frontend (consider moving to secure httpOnly cookie for production)

### Data Protection
- **SQL Injection Prevention:** Parameterized queries using mysql2/promise
- **CORS Policy:** Configured for frontend domains only
- **Rate Limiting:** Can be added via express-rate-limit (recommended for production)
- **Registration Lock:** Prevents modification after submission
- **HTTPS Only:** Enforce in production environment

### Best Practices Implemented
- `.gitignore` protects `.env` files and sensitive data
- `.env.example` provides template without secrets
- Middleware authentication on all protected routes
- Error messages don't expose database structure
- Bcryptjs for password hashing (never plain text)

**Read more:** [AUTH_MIDDLEWARE_GUIDE.md](AUTH_MIDDLEWARE_GUIDE.md)

---

## 🛠️ Troubleshooting

### Server Issues

**Q: "Cannot find module 'express'"**
```bash
# Solution: Install dependencies
cd backend
npm install
```

**Q: "Error: connect ECONNREFUSED 127.0.0.1:3306"**
```bash
# Solution: MySQL not running or credentials wrong
# Start MySQL service and check .env DB credentials
mysql -u root -p  # Test connection
echo "DB_HOST=localhost, DB_USER=root, DB_PASSWORD=???"
```

**Q: "Server running but getting 404 errors"**
```bash
# Solution: Kill old process and restart
taskkill /F /IM node.exe  (Windows)
# or
killall node  (Mac/Linux)

npm start
```

### Frontend Issues

**Q: "Failed to fetch from /api/student/dashboard"**
```bash
# Solutions:
1. Verify backend running on http://localhost:5000
2. Check JWT token exists in localStorage
3. Verify CORS is enabled in backend
4. Check browser console for error details
```

**Q: "Please login error on dashboard"**
```bash
# Solution: Token expired or missing
# Clear localStorage and login again
localStorage.clear()
```

### Database Issues

**Q: "Column 'is_allowed' doesn't exist"**
```bash
# Solution: Schema not imported correctly
mysql -u root -p limat_registration < backend/config/schema.sql
```

**Q: "UNIQUE constraint fails on college_id"**
```bash
# Solution: Student record already exists with that college_id
# Use different college_id or delete duplicate:
mysql -u root -p limat_registration
DELETE FROM students WHERE college_id='2024001';
exit
```

### Deployment Issues

**Q: "Build failed on railway"**
- Check GitHub Actions logs for error details
- Verify environment variables set in Railway dashboard
- Ensure `.env.example` contains all required variables
- Check Node.js version compatibility

**Q: "Database connection fails in production"**
- Verify MySQL database created on Railway/Azure
- Check DB credentials match in environment variables
- Ensure firewall allows database port (3306)
- Run `mysql -h <host> -u <user> -p` to test

---

## 📚 Documentation

Comprehensive guides for advanced usage:

| Document | Purpose | Length |
|----------|---------|--------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | All deployment platforms (Railway, Azure, Heroku, etc.) | 80KB |
| [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) | Quick Railway setup in 5 minutes | 15KB |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre/post-deployment verification | 20KB |
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | Architecture & CI/CD overview | 25KB |
| [AUTH_MIDDLEWARE_GUIDE.md](AUTH_MIDDLEWARE_GUIDE.md) | Authentication & authorization details | 30KB |

---

## 👥 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following existing code style
4. Test locally: `npm test`
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

---

## 📝 Version History

- **v1.0.0** (Current)
  - ✅ Student registration system complete
  - ✅ Admin management dashboard
  - ✅ JWT authentication with role-based access
  - ✅ GitHub Actions CI/CD pipeline
  - ✅ Multi-platform deployment guides
  - ✅ Student details display with beautiful UI
  - ✅ Real-time slot tracking

---

## 📄 License

This project is for educational purposes. LIMAT Registration System © 2024

---

## 🤝 Support & Contact

For issues, questions, or suggestions:
1. Check [Troubleshooting](#-troubleshooting) section above
2. Review relevant documentation file (see [Documentation](#-documentation) table)
3. Check GitHub Issues for existing solutions
4. Review code comments in relevant controller/route file

---

**Built with ❤️ for LIMAT Semester Registration | Start deployment at [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)**
