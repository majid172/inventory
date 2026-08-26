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

      // Check if logged-in user subscription date or status has expired
      const savedUserStr = localStorage.getItem('auth_user');
      if (savedUserStr) {
        try {
          const userObj = JSON.parse(savedUserStr);
          const todayStr = new Date().toISOString().split('T')[0];
          const subEndStr = userObj.subscription_end ? new Date(userObj.subscription_end).toISOString().split('T')[0] : null;
          const isExpiredStatus = userObj.status === 'expired' || userObj.status === 'suspended' || userObj.status === 'inactive';
          const isExpiredDate = subEndStr && subEndStr < todayStr;

          if (isExpiredStatus || isExpiredDate) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('is_logged_in');
            localStorage.removeItem('active_tenant_store');
            return navigateTo('/login?reason=subscription_expired');
          }
        } catch (e) {}
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
