-- LIMAT Semester Registration System - Schema Updates
-- Added features: Notifications, Announcements, Audit Logs

USE limat_registration;

-- ===== NOTIFICATIONS TABLE =====
-- Stores in-app notifications for students and admins
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_type ENUM('student', 'admin') NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'alert') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  related_course_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (related_course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_user (user_type, user_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
);

-- ===== ANNOUNCEMENTS TABLE =====
-- Stores admin broadcast announcements to all students or specific groups
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type ENUM('general', 'urgent', 'course_deadline', 'system_maintenance') DEFAULT 'general',
  target_audience ENUM('all_students', 'all_admins', 'admin_only') DEFAULT 'all_students',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  view_count INT DEFAULT 0,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_active (is_active),
  INDEX idx_created (created_at)
);

-- ===== EMAIL LOG TABLE =====
-- Stores email notification history for compliance and debugging
CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_type ENUM('student', 'admin') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  email_type ENUM('registration_confirmation', 'course_deadline', 'course_full', 'announcement', 'password_reset') NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
  error_message TEXT,
  related_student_id INT,
  related_course_id INT,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (related_student_id) REFERENCES students(id) ON DELETE SET NULL,
  FOREIGN KEY (related_course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_recipient (recipient_email),
  INDEX idx_status (status),
  INDEX idx_type (email_type)
);

-- ===== AUDIT LOG TABLE =====
-- Tracks all administrative actions and student registrations for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_type ENUM('student', 'admin') NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type ENUM('student', 'course', 'lecturer', 'registration', 'admin', 'announcement') NOT NULL,
  entity_id INT,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  status ENUM('success', 'failure') DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_type, user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);

-- ===== ANALYTICS VIEW =====
-- View for quick access to registration statistics
CREATE OR REPLACE VIEW registration_analytics AS
SELECT 
  c.id as course_id,
  c.course_code,
  c.course_name,
  c.credits,
  COUNT(DISTINCT r.id) as total_registrations,
  COUNT(DISTINCT l.id) as lecturer_count,
  SUM(l.max_slots) as total_slots,
  ROUND((COUNT(DISTINCT r.id) / SUM(l.max_slots)) * 100, 2) as fill_percentage,
  COUNT(DISTINCT r.student_id) as unique_students
FROM courses c
LEFT JOIN lecturers l ON c.id = l.course_id
LEFT JOIN registrations r ON c.id = r.course_id
GROUP BY c.id, c.course_code, c.course_name, c.credits;

-- ===== CREATE INDEXES FOR PERFORMANCE =====
-- Additional indexes for frequently queried columns
-- (These may already exist, safe to run multiple times)
