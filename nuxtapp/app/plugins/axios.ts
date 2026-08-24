import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:5000/api';

  axios.defaults.baseURL = apiBase;

  // Add request interceptor to inject active tenant ID and JWT Authorization header
  axios.interceptors.request.use((reqConfig) => {
    if (process.client) {
      const saved = localStorage.getItem('active_tenant_store');
      if (saved) {
        try {
          const store = JSON.parse(saved);
          if (store && store.id) {
            reqConfig.headers['x-tenant-id'] = store.id;
          }
        } catch (e) {}
      }

      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        reqConfig.headers['Authorization'] = `Bearer ${authToken}`;
      }
    }
    return reqConfig;
  });

  // Response interceptor to handle token expiry
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (process.client && error.response && error.response.status === 401) {
        const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/super-admin-login');
        if (!isAuthRoute) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('is_logged_in');
          localStorage.removeItem('is_super_admin');
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );

  const api = axios.create({
    baseURL: apiBase,
  });

  api.interceptors.request.use(axios.interceptors.request.handlers[0]?.fulfilled);
  api.interceptors.response.use(
    axios.interceptors.response.handlers[0]?.fulfilled,
    axios.interceptors.response.handlers[0]?.rejected
  );

  return {
    provide: {
      api
    }
  };
});


