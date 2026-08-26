<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 font-sans">
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-700 dark:text-gray-300">Settings & Preferences</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 border uppercase bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400">
              ● Store Active
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          <div class="md:col-span-3 lg:col-span-3 bg-slate-50/80 dark:bg-gray-900/60 border-r border-slate-200 dark:border-gray-800 p-2 space-y-1 text-xs">
            <div class="px-2 py-1.5 text-[10px] uppercase font-normal text-slate-400 dark:text-gray-500 tracking-wider">
              Settings Categories
            </div>
            <button 
              @click="activeTab = 'preferences'"
              :class="activeTab === 'preferences' ? 'bg-[#107c41] text-white border-[#107c41]' : 'bg-transparent text-slate-700 dark:text-gray-300 border-transparent hover:bg-slate-200 dark:hover:bg-gray-800'"
              class="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border"
            >
              <span>🏪</span>
              <span>Store Preferences</span>
            </button>
            <button 
              @click="activeTab = 'security'"
              :class="activeTab === 'security' ? 'bg-[#107c41] text-white border-[#107c41]' : 'bg-transparent text-slate-700 dark:text-gray-300 border-transparent hover:bg-slate-200 dark:hover:bg-gray-800'"
              class="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border mt-1"
            >
              <span>🔒</span>
              <span>Account & Security</span>
            </button>
            <button 
              @click="activeTab = 'billing'; fetchTenantBillingHistory();"
              :class="activeTab === 'billing' ? 'bg-[#107c41] text-white border-[#107c41]' : 'bg-transparent text-slate-700 dark:text-gray-300 border-transparent hover:bg-slate-200 dark:hover:bg-gray-800'"
              class="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border mt-1"
            >
              <span>💳</span>
              <span>Billing & Plan History</span>
            </button>
          </div>

          <div class="md:col-span-9 lg:col-span-9 p-5 text-xs font-sans bg-white dark:bg-gray-950">
            <div v-if="toastMessage" class="mb-4 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 text-xs flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>✅</span>
                <span>{{ toastMessage }}</span>
              </div>
              <button @click="toastMessage = ''" class="text-emerald-700 font-normal cursor-pointer">✕</button>
            </div>

            <div v-if="activeTab === 'preferences'" class="space-y-4 max-w-2xl">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2">
                <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚙️</span> Store Preferences
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Configure your store's specific timezone, currency, and theme.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Store Currency Symbol</label>
                  <input v-model="settings.currencySymbol" type="text" placeholder="e.g. $, ৳, £, €"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Store Timezone</label>
                  <select v-model="settings.timezone"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                    <option value="">-- Use System Default --</option>
                    <option value="Asia/Dhaka">UTC+6 (Dhaka / Central Asia)</option>
                    <option value="Europe/London">UTC+0 (GMT / London)</option>
                    <option value="America/New_York">UTC-5 (EST / New York)</option>
                    <option value="Asia/Singapore">UTC+8 (Singapore / Beijing)</option>
                    <option value="Asia/Kolkata">UTC+5:30 (IST / New Delhi)</option>
                  </select>
                </div>
                
                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Project Main Color</label>
                  <div class="flex items-center gap-2">
                    <input type="color" v-model="settings.themeColor" class="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-gray-700 p-0.5 bg-white dark:bg-gray-900" />
                    <span class="text-xs font-mono text-slate-500">{{ settings.themeColor || '#107c41' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Tab -->
            <div v-if="activeTab === 'security'" class="space-y-4 max-w-2xl">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2">
                <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔒</span> Account & Security
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Change your login password to secure your account.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="md:col-span-2">
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Current Password *</label>
                  <input v-model="security.currentPassword" type="password" placeholder="Enter current password"
                    class="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>

                <div class="md:col-span-2">
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">New Password *</label>
                  <input v-model="security.newPassword" type="password" placeholder="Enter new password"
                    class="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Confirm New Password *</label>
                  <input v-model="security.confirmPassword" type="password" placeholder="Confirm new password"
                    class="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>
              </div>
            </div>

            <!-- Save Action Area (For Preferences & Security Tabs) -->
            <div v-if="activeTab !== 'billing'" class="mt-8 pt-4 border-t border-slate-200 dark:border-gray-800 flex justify-end">
              <button @click="saveSettings" :disabled="isSaving"
                class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-5 py-2 text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all rounded-sm">
                <span v-if="isSaving" class="animate-spin text-xs">⏳</span>
                <span v-else class="text-xs">💾</span>
                <span>{{ isSaving ? 'Saving...' : (activeTab === 'security' ? 'Update Password' : 'Save Configuration') }}</span>
              </button>
            </div>

            <!-- Billing & Subscription History Tab -->
            <div v-else-if="activeTab === 'billing'" class="space-y-4">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2 flex items-center justify-between">
                <div>
                  <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💳</span> Store Billing & Subscription History
                  </h3>
                  <p class="text-slate-500 text-[11px] mt-0.5">
                    View your store's active subscription, invoices, and transaction records.
                  </p>
                </div>
                <NuxtLink to="/subscribe" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs">
                  Renew Plan 🚀
                </NuxtLink>
              </div>

              <!-- Billing History Table -->
              <div class="overflow-x-auto border border-slate-200 dark:border-gray-800 rounded">
                <table class="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-400 font-semibold text-[10px] uppercase border-b border-slate-200 dark:border-gray-800">
                      <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">Invoice No</th>
                      <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">Plan Name</th>
                      <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">Amount</th>
                      <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">Gateway</th>
                      <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">Trx ID</th>
                      <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">Status</th>
                      <th class="py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-gray-800">
                    <tr v-if="loadingBilling" class="text-center">
                      <td colspan="7" class="py-6 text-slate-400">Loading your store billing history...</td>
                    </tr>
                    <tr v-else-if="tenantBillings.length === 0" class="text-center">
                      <td colspan="7" class="py-6 text-slate-400">No payment or billing records found for this store.</td>
                    </tr>
                    <tr v-for="item in tenantBillings" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-gray-900/50">
                      <td class="py-2 px-3 font-mono font-bold text-slate-800 dark:text-gray-200 border-r border-slate-200 dark:border-gray-800">{{ item.invoice_no || ('INV-' + item.id) }}</td>
                      <td class="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-gray-800">{{ item.plan_name || 'Subscription Plan' }}</td>
                      <td class="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-gray-800">{{ settings.currencySymbol || '৳' }}{{ item.amount }}</td>
                      <td class="py-2 px-3 uppercase font-mono text-[11px] border-r border-slate-200 dark:border-gray-800">{{ item.gateway || 'bKash' }}</td>
                      <td class="py-2 px-3 font-mono text-xs font-bold text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">{{ item.trx_no || item.transaction_no || '-' }}</td>
                      <td class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">
                        <span class="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400">
                          {{ item.status || 'paid' }}
                        </span>
                      </td>
                      <td class="py-2 px-3 text-slate-500 text-[11px] font-mono">{{ item.created_at ? new Date(item.created_at).toLocaleDateString() : '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useSettingsStore } from '~/stores/settings';

const settingsStore = useSettingsStore();
const isSaving = ref(false);
const toastMessage = ref('');
const activeTab = ref('preferences');
const tenantBillings = ref<any[]>([]);
const loadingBilling = ref(false);

const fetchTenantBillingHistory = async () => {
  loadingBilling.value = true;
  try {
    const res = await axios.get('/super-admin/payments');
    if (res.data && res.data.payments) {
      tenantBillings.value = res.data.payments;
    }
  } catch (err) {
    console.error('Fetch billing history error:', err);
  } finally {
    loadingBilling.value = false;
  }
};

const settings = ref({
  currencySymbol: '',
  timezone: '',
  themeColor: '#107c41'
});

const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const loadSettings = async () => {
  await settingsStore.fetchTenantSettings();
  settings.value.currencySymbol = settingsStore.tenantSettings.currencySymbol || '';
  settings.value.timezone = settingsStore.tenantSettings.timezone || '';
  settings.value.themeColor = settingsStore.tenantSettings.themeColor || '#107c41';
};

const saveSettings = async () => {
  if (activeTab.value === 'security') {
    await updatePassword();
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      currencySymbol: settings.value.currencySymbol,
      timezone: settings.value.timezone,
      themeColor: settings.value.themeColor
    };

    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Add active tenant header if applicable
    const activeStore = localStorage.getItem('active_tenant_store');
    if (activeStore) {
      try {
        const store = JSON.parse(activeStore);
        if (store && store.id) headers['x-tenant-id'] = String(store.id);
      } catch (e) {}
    }

    const res = await axios.post('/settings/tenant', { settings: payload }, { headers });
    
    if (res.data && res.data.success) {
      toastMessage.value = 'Settings saved successfully!';
      await settingsStore.fetchTenantSettings();
      setTimeout(() => toastMessage.value = '', 3000);
    } else {
      alert(res.data.message || 'Failed to save settings.');
    }
  } catch (err: any) {
    console.error('Save settings error:', err);
    alert(err.response?.data?.message || err.message || 'An error occurred.');
  } finally {
    isSaving.value = false;
  }
};

const updatePassword = async () => {
  if (!security.value.currentPassword || !security.value.newPassword || !security.value.confirmPassword) {
    alert('Please fill out all password fields.');
    return;
  }
  if (security.value.newPassword !== security.value.confirmPassword) {
    alert('New passwords do not match.');
    return;
  }

  isSaving.value = true;
  try {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await axios.put('http://localhost:5000/api/auth/change-password', {
      currentPassword: security.value.currentPassword,
      newPassword: security.value.newPassword
    }, { headers });

    if (res.data && res.data.success) {
      toastMessage.value = 'Password updated successfully!';
      security.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
      setTimeout(() => toastMessage.value = '', 3000);
    } else {
      alert(res.data.message || 'Failed to update password.');
    }
  } catch (err: any) {
    console.error('Password update error:', err);
    alert(err.response?.data?.message || err.message || 'An error occurred.');
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
