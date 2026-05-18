import axios from 'axios';
import { useNotificationStore } from '../stores/notificationStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cardiq_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors or 5xx
    if (!error.response || error.response.status >= 500) {
      useNotificationStore.getState().add({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to CardIQ servers. Please check your connection.',
      });
    } 
    // 401 Unauthorized
    else if (error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cardiq_token');
        // Avoid redirect loop if already on login
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    
    return Promise.reject(error);
  }
);
