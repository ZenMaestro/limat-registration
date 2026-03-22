// This file will contain all the JavaScript logic for the admin dashboard.
document.addEventListener('DOMContentLoaded', () => {
  console.log('Admin Dashboard DOM loaded');

  // Check if user is an admin, otherwise redirect
  const user = getUser();
  if (!user || !user.is_admin) {
    // showError('Access denied. You are not an admin.');
    // setTimeout(() => {
    //   window.location.href = '/index.html';
    // }, 2000);
    // return;
  }

  // --- MODAL CONTROLS ---
  window.openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  };

  window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  };

  // Close modal if clicked outside of it
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target.id);
    }
  });


  // --- TAB SWITCHING ---
  window.switchTab = (tabName) => {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.borderBottom = '3px solid transparent';
      btn.style.color = '#6b7280';
    });

    // Show the selected tab content
    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
      selectedTab.style.display = 'block';
    }

    // Activate the selected tab button
    const selectedBtn = document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('active');
      selectedBtn.style.borderBottom = '3px solid var(--primary)';
      selectedBtn.style.color = 'var(--primary)';
    }

    // Load data for the selected tab
    if (tabName === 'students') loadStudents();
    else if (tabName === 'courses') loadCourses();
    else if (tabName === 'lecturers') loadLecturers();
    else if (tabName === 'registrations') loadRegistrations();
  };


  // --- DATA LOADING FUNCTIONS ---

  // Load dashboard stats
  async function loadStats() {
    try {
      const stats = await apiRequest('/admin/dashboard-stats');
      const statsGrid = document.getElementById('statsGrid');
      statsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-number">${stats.total_students}</div>
          <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.allowed_students}</div>
          <div class="stat-label">Allowed Students</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.submitted_students}</div>
          <div class="stat-label">Submitted Registration</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.total_courses}</div>
          <div class="stat-label">Total Courses</div>
        </div>
      `;
    } catch (error) {
      showError(error.message);
      const statsGrid = document.getElementById('statsGrid');
      statsGrid.innerHTML = `<p class="error-text">Could not load stats.</p>`;
    }
  }

  // Load students
  async function loadStudents() {
    try {
      const students = await apiRequest('/admin/students');
      const studentsList = document.getElementById('studentsList');
      if (students.length === 0) {
        studentsList.innerHTML = '<p>No students found.</p>';
        return;
      }
      const table = document.createElement('table');
      table.className = 'table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>College ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Registered Courses</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(student => `
            <tr>
              <td>${student.college_id}</td>
              <td>${student.first_name} ${student.last_name}</td>
              <td><span class="badge badge-primary">${student.department || '-'}</span></td>
              <td>${student.registered_courses}</td>
              <td>
                ${student.is_allowed ? '<span class="badge badge-success">Allowed</span>' : '<span class="badge badge-warning">Blocked</span>'}
                ${student.is_submitted ? '<span class="badge badge-success">Submitted</span>' : '<span class="badge badge-danger">Pending</span>'}
              </td>
              <td>
                <button class="btn btn-sm ${student.is_allowed ? 'btn-danger' : 'btn-success'}" onclick="toggleStudent(${student.id}, ${!student.is_allowed})">
                  ${student.is_allowed ? 'Block' : 'Allow'}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      `;
      studentsList.innerHTML = '';
      studentsList.appendChild(table);
    } catch (error) {
      showError(error.message);
      document.getElementById('studentsList').innerHTML = '<p class="error-text">Could not load students.</p>';
    }
  }
  
  window.toggleStudent = async (studentId, is_allowed) => {
      try {
          await apiRequest(`/admin/students/${studentId}/toggle-allow`, 'PUT', { is_allowed });
          showSuccess(`Student has been ${is_allowed ? 'allowed' : 'blocked'}.`);
          loadStudents();
      } catch (error) {
          showError(error.message);
      }
  };

  // Load courses
  async function loadCourses() {
    try {
      const courses = await apiRequest('/admin/courses');
      const coursesList = document.getElementById('coursesList');
       if (courses.length === 0) {
        coursesList.innerHTML = '<p>No courses found.</p>';
        return;
      }
      const table = document.createElement('table');
      table.className = 'table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map(course => `
            <tr>
              <td><strong>${course.course_code}</strong></td>
              <td>${course.course_name}</td>
              <td>${course.credits || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      coursesList.innerHTML = '';
      coursesList.appendChild(table);
    } catch (error) {
      showError(error.message);
    }
  }

  // Load lecturers
  async function loadLecturers() {
    try {
      const lecturers = await apiRequest('/admin/lecturers');
      const lecturersList = document.getElementById('lecturersList');
      if (lecturers.length === 0) {
        lecturersList.innerHTML = '<p>No lecturers found.</p>';
        return;
      }
      const table = document.createElement('table');
      table.className = 'table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Name</th>
            <th>Course</th>
            <th>Max Slots</th>
          </tr>
        </thead>
        <tbody>
          ${lecturers.map(lecturer => `
            <tr>
              <td>${lecturer.lecturer_name}</td>
              <td><strong>${lecturer.course_code}</strong><br><small>${lecturer.course_name}</small></td>
              <td>${lecturer.max_slots}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      lecturersList.innerHTML = '';
      lecturersList.appendChild(table);
    } catch (error) {
      showError(error.message);
      document.getElementById('lecturersList').innerHTML = '<p class="error-text">Could not load lecturers.</p>';
    }
  }

  // Load registrations
  async function loadRegistrations() {
    try {
      const registrations = await apiRequest('/admin/registrations');
      const registrationsList = document.getElementById('registrationsList');
       if (registrations.length === 0) {
        registrationsList.innerHTML = '<p>No registrations found.</p>';
        return;
      }
      const table = document.createElement('table');
      table.className = 'table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Course</th>
            <th>Lecturer</th>
          </tr>
        </thead>
        <tbody>
          ${registrations.map(reg => `
            <tr>
              <td>${reg.college_id}</td>
              <td>${reg.first_name} ${reg.last_name}</td>
              <td><strong>${reg.course_code}</strong><br><small>${reg.course_name}</small></td>
              <td>${reg.lecturer_name}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      registrationsList.innerHTML = '';
      registrationsList.appendChild(table);
    } catch (error) {
      showError(error.message);
    }
  }


  // --- FORM SUBMISSION HANDLERS ---
  document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/add-student', 'POST', {
        college_id: document.getElementById('addStudent_collegeId').value,
        department: document.getElementById('addStudent_department').value,
        password: document.getElementById('addStudent_password').value,
        first_name: document.getElementById('addStudent_firstName').value,
        last_name: document.getElementById('addStudent_lastName').value,
        email: document.getElementById('addStudent_email').value
      });
      showSuccess('Student added successfully!');
      closeModal('addStudentModal');
      document.getElementById('addStudentForm').reset();
      loadStudents();
    } catch (error) {
      showError(error.message);
    }
  });

  document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/add-course', 'POST', {
        course_code: document.getElementById('courseCode').value,
        course_name: document.getElementById('courseName').value,
        credits: parseInt(document.getElementById('credits').value)
      });
      showSuccess('Course added successfully!');
      closeModal('addCourseModal');
      document.getElementById('addCourseForm').reset();
      loadCourses();
    } catch (error) {
      showError(error.message);
    }
  });

  document.getElementById('addLecturerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const courseId = document.getElementById('lecturerCourse').value;
      if (!courseId) {
          showError('Please select a course for the lecturer.');
          return;
      }
      await apiRequest('/admin/add-lecturer', 'POST', {
        lecturer_name: document.getElementById('lecturerName').value,
        course_id: parseInt(courseId),
        max_slots: parseInt(document.getElementById('maxSlots').value)
      });
      showSuccess('Lecturer added successfully!');
      closeModal('addLecturerModal');
      document.getElementById('addLecturerForm').reset();
      loadLecturers();
    } catch (error) {
      showError(error.message);
    }
  });
  
  // Populate courses in add lecturer dropdown
  apiRequest('/admin/courses').then(courses => {
      const select = document.getElementById('courseSelect');
      select.innerHTML = '<option value="" disabled selected>Select a course</option>';
      courses.forEach(course => {
          const option = document.createElement('option');
          option.value = course.id;
          option.textContent = `${course.course_name} (${course.course_code})`;
          select.appendChild(option);
      });
  });


  // --- INITIAL DATA LOAD ---
  loadStats();
  loadStudents(); // Load the default tab's data
});
