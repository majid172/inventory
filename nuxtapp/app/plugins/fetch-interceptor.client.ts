export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const rawBase = (config.public.apiBase || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
  const apiBase = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, reqConfig] = args;
    if (typeof resource === 'string') {
      if (resource.includes('http://localhost:5000/api')) {
        resource = resource.replace(/http:\/\/localhost:5000\/api/g, apiBase);
      } else if (resource.startsWith('/api')) {
        resource = resource.replace(/^\/api/, apiBase);
      }
    } else if (resource instanceof Request) {
      if (resource.url.includes('http://localhost:5000/api')) {
        const newUrl = resource.url.replace(/http:\/\/localhost:5000\/api/g, apiBase);
        resource = new Request(newUrl, resource);
      } else if (resource.url.startsWith('/api')) {
        const newUrl = resource.url.replace(/^\/api/, apiBase);
        resource = new Request(newUrl, resource);
      }
    }
    return originalFetch(resource, reqConfig);
  };
});
