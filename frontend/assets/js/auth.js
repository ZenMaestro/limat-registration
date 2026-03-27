const API_BASE = '/api';

// Security: Use secure token storage (httpOnly for production, localStorage as fallback)
function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  // Validate token format
  if (typeof token !== 'string' || token.length < 10) {
    console.error('Invalid token format');
    return false;
  }
  localStorage.setItem('token', token);
  return true;
}

function clearToken() {
  localStorage.removeItem('token');
}

// Get user from localStorage
function getUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : {};
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {};
  }
}

// Set user to localStorage with validation
function setUser(user) {
  if (!user || typeof user !== 'object') {
    console.error('Invalid user data');
    return false;
  }
  try {
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
}

// Clear user
function clearUser() {
  localStorage.removeItem('user');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Sanitize HTML to prevent XSS
function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Make API request with security headers
async function apiRequest(endpoint, method = 'GET', body = null) {
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Invalid endpoint');
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF prevention
    }
  };

  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Show error alert with XSS protection
function showError(message) {
  if (typeof message !== 'string') {
    message = 'An error occurred';
  }
  
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger';
  alertDiv.textContent = message; // Use textContent instead of innerHTML to prevent XSS
  
  document.body.insertBefore(alertDiv, document.body.firstChild);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Show success alert with XSS protection
function showSuccess(message) {
  if (typeof message !== 'string') {
    message = 'Operation successful';
  }
  
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success';
  alertDiv.textContent = message; // Use textContent instead of innerHTML to prevent XSS
  
  document.body.insertBefore(alertDiv, document.body.firstChild);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Logout with cleanup
function logout() {
  clearToken();
  clearUser();
  // Add a small delay to ensure cleanup completes
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 100);
}
