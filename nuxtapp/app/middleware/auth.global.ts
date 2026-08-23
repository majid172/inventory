export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const isLoggedIn = !!(localStorage.getItem('auth_token') || localStorage.getItem('is_logged_in'));
    const isSuperAdmin = localStorage.getItem('is_super_admin') === 'true';

    // Protect Super Admin console route
    if (to.path.startsWith('/super-admin')) {
      if (!isLoggedIn || !isSuperAdmin) {
        return navigateTo('/login');
      }
    }

    // Protect Store POS and Store ERP Admin routes
    if (to.path.startsWith('/pos') || (to.path.startsWith('/admin') && !to.path.startsWith('/super-admin'))) {
      if (!isLoggedIn) {
        return navigateTo('/login');
      }
    }

    // Redirect logged-in users away from /login if visiting login page directly
    if (to.path === '/login' && isLoggedIn) {
      if (isSuperAdmin) {
        return navigateTo('/super-admin');
      } else {
        return navigateTo('/pos');
      }
    }
  }
});
