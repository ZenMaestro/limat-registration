# ⚡ Quick Setup Guide

## Step-by-Step Installation

### 1. Create MySQL Database

Open MySQL terminal (mysql -u root -p) and run:

```sql
-- Create database
CREATE DATABASE limat_registration;

-- Use the database
USE limat_registration;

-- Run the schema to create all tables
-- (Copy and paste contents from: backend/config/schema.sql)
```

Or use a single command:
```bash
mysql -u root -p < backend/config/schema.sql
```

### 2. Setup Admin User (One-time)

```sql
INSERT INTO admins (email, password) VALUES (
  'admin@limat.edu',
  '$2a$10$your_bcrypt_hash_here'
);
```

**To generate bcrypt hash**, run this Node.js code in terminal:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10, (err, hash) => {
  console.log(hash);
});
```

Or use an online bcrypt generator.

### 3. Start Backend

```bash
cd backend
npm install
npm start
```

Output should show:
```
Server running on port 5000
Database connected successfully
```

### 4. Start Frontend

Open another terminal:

```bash
cd frontend
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx http-server -p 8000

# Option 3: Using VS Code
# Install "Live Server" extension and click "Go Live"
```

### 5. Access the System

Open browser and go to:
```
http://localhost:8000
```

---

## 🧪 Testing the System

### Test Admin Features

1. **Login as Admin**
   - Email: `admin@limat.edu`
   - Password: `admin123`

2. **Add a Course**
   - Courses tab → Add Course
   - Code: `CS101`
   - Name: `Introduction to Programming`

3. **Add Lecturers**
   - Lecturers tab → Add Lecturer
   - Select the course you just created
   - Add 2-3 lecturers

4. **Add Students**
   - Students tab → Add Student
   - College ID: `2024001`
   - Name: `John Doe`
   - Password: `student123`

5. **Allow Student**
   - Click "Block" → "Allow" button next to student

### Test Student Features

1. **Login as Student**
   - College ID: `2024001`
   - Password: `student123`

2. **Register Courses**
   - Click on course card
   - Select a lecturer
   - Repeat for all courses

3. **Submit Registration**
   - Click "Submit Registration"
   - Confirm in popup
   - You'll be redirected to success page

4. **Verify Lock**
   - Try to login again after submitting
   - You should see success page (read-only)

---

## 📦 Environment Variables

Edit `backend/.env`:

```env
PORT=5000                              # Server port
DB_HOST=localhost                      # PostgreSQL host
DB_PORT=5432                          # PostgreSQL port
DB_NAME=limat_registration             # Database name
DB_USER=postgres                       # PostgreSQL user
DB_PASSWORD=postgres                   # PostgreSQL password
JWT_SECRET=your_super_secret_key       # Change in production!
NODE_ENV=development                   # development or production
```

---

## 🐛 Common Issues & Solutions

### "Database connection error"
- PostgreSQL not running? Start it.
- Wrong credentials in .env? Update them.
- Database doesn't exist? Run schema.sql

### "Cannot GET /"
- Frontend server not running? Start with `python -m http.server 8000`
- Wrong port? Check http://localhost:8000

### "CORS error in browser console"
- Backend not running? Start with `npm start`
- Wrong API_BASE URL in `auth.js`? Should be `http://localhost:5000/api`

### "Invalid credentials" on login
- Student not added in database? Use admin panel to add.
- Student not allowed? Use admin panel to allow.
- Wrong password? Recreate student.

### "Cannot read property 'token' of undefined"
- Login failed? Check error message alert.
- Database records missing? Add them via admin panel.

---

## 📂 File Descriptions

| File | Purpose |
|------|---------|
| `server.js` | Main Express app, starts on port 5000 |
| `config/database.js` | PostgreSQL connection |
| `config/schema.sql` | Database tables & structure |
| `middleware/auth.js` | JWT token verification |
| `controllers/*` | Business logic for each feature |
| `routes/*` | API endpoint definitions |
| `index.html` | Login page (role selector) |
| `student/dashboard.html` | Course selection interface |
| `student/success.html` | Registration confirmation |
| `admin/dashboard.html` | Admin management panel |
| `assets/css/style.css` | All styling |
| `assets/js/auth.js` | API utility functions |

---

## 🚀 Next: Production Deployment

When ready to deploy:

1. **Security**
   - Change JWT_SECRET to strong random string
   - Use environment variables, not .env file
   - Enable HTTPS only

2. **Database**
   - Use managed PostgreSQL (AWS RDS, Heroku, DigitalOcean)
   - Setup backups
   - Monitor performance

3. **Frontend**
   - Build optimization (minify, bundle)
   - Deploy to CDN (Vercel, Netlify, AWS S3)
   - Enable caching

4. **Backend**
   - Deploy to cloud (Heroku, Railway, Render)
   - Setup error logging
   - Monitor API performance

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check backend terminal for logs
3. Review README.md for full documentation
4. Check database records if data is missing

---

**You're all set! Start with test data and explore the system.** 🎉
