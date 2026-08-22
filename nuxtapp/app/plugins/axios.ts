import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:5000/api';

  axios.defaults.baseURL = apiBase;

  const api = axios.create({
    baseURL: apiBase,
  });

  return {
    provide: {
      api
    }
  };
});
