import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.BACKEND_URL || 'http://localhost:5000',
  withCredentials: true 
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 