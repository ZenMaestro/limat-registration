const API_BASE = '/api';

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Set token to localStorage
function setToken(token) {
  localStorage.setItem('token', token);
}

// Clear token
function clearToken() {
  localStorage.removeItem('token');
}

// Get user from localStorage
function getUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

// Set user to localStorage
function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Clear user
function clearUser() {
  localStorage.removeItem('user');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Make API request
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Show error alert
function showError(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger';
  alertDiv.textContent = message;
  document.body.insertBefore(alertDiv, document.body.firstChild);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Show success alert
function showSuccess(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success';
  alertDiv.textContent = message;
  document.body.insertBefore(alertDiv, document.body.firstChild);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Logout
function logout() {
  clearToken();
  clearUser();
  window.location.href = '/index.html';
}

// Initialize form handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, attaching form handlers');
  console.log('Document body HTML:', document.body.innerHTML.substring(0, 200));
  console.log('All forms on page:', document.querySelectorAll('form').length);
  
  // Debug: list all form IDs
  document.querySelectorAll('form').forEach(form => {
    console.log('Found form:', form.id);
  });

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
        console.error('Login error:', error);
        showError(error.message);
      }
    });
  } else {
    console.log('Admin form NOT found');
  }
});
