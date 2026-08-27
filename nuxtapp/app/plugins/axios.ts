import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:5000/api';

  axios.defaults.baseURL = apiBase;

  // Add request interceptor to inject active tenant ID and JWT Authorization header
  axios.interceptors.request.use((reqConfig) => {
    if (process.client) {
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        reqConfig.headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Priority 1: Authenticated User's tenant ID
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user && user.tenantId && user.tenantId !== 'SYSTEM') {
            reqConfig.headers['x-tenant-id'] = String(user.tenantId);
          }
        } catch (e) {}
      }

      // Priority 2: Active tenant store fallback if no tenant in user
      if (!reqConfig.headers['x-tenant-id']) {
        const savedStore = localStorage.getItem('active_tenant_store');
        if (savedStore) {
          try {
            const store = JSON.parse(savedStore);
            if (store && store.id) {
              reqConfig.headers['x-tenant-id'] = String(store.id);
            }
          } catch (e) {}
        }
      }
    }
    return reqConfig;
  });

  // Response interceptor to handle token & subscription expiry
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (process.client && error.response && (error.response.status === 401 || error.response.status === 403)) {
        const data = error.response.data || {};
        const isExpired = data.code === 'SUBSCRIPTION_EXPIRED' || 
                          (data.message && data.message.toLowerCase().includes('subscription expired'));
        const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/super-admin-login');

        if (!isAuthRoute && (error.response.status === 401 || isExpired)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('is_logged_in');
          localStorage.removeItem('is_super_admin');
          localStorage.removeItem('active_tenant_store');
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/') {
            window.location.href = '/login?reason=subscription_expired';
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


