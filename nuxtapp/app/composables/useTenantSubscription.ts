import { ref } from 'vue';

// ============================================================================
// Subscription Cache Config
// ============================================================================
const CACHE_KEY = 'subscription_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface TenantSubscriptionInfo {
  isExpired: boolean;
  daysRemaining: number;
  status: 'active' | 'trial' | 'suspended' | 'expired' | 'trial_expired';
  storeName: string;
  planTier: string;
  nextBillingDate: string;
  joinedDate: string;
}

// Global reactive ref — shared across all composable instances
const subscriptionInfo = ref<TenantSubscriptionInfo | null>(null);
const isFetchingSubscription = ref(false);

export function useTenantSubscription() {
  // ---------------------------------------------------------------------------
  // Helper: get active_tenant_store from localStorage
  // ---------------------------------------------------------------------------
  const getActiveStore = () => {
    if (process.client) {
      const saved = localStorage.getItem('active_tenant_store');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  };

  // ---------------------------------------------------------------------------
  // Helper: build SubscriptionInfo from localStorage data (offline fallback)
  // ---------------------------------------------------------------------------
  const buildFromLocalStorage = (): TenantSubscriptionInfo => {
    const store = getActiveStore();

    // Also check auth_user for subscriptionStatus / subscriptionEnd fields
    let authUser: any = null;
    if (process.client) {
      try { authUser = JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch (e) {}
    }

    if (!store && !authUser) {
      return {
        isExpired: false,
        daysRemaining: 14,
        status: 'active',
        storeName: 'My Pharmacy',
        planTier: 'pro',
        nextBillingDate: '2028-12-31',
        joinedDate: '2026-01-01',
      };
    }

    const status: string =
      authUser?.subscriptionStatus ||
      store?.status ||
      'trial';

    const storeName = store?.storeName || store?.ownerName || authUser?.storeName || 'Pharmacy Store';
    const planTier = store?.planTier || authUser?.planId || 'pro';
    const joinedDate = store?.joinedDate || authUser?.joinedDate || '2026-01-01';

    let nextBillingDate =
      authUser?.subscriptionEnd ||
      store?.nextBillingDate ||
      store?.trialEndsAt;

    if (!nextBillingDate) {
      const joined = new Date(joinedDate);
      joined.setDate(joined.getDate() + 14);
      nextBillingDate = joined.toISOString().split('T')[0];
    }

    // Definitively expired/suspended statuses
    if (status === 'expired' || status === 'suspended' || status === 'inactive') {
      return { isExpired: true, daysRemaining: 0, status: status as any, storeName, planTier, nextBillingDate, joinedDate };
    }

    if (status === 'active') {
      return { isExpired: false, daysRemaining: 365, status: 'active', storeName, planTier, nextBillingDate, joinedDate };
    }

    // Trial — calculate days remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(nextBillingDate);
    expiry.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return { isExpired: true, daysRemaining: 0, status: 'trial_expired', storeName, planTier, nextBillingDate, joinedDate };
    }

    return { isExpired: false, daysRemaining, status: 'trial', storeName, planTier, nextBillingDate, joinedDate };
  };

  // ---------------------------------------------------------------------------
  // Cache helpers
  // ---------------------------------------------------------------------------
  const readCache = (): TenantSubscriptionInfo | null => {
    if (!process.client) return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL_MS) return data as TenantSubscriptionInfo;
    } catch (e) {}
    return null;
  };

  const writeCache = (data: TenantSubscriptionInfo) => {
    if (!process.client) return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {}
  };

  const clearCache = () => {
    if (process.client) localStorage.removeItem(CACHE_KEY);
  };

  // ---------------------------------------------------------------------------
  // Core: map raw API subscription object → TenantSubscriptionInfo
  // ---------------------------------------------------------------------------
  const mapApiSubscription = (sub: any, store: any): TenantSubscriptionInfo => {
    const apiStatus: string = (sub.status || 'trial').toLowerCase();

    const storeName = store?.storeName || store?.ownerName || sub.storeName || 'Pharmacy Store';
    const planTier = sub.plan_name || sub.planTier || store?.planTier || 'pro';
    const joinedDate = sub.start_date || store?.joinedDate || '2026-01-01';
    const nextBillingDate = sub.end_date || sub.nextBillingDate || store?.nextBillingDate || '2026-12-31';

    if (apiStatus === 'expired' || apiStatus === 'suspended' || apiStatus === 'inactive') {
      return { isExpired: true, daysRemaining: 0, status: apiStatus as any, storeName, planTier, nextBillingDate, joinedDate };
    }

    if (apiStatus === 'active') {
      return { isExpired: false, daysRemaining: 365, status: 'active', storeName, planTier, nextBillingDate, joinedDate };
    }

    // trial
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const expiry = new Date(nextBillingDate); expiry.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return { isExpired: true, daysRemaining: 0, status: 'trial_expired', storeName, planTier, nextBillingDate, joinedDate };
    }
    return { isExpired: false, daysRemaining, status: 'trial', storeName, planTier, nextBillingDate, joinedDate };
  };

  // ---------------------------------------------------------------------------
  // Main: fetch subscription (API → cache → localStorage fallback)
  // ---------------------------------------------------------------------------
  const fetchSubscriptionStatus = async (forceRefresh = false): Promise<TenantSubscriptionInfo> => {
    // 1. Check in-memory reactive ref first (fastest)
    if (!forceRefresh && subscriptionInfo.value) return subscriptionInfo.value;

    // 2. Check localStorage cache
    if (!forceRefresh) {
      const cached = readCache();
      if (cached) {
        subscriptionInfo.value = cached;
        return cached;
      }
    }

    // 3. Try real API
    if (process.client && !isFetchingSubscription.value) {
      isFetchingSubscription.value = true;
      try {
        const token = localStorage.getItem('auth_token');
        const authUserRaw = localStorage.getItem('auth_user');
        let tenantId: string | null = null;
        try { tenantId = JSON.parse(authUserRaw || 'null')?.tenantId || null; } catch (e) {}

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (tenantId && tenantId !== 'SYSTEM') headers['x-tenant-id'] = tenantId;

        const res = await fetch('http://localhost:5000/api/inventory/my-subscription', {
          headers,
          signal: AbortSignal.timeout(4000), // 4s timeout
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.subscription) {
            const store = getActiveStore();
            const info = mapApiSubscription(data.subscription, store);
            writeCache(info);
            subscriptionInfo.value = info;

            // Keep active_tenant_store in sync
            if (store) {
              store.status = data.subscription.status;
              store.nextBillingDate = data.subscription.end_date;
              localStorage.setItem('active_tenant_store', JSON.stringify(store));
            }
            return info;
          }
        }
      } catch (e) {
        // Network error — silently fall through to localStorage fallback
        console.warn('[SubscriptionGatekeeper] API fetch failed, using localStorage fallback.');
      } finally {
        isFetchingSubscription.value = false;
      }
    }

    // 4. Fallback: build from localStorage
    const fallback = buildFromLocalStorage();
    subscriptionInfo.value = fallback;
    return fallback;
  };

  // Synchronous fast-read (for middleware — no async)
  const getSubscriptionInfo = (): TenantSubscriptionInfo => {
    if (subscriptionInfo.value) return subscriptionInfo.value;
    const cached = readCache();
    if (cached) { subscriptionInfo.value = cached; return cached; }
    const local = buildFromLocalStorage();
    subscriptionInfo.value = local;
    return local;
  };

  return {
    subscriptionInfo,
    isFetchingSubscription,
    getActiveStore,
    getSubscriptionInfo,
    fetchSubscriptionStatus,
    clearCache,
  };
}
