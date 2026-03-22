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
