/**
 * Analytics & Reporting Service
 * Provides comprehensive statistics and reporting for admins
 */
const db = require('../database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Get overall registration statistics
 */
async function getRegistrationStats() {
  try {
    const queries = {
      totalStudents: `SELECT COUNT(*) as count FROM students`,
      totalRegistrations: `SELECT COUNT(*) as count FROM registrations`,
      submittedRegistrations: `SELECT COUNT(DISTINCT student_id) as count FROM registrations`,
      totalCourses: `SELECT COUNT(*) as count FROM courses`,
      totalLecturers: `SELECT COUNT(*) as count FROM lecturers`,
      averageCredits: `SELECT AVG(r.credit_count) as avg FROM (SELECT student_id, SUM(c.credits) as credit_count FROM registrations r JOIN courses c ON r.course_id = c.id GROUP BY r.student_id) r`
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const [result] = await db.query(query);
      stats[key] = result.count || result.avg || 0;
    }

    return stats;
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    throw error;
  }
}

/**
 * Get course-wise fill rate analysis
 */
async function getCourseAnalytics() {
  try {
    const query = `
      SELECT 
        c.id,
        c.course_code,
        c.course_name,
        c.credits,
        COUNT(DISTINCT l.id) as lecturer_count,
        SUM(l.max_slots) as total_slots,
        COUNT(DISTINCT r.id) as filled_slots,
        ROUND((COUNT(DISTINCT r.id) / SUM(l.max_slots)) * 100, 2) as fill_percentage,
        COUNT(DISTINCT r.student_id) as unique_students
      FROM courses c
      LEFT JOIN lecturers l ON c.id = l.course_id
      LEFT JOIN registrations r ON c.id = r.course_id
      GROUP BY c.id, c.course_code, c.course_name, c.credits
      ORDER BY fill_percentage DESC
    `;
    return await db.query(query);
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
}

/**
 * Get lecturer-wise registration data
 */
async function getLecturerAnalytics() {
  try {
    const query = `
      SELECT 
        l.id,
        l.lecturer_name,
        c.course_code,
        c.course_name,
        l.max_slots,
        COUNT(r.id) as current_registrations,
        (l.max_slots - COUNT(r.id)) as available_slots,
        ROUND((COUNT(r.id) / l.max_slots) * 100, 2) as fill_percentage
      FROM lecturers l
      JOIN courses c ON l.course_id = c.id
      LEFT JOIN registrations r ON l.id = r.lecturer_id
      GROUP BY l.id, l.lecturer_name, c.course_code, c.course_name, l.max_slots
      ORDER BY c.course_code, fill_percentage DESC
    `;
    return await db.query(query);
  } catch (error) {
    console.error('Error fetching lecturer analytics:', error);
    throw error;
  }
}

/**
 * Get student registration details
 */
async function getStudentRegistrations(studentId = null) {
  try {
    let query = `
      SELECT 
        s.id as student_id,
        s.college_id,
        s.first_name,
        s.last_name,
        s.email,
        COUNT(DISTINCT r.course_id) as course_count,
        SUM(c.credits) as total_credits,
        s.is_submitted,
        MAX(r.registration_date) as last_registered
      FROM students s
      LEFT JOIN registrations r ON s.id = r.student_id
      LEFT JOIN courses c ON r.course_id = c.id
    `;

    if (studentId) {
      query += ` WHERE s.id = ?`;
      const results = await db.query(query, [studentId]);
      return results;
    } else {
      query += ` GROUP BY s.id
                ORDER BY s.college_id`;
      return await db.query(query);
    }
  } catch (error) {
    console.error('Error fetching student registrations:', error);
    throw error;
  }
}

/**
 * Get detailed registration data for a specific student
 */
async function getStudentDetailedRegistrations(studentId) {
  try {
    const query = `
      SELECT 
        s.college_id,
        s.first_name,
        s.last_name,
        c.course_code,
        c.course_name,
        c.credits,
        l.lecturer_name,
        r.registration_date
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN courses c ON r.course_id = c.id
      JOIN lecturers l ON r.lecturer_id = l.id
      WHERE r.student_id = ?
      ORDER BY c.course_code
    `;
    return await db.query(query, [studentId]);
  } catch (error) {
    console.error('Error fetching detailed student registrations:', error);
    throw error;
  }
}

/**
 * Export registration data to Excel
 */
async function exportToExcel(filename = 'registration_report.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Overview Statistics
    const overviewSheet = workbook.addWorksheet('Overview');
    const stats = await getRegistrationStats();
    overviewSheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    Object.entries(stats).forEach(([key, value]) => {
      overviewSheet.addRow({ metric: key, value });
    });

    // Sheet 2: Course Analytics
    const courseSheet = workbook.addWorksheet('Courses');
    const courseData = await getCourseAnalytics();
    courseSheet.columns = [
      { header: 'Course Code', key: 'course_code', width: 15 },
      { header: 'Course Name', key: 'course_name', width: 25 },
      { header: 'Credits', key: 'credits', width: 10 },
      { header: 'Instructors', key: 'lecturer_count', width: 12 },
      { header: 'Total Slots', key: 'total_slots', width: 12 },
      { header: 'Filled Slots', key: 'filled_slots', width: 12 },
      { header: 'Fill %', key: 'fill_percentage', width: 10 }
    ];
    courseData.forEach(row => courseSheet.addRow(row));

    // Sheet 3: Lecturer Details
    const lecturerSheet = workbook.addWorksheet('Lecturers');
    const lecturerData = await getLecturerAnalytics();
    lecturerSheet.columns = [
      { header: 'Lecturer Name', key: 'lecturer_name', width: 20 },
      { header: 'Course Code', key: 'course_code', width: 15 },
      { header: 'Max Slots', key: 'max_slots', width: 12 },
      { header: 'Registered', key: 'current_registrations', width: 12 },
      { header: 'Available', key: 'available_slots', width: 12 },
      { header: 'Fill %', key: 'fill_percentage', width: 10 }
    ];
    lecturerData.forEach(row => lecturerSheet.addRow(row));

    // Sheet 4: Student Summary
    const studentSheet = workbook.addWorksheet('Students');
    const studentData = await getStudentRegistrations();
    studentSheet.columns = [
      { header: 'College ID', key: 'college_id', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Courses', key: 'course_count', width: 10 },
      { header: 'Credits', key: 'total_credits', width: 10 },
      { header: 'Submitted', key: 'is_submitted', width: 10 }
    ];
    studentData.forEach(row => {
      studentSheet.addRow({
        college_id: row.college_id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        course_count: row.course_count || 0,
        total_credits: row.total_credits || 0,
        is_submitted: row.is_submitted ? 'Yes' : 'No'
      });
    });

    // Save file
    const filepath = path.join(__dirname, '../../reports', filename);
    await workbook.xlsx.writeFile(filepath);
    
    console.log(`✅ Excel report exported: ${filepath}`);
    return { success: true, filepath, filename };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Export registration data to PDF
 */
async function exportToPDF(filename = 'registration_report.pdf') {
  try {
    const doc = new PDFDocument();
    const filepath = path.join(__dirname, '../../reports', filename);

    // Create reports directory if it doesn't exist
    const reportsDir = path.dirname(filepath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('LIMAT Registration Report', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Statistics
    doc.fontSize(16).font('Helvetica-Bold').text('Registration Statistics');
    const stats = await getRegistrationStats();
    Object.entries(stats).forEach(([key, value]) => {
      doc.fontSize(11).text(`${key}: ${value}`);
    });
    doc.moveDown();

    // Course Analytics
    doc.fontSize(16).font('Helvetica-Bold').text('Course Fill Rate Analysis');
    const courseData = await getCourseAnalytics();
    
    doc.fontSize(10).text('Course Code | Course Name | Fill % | Registered');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    courseData.slice(0, 10).forEach(course => {
      doc.fontSize(9).text(
        `${course.course_code} | ${course.course_name.substring(0, 20)} | ${course.fill_percentage}% | ${course.filled_slots}`
      );
    });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(`✅ PDF report exported: ${filepath}`);
        resolve({ success: true, filepath, filename });
      });
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Search students with filters
 */
async function searchStudents(filters = {}) {
  try {
    let query = `
      SELECT 
        s.id,
        s.college_id,
        s.first_name,
        s.last_name,
        s.email,
        COUNT(DISTINCT r.course_id) as course_count,
        SUM(c.credits) as total_credits,
        s.is_allowed,
        s.is_submitted
      FROM students s
      LEFT JOIN registrations r ON s.id = r.student_id
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.collegeId) {
      query += ` AND s.college_id LIKE ?`;
      params.push(`%${filters.collegeId}%`);
    }

    if (filters.name) {
      query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ?)`;
      params.push(`%${filters.name}%`, `%${filters.name}%`);
    }

    if (filters.email) {
      query += ` AND s.email LIKE ?`;
      params.push(`%${filters.email}%`);
    }

    if (filters.isAllowed !== undefined) {
      query += ` AND s.is_allowed = ?`;
      params.push(filters.isAllowed);
    }

    if (filters.isSubmitted !== undefined) {
      query += ` AND s.is_submitted = ?`;
      params.push(filters.isSubmitted);
    }

    query += ` GROUP BY s.id ORDER BY s.college_id LIMIT 100`;

    return await db.query(query, params);
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
}

module.exports = {
  getRegistrationStats,
  getCourseAnalytics,
  getLecturerAnalytics,
  getStudentRegistrations,
  getStudentDetailedRegistrations,
  exportToExcel,
  exportToPDF,
  searchStudents
};
