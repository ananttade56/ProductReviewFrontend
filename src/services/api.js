import axiosInstance, { API_BASE_URL } from './axiosInstance.js';
import axios from 'axios';

/**
 * NutriLens AI Frontend API Client
 * Fully integrated with Product-review-Backend on port 5000 using Axios
 */
export const api = {
  // ==========================================
  // Session & Local Storage Utilities
  // ==========================================
  getToken() {
    try {
      return localStorage.getItem('nutrilens_token');
    } catch {
      return null;
    }
  },

  getUser() {
    try {
      const raw = localStorage.getItem('nutrilens_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setAuth(token, user) {
    try {
      if (token) localStorage.setItem('nutrilens_token', token);
      if (user) localStorage.setItem('nutrilens_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e);
    }
  },

  logout() {
    try {
      localStorage.removeItem('nutrilens_token');
      localStorage.removeItem('nutrilens_user');
    } catch (e) {
      console.warn('Failed to clear auth from localStorage:', e);
    }
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  getHeaders(isJson = true) {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  // ==========================================
  // 1. Authentication Endpoints (/api/auth)
  // ==========================================

  /**
   * Register a new user
   * @param {{ name: string, email: string, mobile: string, age?: number, address?: string, password: string }} data
   */
  async register(data) {
    try {
      return await axiosInstance.post('/auth/register', data);
    } catch (err) {
      return { success: false, message: err.message || 'Network error registering user.' };
    }
  },

  /**
   * Login with Email/Mobile and Password
   * @param {{ identifier?: string, email?: string, mobile?: string, password: string }} data
   */
  async login(data) {
    try {
      return await axiosInstance.post('/auth/login', data);
    } catch (err) {
      return { success: false, message: err.message || 'Network error logging in.' };
    }
  },

  /**
   * Request a 6-digit OTP sent to mobile number
   * @param {string} mobile
   */
  async sendOtp(mobile) {
    try {
      return await axiosInstance.post('/auth/send-otp', { mobile });
    } catch (err) {
      return { success: false, message: err.message || 'Failed to send OTP.' };
    }
  },

  /**
   * Verify mobile number with OTP
   * @param {string} mobile
   * @param {string} otp
   */
  async verifyOtp(mobile, otp) {
    try {
      return await axiosInstance.post('/auth/verify-otp', { mobile, otp });
    } catch (err) {
      return { success: false, message: err.message || 'Failed to verify OTP.' };
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    try {
      return await axiosInstance.get('/auth/me');
    } catch (err) {
      return { success: false, message: err.message || 'Failed to fetch user profile.' };
    }
  },

  /**
   * Update profile details (Name, Age, Address, Mobile)
   * @param {{ name?: string, age?: number, address?: string, mobile?: string }} data
   */
  async updateProfile(data) {
    try {
      return await axiosInstance.put('/auth/profile', data);
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update profile.' };
    }
  },

  // ==========================================
  // 2. Scan & Analysis Endpoints (/api/scans)
  // ==========================================

  /**
   * Analyze product image or manual ingredient text using Gemini Vision & Ingredient Knowledge Engine
   * @param {{ image?: string, prompt?: string, userProfile?: object, ingredientsText?: string }} payload
   */
  async analyzeScan(payload) {
    try {
      return await axiosInstance.post('/scans/analyze', payload);
    } catch (err) {
      return { success: false, message: err.message || 'Failed to analyze product scan.' };
    }
  },

  /**
   * Analyze product by uploading a File object directly as multipart/form-data
   * @param {File|Blob} file
   * @param {{ prompt?: string, userProfile?: object, ingredientsText?: string }} extra
   */
  async analyzeScanFile(file, extra = {}) {
    try {
      const formData = new FormData();
      if (file) formData.append('image', file);
      if (extra.prompt) formData.append('prompt', extra.prompt);
      if (extra.userProfile) formData.append('userProfile', JSON.stringify(extra.userProfile));
      if (extra.ingredientsText) formData.append('ingredientsText', extra.ingredientsText);

      return await axiosInstance.post('/scans/analyze', formData);
    } catch (err) {
      return { success: false, message: err.message || 'Failed to upload and analyze image.' };
    }
  },

  /**
   * Get all past scans (authenticated user or guest)
   */
  async getHistory() {
    try {
      return await axiosInstance.get('/scans');
    } catch (err) {
      return { success: false, message: err.message || 'Failed to load scan history.' };
    }
  },

  /**
   * Get specific scan details by ID
   * @param {string} id
   */
  async getScanById(id) {
    try {
      return await axiosInstance.get(`/scans/${id}`);
    } catch (err) {
      return { success: false, message: err.message || 'Failed to load scan details.' };
    }
  },

  /**
   * Delete single scan from history
   * @param {string} id
   */
  async deleteScan(id) {
    try {
      return await axiosInstance.delete(`/scans/${id}`);
    } catch (err) {
      return { success: false, message: err.message || 'Failed to delete scan.' };
    }
  },

  /**
   * Clear all scan records from history
   */
  async clearHistory() {
    try {
      return await axiosInstance.delete('/scans');
    } catch (err) {
      return { success: false, message: err.message || 'Failed to clear scan history.' };
    }
  },

  // ==========================================
  // 3. Ingredient Knowledge Endpoints (/api/ingredients)
  // ==========================================

  /**
   * Quick check of raw ingredients list without saving to history
   * @param {{ text?: string, ingredients?: string[], prompt?: string, userProfile?: object }} data
   */
  async checkIngredients(data) {
    try {
      return await axiosInstance.post('/ingredients/check', data);
    } catch (err) {
      return { success: false, message: err.message || 'Failed to check ingredients.' };
    }
  },

  /**
   * Search known food additives, INS numbers, preservatives, and allergens
   * @param {string} query
   */
  async searchIngredients(query) {
    try {
      return await axiosInstance.get('/ingredients/search', {
        params: { q: query },
      });
    } catch (err) {
      return { success: false, message: err.message || 'Failed to search additives.' };
    }
  },

  /**
   * Get preset prompt chips configuration matching frontend
   */
  async getChips() {
    try {
      return await axiosInstance.get('/ingredients/chips');
    } catch (err) {
      return { success: false, message: err.message || 'Failed to load prompt chips.' };
    }
  },

  // ==========================================
  // 4. System & Health Endpoints
  // ==========================================

  /**
   * Server health check
   */
  async getHealth() {
    try {
      return await axiosInstance.get('/health');
    } catch (err) {
      return { status: 'offline' };
    }
  },

  /**
   * Backend Welcome & API Documentation summary
   */
  async getWelcomeInfo() {
    try {
      const res = await axiosInstance.get('/health');
      return res;
    } catch {
      return { status: 'offline' };
    }
  },
};

export { axiosInstance, API_BASE_URL };
export default api;
