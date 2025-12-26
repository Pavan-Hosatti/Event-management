// utils/api.js - UPDATED TO MATCH YOUR BACKEND

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ✅ FIXED Request interceptor - Get token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ FIXED Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - Clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// ... interceptors remain the same ...

// EVENT API - MATCHING YOUR BACKEND ROUTES
export const eventAPI = {
  // GET routes
  getAll: (params = {}) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  getUpcoming: () => api.get('/events/upcoming'),
  getClubs: () => api.get('/events/clubs'),
  
  // POST routes - YOUR BACKEND HAS BOTH '/events' AND '/events/create'
  create: (eventData) => api.post('/events/create', eventData), // Use create endpoint
  
  // PUT/PATCH routes
  update: (id, eventData) => api.patch(`/events/registrations/${id}`, eventData), // Check this
  
  // DELETE routes
  delete: (id) => api.delete(`/events/registrations/${id}`),
  
  // Registration routes
  register: (eventId, registrationData) => api.post(`/events/${eventId}/register`, registrationData),
  getUserRegistrations: (userId) => api.get(`/events/registrations/user/${userId}`),
  getEventRegistrations: (eventId) => api.get(`/events/registrations/event/${eventId}`),
  checkIn: (eventId, regId) => api.patch(`/events/${eventId}/registrations/${regId}/checkin`),
  
  // Certificate routes
  getCertificateStatus: (eventId, regId) => api.get(`/events/${eventId}/registrations/${regId}/certificate/status`),
  downloadCertificate: (eventId, regId) => api.get(`/events/${eventId}/registrations/${regId}/certificate/download`),
  
  // Feedback
  submitFeedback: (eventId, feedback) => api.post(`/events/${eventId}/feedback`, feedback),
  getFeedback: (eventId) => api.get(`/events/${eventId}/feedback`),
};

// ADMIN API - MATCHING YOUR BACKEND ROUTES
export const adminAPI = {
  // Stats & Analytics
  getStats: () => api.get('/admin/stats'),
  getSystemAnalytics: () => api.get('/admin/system-analytics'),
  getUserStats: (userId) => api.get(`/admin/user-stats/${userId}`),
  getAttendanceHistory: () => api.get('/admin/attendance-history'),
  getNotifications: () => api.get('/admin/notifications'),
  
  // Event Management
  getEvents: () => api.get('/admin/events'),
  getEventRegistrations: (eventId) => api.get(`/admin/events/${eventId}/registrations`),
  updateEvent: (id, eventData) => api.post(`/admin/events/${id}/update`, eventData),
  getEventAnalytics: (eventId) => api.get(`/admin/events/${eventId}/analytics`),
  getEventRegistrationsReport: (eventId) => api.get(`/admin/events/${eventId}/registrations-report`),
  
  // Attendance
  markAttendance: (eventId, data) => api.post(`/admin/events/${eventId}/attendance`, data),
  markAllAttendance: (eventId, data) => api.post(`/admin/events/${eventId}/attendance/mark-all`, data),
  
  // CERTIFICATE
  uploadCertificate: (eventId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/events/${eventId}/certificate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulkIssueCertificates: (data) => api.post('/admin/bulk-certificates', data),
  
  // QR Codes
  generateQRCodes: (eventId) => api.get(`/qr-codes/event/${eventId}`),
  downloadQRCode: (registrationId) => api.get(`/qr-codes/${registrationId}/download`),
  bulkDownloadQRCodes: (eventId) => api.get(`/qr-codes/event/${eventId}/bulk-download`),
  
  // Document Requests
  getPendingDocumentRequests: () => api.get('/admin/document-requests'),
  processDocumentRequest: (id, data) => api.patch(`/admin/document-requests/${id}`, data),
  
  // User Management
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Club Management
  getClubs: () => api.get('/admin/clubs'),
  createClub: (clubData) => api.post('/admin/clubs', clubData),
  
  // Financial Reports
  getFinancialReport: () => api.get('/admin/financial-report'),
  
  // Export & Notifications - UPDATED
  exportData: (eventId = '') => {
    let url = '/admin/export';
    if (eventId) {
      url += `?eventId=${eventId}`;
    }
    return api.get(url, {
      responseType: 'blob' // Important for file downloads
    });
  },
  
  exportAllData: () => api.get('/admin/export', {
    responseType: 'blob'
  }),
  
  exportEventData: (eventId) => api.get(`/admin/export?eventId=${eventId}`, {
    responseType: 'blob'
  }),
  
  sendNotifications: (data) => api.post('/admin/notifications/send', data),
  
  // REPORTS
  getReports: () => api.get('/admin/reports'),
  
  // Admin Pages
  getAdminEventsPage: () => api.get('/admin/events'),
  getAdminQRCodesPage: () => api.get('/admin/qr-codes'),
  getAdminReportsPage: () => api.get('/admin/reports'),
  getAdminAttendancePage: () => api.get('/admin/attendance'),
};

// AUTH API
// AUTH API - CORRECTED
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.get('/auth/logout'),  
  getMe: () => api.get('/auth/me'),
  googleLogin: (token) => api.post('/auth/google-login', { token }),
};

// STUDENT API
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getMyRegistrations: () => api.get('/student/registrations'),
  getCertificates: () => api.get('/student/certificates'),
  getDocuments: () => api.get('/student/documents'),
  requestDocument: (data) => api.post('/student/documents/request', data),
  getEventQRCode: (eventId) => api.get(`/student/events/${eventId}/qr-code`),
};

// DOCUMENT API
export const documentAPI = {
  getMyRequests: () => api.get('/documents/my-rrequests'),
  requestDocument: (data) => api.post('/documents/request', data),
  downloadDocument: (id) => api.get(`/documents/download/${id}`),
  getPendingRequests: () => api.get('/documents/pending'),
  processRequest: (id, data) => api.patch(`/documents/${id}/process`, data),
};

// VOICE API
export const voiceAPI = {
  query: (data) => api.post('/voice/query', data),
  getConversation: (sessionId) => api.get(`/voice/conversation/${sessionId}`),
  clearConversation: (sessionId) => api.delete(`/voice/conversation/${sessionId}`),
};

// SETTINGS API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateProfile: (data) => api.put('/settings/profile', data),
  updatePassword: (data) => api.put('/settings/password', data),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  updatePrivacy: (data) => api.put('/settings/privacy', data),
};

// REPORTS API (separate from admin)
export const reportAPI = {
  getReports: () => api.get('/reports'),
  exportReport: () => api.get('/reports/export'),
};

export default api;