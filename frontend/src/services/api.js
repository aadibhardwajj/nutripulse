import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nutripulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap standardized envelope or handle expired token
api.interceptors.response.use(
  (response) => {
    // Standard response format: { success: true, data: ..., message: ... }
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized -> Clear expired token & session
      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('nutripulse_token');
        localStorage.removeItem('nutripulse_user');
        window.dispatchEvent(new CustomEvent('nutripulse_session_expired'));
      }

      const message = error.response.data?.message || 'A server error occurred';
      const code = error.response.data?.code || 'SERVER_ERROR';
      const customError = new Error(message);
      customError.code = code;
      customError.status = error.response.status;
      customError.errors = error.response.data?.errors;
      return Promise.reject(customError);
    } else if (error.request) {
      const networkError = new Error('Unable to connect to the NutriPulse server. Please check your connection.');
      networkError.code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }
    return Promise.reject(error);
  }
);

export default api;
