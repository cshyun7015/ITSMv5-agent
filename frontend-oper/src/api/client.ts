import axios, { InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    if (status === 401) {
      console.warn('Session expired. Redirecting to login...');
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: auto-logout
    } else if (status === 403) {
      console.error('Access Denied:', message);
    } else {
      console.error(`API Error [${status}]:`, message);
    }
    
    return Promise.reject({
      status,
      message,
      data: error.response?.data
    });
  }
);

export default apiClient;
