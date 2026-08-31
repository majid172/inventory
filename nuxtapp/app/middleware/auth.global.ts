// ============================================================================
// PharmaCare — Global Route Middleware
// Handles: Auth guard + Subscription Gatekeeper
// ============================================================================

import { useTenantSubscription } from '~/composables/useTenantSubscription';

export default defineNuxtRouteMiddleware((to, _from) => {
  if (!process.client) return;

  const isLoggedIn = !!(localStorage.getItem('auth_token') || localStorage.getItem('is_logged_in'));
  const isSuperAdmin = localStorage.getItem('is_super_admin') === 'true';

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Super Admin route guard
  // ──────────────────────────────────────────────────────────────────────────
  if (to.path.startsWith('/super-admin')) {
    if (!isLoggedIn || !isSuperAdmin) {
      return navigateTo('/login');
    }
    // Super Admin has no subscription restrictions — always allow
    return;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Protected tenant routes: /admin/** and /pos
  // ──────────────────────────────────────────────────────────────────────────
  if (to.path.startsWith('/pos') || (to.path.startsWith('/admin') && !to.path.startsWith('/super-admin'))) {
    // 2a. Must be logged in
    if (!isLoggedIn) {
      return navigateTo('/login');
    }

    // 2b. Subscription Gatekeeper
    // Allow billing page through always so tenant can renew
    const isBillingPage = to.path === '/admin/billing';

    if (!isBillingPage) {
      const { getSubscriptionInfo, fetchSubscriptionStatus } = useTenantSubscription();

      // Synchronous fast-read from memory/cache for instant decision
      const info = getSubscriptionInfo();

      if (info.isExpired) {
        // Lock them out — redirect to billing with locked flag
        return navigateTo('/admin/billing?locked=1&reason=' + info.status);
      }

      // Trigger async background refresh (updates cache for next navigation)
      // We don't await so it doesn't block route transition
      fetchSubscriptionStatus(false).catch(() => {});
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Redirect already-logged-in users away from /login
  // ──────────────────────────────────────────────────────────────────────────
  if (to.path === '/login' && isLoggedIn) {
    return navigateTo(isSuperAdmin ? '/super-admin' : '/admin');
  }
});
