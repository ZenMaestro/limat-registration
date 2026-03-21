/**
 * Email Notification Service
 * Handles sending emails for registration confirmations, deadlines, and announcements
 */
const nodemailer = require('nodemailer');
const db = require('../database');

// Email service configuration - Update these with your SMTP settings
const EMAIL_CONFIG = {
  service: process.env.SMTP_SERVICE || 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// HTML Email Templates
const templates = {
  registrationConfirmation: (studentName, courses) => `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
          <div style="border-bottom: 3px solid #FF6B35; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #FF6B35; margin: 0;">Registration Confirmed! ✅</h2>
          </div>
          
          <p>Hi <strong>${studentName}</strong>,</p>
          
          <p>Your semester course registration has been successfully submitted and confirmed.</p>
          
          <h3 style="color: #2C3E50;">Your Registered Courses:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #FF6B35; color: white;">
              <th style="padding: 10px; text-align: left;">Course Code</th>
              <th style="padding: 10px; text-align: left;">Course Name</th>
              <th style="padding: 10px; text-align: left;">Lecturer</th>
              <th style="padding: 10px; text-align: left;">Credits</th>
            </tr>
            ${courses.map(c => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${c.course_code}</td>
                <td style="padding: 10px;">${c.course_name}</td>
                <td style="padding: 10px;">${c.lecturer_name}</td>
                <td style="padding: 10px;">${c.credits}</td>
              </tr>
            `).join('')}
          </table>
          
          <p>Please download or print this confirmation for your records. No further action is required.</p>
          
          <div style="background-color: #FFF4F0; border-left: 4px solid #FF6B35; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #E85A1D;"><strong>⚠️ Important:</strong> Your registration is locked and cannot be modified.</p>
          </div>
          
          <p style="color: #6B7280; font-size: 0.9em;">
            If you have any questions, please contact the Academic Office at <strong>info@lingayas.com</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 0.9em; text-align: center;">
            © 2026 Lingaya's Group - LIMAT Registration System<br>
            <a href="https://lingayas.edu.in" style="color: #FF6B35;">Visit Our Website</a>
          </p>
        </div>
      </body>
    </html>
  `,

  courseDeadlineReminder: (studentName, deadline) => `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
          <div style="border-bottom: 3px solid #F39C12; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #F39C12; margin: 0;">Course Registration Deadline ⏰</h2>
          </div>
          
          <p>Hi <strong>${studentName}</strong>,</p>
          
          <p>This is a reminder that the course registration deadline is approaching.</p>
          
          <div style="background-color: #FEF3C7; border-left: 4px solid #F39C12; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 1.1em; color: #78350F;"><strong>Deadline: ${deadline}</strong></p>
          </div>
          
          <p>Please complete your course registration before the deadline to secure your slot in preferred courses.</p>
          
          <a href="http://localhost:8000/student/dashboard.html" style="display: inline-block; background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Complete Registration
          </a>
          
          <p style="color: #6B7280; font-size: 0.9em;">
            If you have any questions, please contact the Academic Office at <strong>info@lingayas.com</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 0.9em; text-align: center;">
            © 2026 Lingaya's Group - LIMAT Registration System
          </p>
        </div>
      </body>
    </html>
  `,

  courseFull: (studentName, courseName) => `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
          <div style="border-bottom: 3px solid #E74C3C; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #E74C3C; margin: 0;">Course Slot Full ❌</h2>
          </div>
          
          <p>Hi <strong>${studentName}</strong>,</p>
          
          <p>Unfortunately, all slots for the following course are now full:</p>
          
          <div style="background-color: #FEE2E2; border-left: 4px solid #E74C3C; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 1.1em; color: #7F1D1D;"><strong>${courseName}</strong></p>
          </div>
          
          <p>Please choose an alternative course or check back later if a slot becomes available.</p>
          
          <a href="http://localhost:8000/student/dashboard.html" style="display: inline-block; background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Available Courses
          </a>
          
          <p style="color: #6B7280; font-size: 0.9em;">
            Contact support at <strong>info@lingayas.com</strong> for assistance.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 0.9em; text-align: center;">
            © 2026 Lingaya's Group - LIMAT Registration System
          </p>
        </div>
      </body>
    </html>
  `,

  announcement: (title, content) => `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
          <div style="border-bottom: 3px solid #27AE60; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #27AE60; margin: 0;">📢 ${title}</h2>
          </div>
          
          <div style="color: #2C3E50; line-height: 1.6;">
            ${content}
          </div>
          
          <div style="background-color: #DBEAFE; border-left: 4px solid #2563EB; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #0C2340;">Log in to your student portal to view more details and respond if necessary.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 0.9em; text-align: center;">
            © 2026 Lingaya's Group - LIMAT Registration System<br>
            <a href="https://lingayas.edu.in" style="color: #FF6B35;">Visit Our Website</a>
          </p>
        </div>
      </body>
    </html>
  `
};

/**
 * Send registration confirmation email
 */
async function sendRegistrationConfirmation(studentEmail, studentName, registrations) {
  try {
    // Build course details
    const courses = registrations.map(r => ({
      course_code: r.course_code,
      course_name: r.course_name,
      lecturer_name: r.lecturer_name,
      credits: r.credits
    }));

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@lingayas.com',
      to: studentEmail,
      subject: 'Registration Confirmed - LIMAT Semester Registration System',
      html: templates.registrationConfirmation(studentName, courses)
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log email in database
    await logEmail(studentEmail, 'student', 'Registration Confirmed', 'registration_confirmation', 'sent');
    
    console.log('✅ Registration confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending registration confirmation:', error);
    await logEmail(studentEmail, 'student', 'Registration Confirmed', 'registration_confirmation', 'failed', error.message);
    throw error;
  }
}

/**
 * Send course deadline reminder
 */
async function sendDeadlineReminder(studentEmail, studentName, deadline) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@lingayas.com',
      to: studentEmail,
      subject: 'Course Registration Deadline Reminder',
      html: templates.courseDeadlineReminder(studentName, deadline)
    };

    const info = await transporter.sendMail(mailOptions);
    
    await logEmail(studentEmail, 'student', 'Deadline Reminder', 'course_deadline', 'sent');
    
    console.log('✅ Deadline reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending deadline reminder:', error);
    await logEmail(studentEmail, 'student', 'Deadline Reminder', 'course_deadline', 'failed', error.message);
    throw error;
  }
}

/**
 * Send course full notification
 */
async function sendCourseFull(studentEmail, studentName, courseName) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@lingayas.com',
      to: studentEmail,
      subject: 'Course Slot Full - LIMAT Registration',
      html: templates.courseFull(studentName, courseName)
    };

    const info = await transporter.sendMail(mailOptions);
    
    await logEmail(studentEmail, 'student', 'Course Full', 'course_full', 'sent');
    
    console.log('✅ Course full notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending course full notification:', error);
    await logEmail(studentEmail, 'student', 'Course Full', 'course_full', 'failed', error.message);
    throw error;
  }
}

/**
 * Send announcement to all students
 */
async function sendAnnouncement(title, content, recipientEmails) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@lingayas.com',
      to: recipientEmails,
      subject: `📢 ${title} - LIMAT Announcement`,
      html: templates.announcement(title, content)
    };

    const info = await transporter.sendMail(mailOptions);
    
    await logEmail(recipientEmails.join(', '), 'student', title, 'announcement', 'sent');
    
    console.log('✅ Announcement email sent to', recipientEmails.length, 'recipients');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending announcement:', error);
    await logEmail(recipientEmails.join(', '), 'student', title, 'announcement', 'failed', error.message);
    throw error;
  }
}

/**
 * Test email configuration
 */
async function testEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email service is properly configured');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Log email in database for auditing
 */
async function logEmail(recipientEmail, recipientType, subject, emailType, status, errorMessage = null) {
  try {
    const query = `
      INSERT INTO email_logs (recipient_email, recipient_type, subject, email_type, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [recipientEmail, recipientType, subject, emailType, status, errorMessage]);
  } catch (error) {
    console.error('Error logging email:', error);
  }
}

module.exports = {
  sendRegistrationConfirmation,
  sendDeadlineReminder,
  sendCourseFull,
  sendAnnouncement,
  testEmailConfig
};
