// ============================================================================
// PharmaCare — Global Route Middleware
// Handles: Auth guard + Role-Based Access Control (RBAC) + Subscription Gatekeeper
// ============================================================================

import { useTenantSubscription } from '~/composables/useTenantSubscription';

export default defineNuxtRouteMiddleware((to, _from) => {
  if (!process.client) return;

  const isLoggedIn = !!(localStorage.getItem('auth_token') || localStorage.getItem('is_logged_in'));
  let authUser: any = null;
  const savedUser = localStorage.getItem('auth_user');
  if (savedUser) {
    try {
      authUser = JSON.parse(savedUser);
    } catch (e) {}
  }

  const rawRole = (authUser?.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
  const isSuperAdmin = localStorage.getItem('is_super_admin') === 'true' || rawRole === 'SUPERADMIN';
  const isCashier = !isSuperAdmin && (rawRole === 'CASHIER' || rawRole === 'POSUSER');

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Super Admin route guard (/super-admin/**)
  // ──────────────────────────────────────────────────────────────────────────
  if (to.path.startsWith('/super-admin')) {
    if (!isLoggedIn || !isSuperAdmin) {
      return navigateTo(isLoggedIn ? (isCashier ? '/pos' : '/admin') : '/login');
    }
    // Super Admin has no subscription restrictions — always allow
    return;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Cashier Isolation: Cashiers can ONLY access /pos
  // ──────────────────────────────────────────────────────────────────────────
  if (isLoggedIn && isCashier) {
    // Block cashiers from accessing any admin dashboard or super-admin views
    if (to.path.startsWith('/admin') || to.path.startsWith('/super-admin')) {
      console.warn(`[RBAC] Cashier restricted from ${to.path}. Redirecting to /pos`);
      return navigateTo('/pos');
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Protected tenant routes: /admin/** and /pos
  // ──────────────────────────────────────────────────────────────────────────
  if (to.path.startsWith('/pos') || (to.path.startsWith('/admin') && !to.path.startsWith('/super-admin'))) {
    // 3a. Must be logged in
    if (!isLoggedIn) {
      return navigateTo('/login');
    }

    // 3b. Subscription Gatekeeper
    // Allow billing page through always so tenant can renew
    const isBillingPage = to.path === '/admin/billing';

    if (!isBillingPage) {
      const { getSubscriptionInfo, fetchSubscriptionStatus } = useTenantSubscription();

      // Synchronous fast-read from memory/cache for instant decision
      const info = getSubscriptionInfo();

      if (info.isExpired) {
        // If cashier, block with alert; if owner, redirect to billing
        if (isCashier) {
          return navigateTo('/login?reason=subscription_expired');
        }
        return navigateTo('/admin/billing?locked=1&reason=' + info.status);
      }

      // Trigger async background refresh (updates cache for next navigation)
      fetchSubscriptionStatus(false).catch(() => {});
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Redirect already-logged-in users away from /login
  // ──────────────────────────────────────────────────────────────────────────
  if (to.path === '/login' && isLoggedIn) {
    if (isSuperAdmin) return navigateTo('/super-admin');
    if (isCashier) return navigateTo('/pos');
    return navigateTo('/admin');
  }
});

