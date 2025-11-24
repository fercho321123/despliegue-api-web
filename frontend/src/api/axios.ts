// src/api/axios.ts
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// try refresh on 401 (simple implementation)
// NOTE: adapta la ruta si tu backend usa /api/auth/token/refresh/ u otra
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem('refresh');
      try {
        // Ajusta la URL si tu backend expone /api/auth/token/refresh/ u otra ruta
        const response = await axios.post(`${baseURL}/usuarios/auth/token/refresh/`, { refresh });
        const newAccess = response.data.access;
        localStorage.setItem('access', newAccess);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccess;
        processQueue(null, newAccess);
        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        // opcional: limpiar tokens y redirigir al login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
