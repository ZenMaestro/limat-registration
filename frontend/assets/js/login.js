// This file will contain all the JavaScript logic for the login page.
document.addEventListener('DOMContentLoaded', () => {
  console.log('Login page DOM loaded, attaching form handlers');

  // Student Login Form Handler
  const studentForm = document.getElementById('studentLoginForm');
  if (studentForm) {
    console.log('Student form found, attaching handler');
    studentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Student form submitted');
      try {
        const college_id = document.getElementById('collegeId').value;
        const password = document.getElementById('password').value;

        const data = await apiRequest('/auth/student-login', 'POST', {
          college_id,
          password
        });

        setToken(data.token);
        setUser(data.student);
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/student/dashboard.html';
        }, 1500);
      } catch (error) {
        showError(error.message);
      }
    });
  } else {
    console.log('Student form NOT found');
  }

  // Admin Login Form Handler
  const adminForm = document.getElementById('adminLoginForm');
  if (adminForm) {
    console.log('Admin form found, attaching handler');
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Admin form submitted');
      try {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        console.log('Attempting login with:', { email });

        const data = await apiRequest('/auth/admin-login', 'POST', {
          email,
          password
        });

        setToken(data.token);
        setUser(data.admin);
        showSuccess('Admin login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/admin/dashboard.html';
        }, 1500);
      } catch (error) {
        console.error('Admin Login error:', error);
        console.error('Error message:', error.message);
        showError(`Admin Login Error: ${error.message}`);
      }
    });
  } else {
    console.log('Admin form NOT found');
  }
});
