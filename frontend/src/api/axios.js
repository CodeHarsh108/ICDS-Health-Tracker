import axios from 'axios';
import { addToQueue } from '../services/offlineQueue';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Helper to extract beneficiaryId from URL pattern: /beneficiaries/123/nutrition
const extractBeneficiaryId = (url) => {
  const match = url.match(/\/beneficiaries\/(\d+)/);
  return match ? parseInt(match[1]) : null;
};

// Request interceptor – attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ams_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor – handle 401 and offline queueing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('ams_token');
      localStorage.removeItem('ams_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 2. Handle offline queueing for mutating requests (POST/PUT/DELETE)
    const config = error.config;
    if (!navigator.onLine && config && ['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      // Clone data and add beneficiaryId if missing
      let dataToStore = { ...config.data };
      const beneficiaryId = extractBeneficiaryId(config.url);
      if (beneficiaryId && !dataToStore.beneficiaryId) {
        dataToStore.beneficiaryId = beneficiaryId;
      }
      await addToQueue({
        url: config.url,
        method: config.method,
        data: dataToStore,
      });
      // Return a fake success so the UI doesn't show an error
      return Promise.resolve({ data: { offlineQueued: true, message: 'Saved offline – will sync later' } });
    }

    return Promise.reject(error);
  }
);

export default api;