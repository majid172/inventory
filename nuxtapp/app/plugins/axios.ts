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

  const api = axios.create({
    baseURL: apiBase,
  });

  return {
    provide: {
      api
    }
  };
});

