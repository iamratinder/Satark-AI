import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const legalApiService = {
  // Search legal knowledge
  searchLegalKnowledge: async (query) => {
    try {
      const response = await api.post('/legal/search', { query });
      return response.data;
    } catch (error) {
      console.error('Legal search error:', error);
      throw error;
    }
  },

  // Get search history
  getSearchHistory: async () => {
    try {
      const response = await api.get('/legal/history');
      return response.data.history;
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  },

  // Get specific search details
  getSearchDetails: async (searchId) => {
    try {
      const response = await api.get(`/legal/history/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Get search details error:', error);
      throw error;
    }
  },
};



export default legalApiService;