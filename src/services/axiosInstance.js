import axios from 'axios';

/**
 * Computes dynamic API Base URL
 * - In browser (desktop or mobile LAN e.g. 192.168.x.x):
 *   Always uses relative '/api' which transparently proxies via Vite dev server
 *   to backend on port 5000. This avoids all cross-device CORS, IP mismatches,
 *   and Windows Firewall port 5000 blocks on mobile devices!
 * - In Node.js / non-browser test scripts: falls back to full URL http://localhost:5000/api
 */
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    const isRemoteDevice = hostname !== 'localhost' && hostname !== '127.0.0.1';
    const envUrl = import.meta.env?.VITE_API_BASE_URL;

    // If on a mobile device and envUrl is hardcoded to localhost, ignore it to prevent phone self-connecting
    if (isRemoteDevice && envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return '/api';
    }

    if (envUrl && envUrl !== 'http://localhost:5000/api') {
      return envUrl;
    }

    // Default for browser: use '/api' to leverage Vite dev proxy seamlessly
    return '/api';
  }

  // Node.js or SSR environment
  return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Pre-configured Axios instance for NutriLens AI Backend
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for OCR / AI Vision models
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically injects JWT Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('nutrilens_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // LocalStorage access fallback (e.g. private mode)
    }

    // If uploading FormData, delete Content-Type so browser sets boundary multipart header
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize data responses and error formats
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.resolve(error.response.data);
    }

    const isTimeout = error.code === 'ECONNABORTED';
    const message = isTimeout
      ? 'Request timed out. Please try again.'
      : (error.message || `Unable to connect to NutriLens AI backend (${API_BASE_URL})`);

    return Promise.resolve({
      success: false,
      status: 'offline',
      message,
      error: error.message,
    });
  }
);

export default axiosInstance;
