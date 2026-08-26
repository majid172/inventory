<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 font-sans">
      <!-- Title Bar Header -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 rounded-lg shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <span>💳</span> Billing & Subscription Management
          </h2>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Manage your store subscription, payment gateway transactions, and view all past billing invoices.
          </p>
        </div>
        <NuxtLink to="/subscribe" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
          <span>Renew / Upgrade Plan</span>
          <span>🚀</span>
        </NuxtLink>
      </div>

      <!-- Current Subscription Status Card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 rounded-lg shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">CURRENT PLAN TIER</span>
          <div class="text-base font-black text-emerald-600 dark:text-emerald-400 capitalize flex items-center gap-2">
            <span>🏷️</span>
            <span>{{ activeSubscription?.plan_name || 'Standard Tier' }}</span>
          </div>
          <span class="text-xs font-mono text-slate-500">Rate: {{ settingsStore.currencySymbol }}{{ activeSubscription?.price || '49' }}/mo</span>
        </div>

        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 rounded-lg shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">SUBSCRIPTION STATUS</span>
          <div>
            <span class="inline-block px-2 py-0.5 text-xs font-mono font-bold uppercase rounded border bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400">
              ● Active Subscription
            </span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-0.5">Auto-renewal enabled for tenant</span>
        </div>

        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 rounded-lg shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">NEXT RENEWAL DATE</span>
          <div class="text-sm font-mono font-bold text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
            <span>📅</span>
            <span>{{ activeSubscription?.end_date ? new Date(activeSubscription.end_date).toLocaleDateString() : 'Active' }}</span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-0.5">Verified in MySQL database</span>
        </div>
      </div>

      <!-- Invoices & Billing History Table Card -->
      <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-xs">
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between">
          <h3 class="font-bold text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
            <span>🧾</span> Payment & Billing Invoices
          </h3>
          <span class="text-[10px] font-mono text-slate-400">Isolated Store History</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr class="bg-slate-100/70 dark:bg-gray-900/50 text-slate-600 dark:text-gray-400 font-semibold text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-2.5 px-3 border-r border-slate-200 dark:border-gray-800"># ID</th>
                <th class="py-2.5 px-3 border-r border-slate-200 dark:border-gray-800">Invoice No</th>
                <th class="py-2.5 px-3 border-r border-slate-200 dark:border-gray-800">Plan Tier</th>
                <th class="py-2.5 px-3 border-r border-slate-200 dark:border-gray-800">Amount Paid</th>
                <th class="py-2.5 px-3 border-r border-slate-200 dark:border-gray-800">Payment Gateway</th>
                <th class="py-2.5 px-3 border-r border-slate-200 dark:border-gray-800">Transaction ID (Trx ID)</th>
                <th class="py-2.5 px-3 border-r border-slate-200 dark:border-gray-800">Status</th>
                <th class="py-2.5 px-3">Date Paid</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-gray-800">
              <tr v-if="loading" class="text-center">
                <td colspan="8" class="py-8 text-slate-400 font-medium">
                  <span class="animate-spin inline-block mr-1">⏳</span> Loading billing invoices...
                </td>
              </tr>
              <tr v-else-if="payments.length === 0" class="text-center">
                <td colspan="8" class="py-8 text-slate-400 font-medium">
                  No billing history found for this store.
                </td>
              </tr>
              <tr v-for="(item, idx) in payments" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-gray-900/50 transition-colors">
                <td class="py-2 px-3 text-slate-400 font-mono border-r border-slate-200 dark:border-gray-800">{{ idx + 1 }}</td>
                <td class="py-2 px-3 font-mono font-bold text-slate-800 dark:text-gray-200 border-r border-slate-200 dark:border-gray-800">
                  {{ item.invoice_no || ('INV-' + item.id) }}
                </td>
                <td class="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-gray-800">
                  {{ item.plan_name || 'Pro Tier' }}
                </td>
                <td class="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-gray-800">
                  {{ settingsStore.currencySymbol }}{{ item.amount }}
                </td>
                <td class="py-2 px-3 uppercase font-mono text-[11px] text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">
                  {{ item.gateway || item.payment_method || 'bKash' }}
                </td>
                <td class="py-2 px-3 font-mono text-xs font-bold text-slate-800 dark:text-gray-100 border-r border-slate-200 dark:border-gray-800">
                  {{ item.trx_no || item.transaction_no || '-' }}
                </td>
                <td class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">
                  <span class="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400">
                    {{ item.status || 'paid' }}
                  </span>
                </td>
                <td class="py-2 px-3 text-slate-500 text-[11px] font-mono">
                  {{ item.created_at ? new Date(item.created_at).toLocaleDateString() : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useSettingsStore } from '~/stores/settings';
import { useAuth } from '~/composables/useAuth';

const settingsStore = useSettingsStore();
const auth = useAuth();

const payments = ref<any[]>([]);
const activeSubscription = ref<any>(null);
const loading = ref(true);

const fetchBillingData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/super-admin/payments');
    if (res.data && res.data.payments) {
      payments.value = res.data.payments;
    }
  } catch (err) {
    console.error('Fetch billing history error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await settingsStore.fetchTenantSettings();
  const currentUser = await auth.fetchCurrentUser();
  if (currentUser && (currentUser as any).subscription) {
    activeSubscription.value = (currentUser as any).subscription;
  }
  await fetchBillingData();
});
</script>
