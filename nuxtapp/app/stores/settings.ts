import { defineStore } from 'pinia';
import axios from 'axios';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    systemSettings: {
      platformName: 'PharmaCare SaaS',
      maintenanceMode: false,
      maintenanceMessage: 'System is currently undergoing scheduled database maintenance. Please check back shortly.',
      selfRegistrationEnabled: true,
      defaultTrialDays: 14,
      supportEmail: 'support@pharmacare.com',
      currencySymbol: '$',
      timezone: 'Asia/Dhaka',
      bkashEnabled: true,
      nagadEnabled: true,
      upayEnabled: true,
      rocketEnabled: true,
      cardEnabled: false,
      bkashNumber: '01700-000000',
      nagadNumber: '01800-000000',
      upayNumber: '01900-000000',
      rocketNumber: '01600-000000',
      cardRef: 'SSL-MED-PAY'
    },
    tenantSettings: {} as Record<string, any>,
    isLoading: false,
    error: null as string | null
  }),
  getters: {
    currencySymbol: (state) => state.tenantSettings.currencySymbol || state.systemSettings.currencySymbol,
    timezone: (state) => state.tenantSettings.timezone || state.systemSettings.timezone,
    bkashNumber: (state) => state.systemSettings.bkashNumber || '01700-000000',
    nagadNumber: (state) => state.systemSettings.nagadNumber || '01800-000000',
    upayNumber: (state) => state.systemSettings.upayNumber || '01900-000000',
    rocketNumber: (state) => state.systemSettings.rocketNumber || '01600-000000'
  },
  actions: {
    async fetchSystemSettings() {
      this.isLoading = true;
      try {
        const response = await fetch('http://localhost:5000/api/settings/system');
        const data = await response.json();
        if (data && data.success) {
          this.systemSettings = { ...this.systemSettings, ...data.settings };
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Failed to load system settings:', err);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchTenantSettings() {
      try {
        const response = await axios.get('/settings/tenant');
        if (response.data && response.data.success) {
          this.tenantSettings = {
            ...this.tenantSettings,
            ...(response.data.settings || {}),
            ...(response.data.tenant || {})
          };
          return;
        }
      } catch (err: any) {
        console.warn('Backend fetch tenant settings warning:', err.message);
      }

      // Fallback from localStorage active store
      if (process.client) {
        try {
          const storeJson = localStorage.getItem('active_tenant_store');
          if (storeJson) {
            const store = JSON.parse(storeJson);
            this.tenantSettings = {
              ...this.tenantSettings,
              storeName: store.name || store.store_name,
              store_name: store.name || store.store_name,
              phone: store.phone,
              address: store.address
            };
          }
        } catch (e) {}
      }
    }
  }
});
