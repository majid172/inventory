export default defineNuxtPlugin(() => {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.includes('localhost:5000/api')) {
      resource = resource.replace(/http:\/\/localhost:5000\/api/g, '/api');
    } else if (resource instanceof Request && resource.url.includes('localhost:5000/api')) {
      const newUrl = resource.url.replace(/http:\/\/localhost:5000\/api/g, '/api');
      resource = new Request(newUrl, resource);
    }
    return originalFetch(resource, config);
  };
});
