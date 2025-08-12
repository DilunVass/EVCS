import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://fastapi-app-121646825275.us-central1.run.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If unauthorized, clear all session data
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/protected/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export default api;