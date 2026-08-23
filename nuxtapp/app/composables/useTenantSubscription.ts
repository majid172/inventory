import { ref, computed } from 'vue';

export interface TenantSubscriptionInfo {
  isExpired: boolean;
  daysRemaining: number;
  status: 'active' | 'trial' | 'suspended' | 'expired' | 'trial_expired';
  storeName: string;
  planTier: string;
  nextBillingDate: string;
  joinedDate: string;
}

export function useTenantSubscription() {
  const getActiveStore = () => {
    if (process.client) {
      const saved = localStorage.getItem('active_tenant_store');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return null;
  };

  const getSubscriptionInfo = (): TenantSubscriptionInfo => {
    const store = getActiveStore();
    if (!store) {
      return {
        isExpired: false,
        daysRemaining: 14,
        status: 'active',
        storeName: 'MediCare Central Pharmacy',
        planTier: 'pro',
        nextBillingDate: '2028-12-31',
        joinedDate: '2026-01-01'
      };
    }

    const status = store.status || 'trial';
    const storeName = store.storeName || store.ownerName || 'Pharmacy Store';
    const planTier = store.planTier || 'pro';
    const joinedDate = store.joinedDate || '2026-01-01';

    let nextBillingDate = store.nextBillingDate || store.trialEndsAt;
    if (!nextBillingDate) {
      const joined = new Date(joinedDate);
      joined.setDate(joined.getDate() + 14);
      nextBillingDate = joined.toISOString().split('T')[0];
    }

    if (status === 'expired' || status === 'suspended') {
      return {
        isExpired: true,
        daysRemaining: 0,
        status,
        storeName,
        planTier,
        nextBillingDate,
        joinedDate
      };
    }

    if (status === 'active') {
      return {
        isExpired: false,
        daysRemaining: 365,
        status: 'active',
        storeName,
        planTier,
        nextBillingDate,
        joinedDate
      };
    }

    // Trial status calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(nextBillingDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return {
        isExpired: true,
        daysRemaining: 0,
        status: 'trial_expired',
        storeName,
        planTier,
        nextBillingDate,
        joinedDate
      };
    }

    return {
      isExpired: false,
      daysRemaining,
      status: 'trial',
      storeName,
      planTier,
      nextBillingDate,
      joinedDate
    };
  };

  return {
    getActiveStore,
    getSubscriptionInfo
  };
}
