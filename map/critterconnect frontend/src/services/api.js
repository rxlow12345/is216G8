import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds
});

// Add request interceptor (runs before every request)
api.interceptors.request.use(
  (config) => {
    // Add authentication token if it exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor (runs after every response)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  // Get all reports
  getReports(filters = {}) {
    return api.get('/reports', { params: filters });
  },

  // Get single report by ID
  getReport(id) {
    return api.get(`/reports/${id}`);
  },

  // Create new report
  createReport(reportData) {
    return api.post('/reports', reportData);
  },

  // Update report status
  updateReportStatus(id, status, assignedTo = null) {
    return api.put(`/reports/${id}/status`, {
      status,
      assignedTo
    });
  },

  // Delete report
  deleteReport(id) {
    return api.delete(`/reports/${id}`);
  },

  // Get nearby reports
  getNearbyReports(lat, lng, radius = 10) {
    return api.get('/reports', {
      params: { lat, lng, radius }
    });
  },

  // Organization login
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  // Organization logout
  logout() {
    localStorage.removeItem('auth_token');
  }
};