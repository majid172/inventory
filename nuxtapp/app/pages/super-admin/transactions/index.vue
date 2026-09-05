<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-3 font-sans select-none">
      
      <!-- Top Overview KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- KPI 1: Total Subscription Revenue -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-normal uppercase tracking-wider text-slate-500 dark:text-gray-400">Total Subscription Revenue</span>
            <span class="p-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-normal text-slate-900 dark:text-gray-100 font-mono">৳{{ totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">↑ SaaS Platform</span>
          </div>
          <p class="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">Lifetime collected from tenant subscriptions</p>
        </div>

        <!-- KPI 2: Successful Transactions -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-normal uppercase tracking-wider text-slate-500 dark:text-gray-400">Paid Invoices</span>
            <span class="p-1 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-normal text-slate-900 dark:text-gray-100 font-mono">{{ successCount }}</span>
            <span class="text-[10px] text-sky-600 dark:text-sky-400 font-medium">{{ ((successCount / (payments.length || 1)) * 100).toFixed(0) }}% Rate</span>
          </div>
          <p class="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">Successfully processed subscription payments</p>
        </div>

        <!-- KPI 3: Pending & Failed Payments -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-normal uppercase tracking-wider text-slate-500 dark:text-gray-400">Pending / Failed</span>
            <span class="p-1 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-normal text-slate-900 dark:text-gray-100 font-mono">{{ pendingCount + failedCount }}</span>
            <span class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{{ pendingCount }} Pending | {{ failedCount }} Failed</span>
          </div>
          <p class="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">Requires tenant follow-up or re-attempt</p>
        </div>

        <!-- KPI 4: Active Payment Methods -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-normal uppercase tracking-wider text-slate-500 dark:text-gray-400">MFS & Gateways</span>
            <span class="p-1 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </span>
          </div>
          <div class="mt-2 flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 font-medium">bKash</span>
            <span class="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 font-medium">Nagad</span>
            <span class="text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 font-medium">SSLCommerz</span>
            <span class="text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 font-medium">Cards</span>
          </div>
          <p class="text-[10px] text-slate-400 dark:text-gray-500 mt-1">Multi-tenant automated gateway logs</p>
        </div>
      </div>

      <!-- Main Desktop Application Database Data Grid Frame -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        
        <!-- Top Toolbar -->
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Left: Action / Controls -->
          <div class="flex items-center gap-2">
            <button @click="fetchPayments" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh Table
            </button>
            
            <div class="h-4 w-px bg-slate-200 dark:bg-gray-700 mx-1"></div>

            <!-- Gateway Filter -->
            <div class="flex items-center gap-1.5">
              <label class="text-[11px] text-slate-500 dark:text-gray-400 font-normal">Gateway:</label>
              <select v-model="selectedGateway" class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500">
                <option value="ALL">All Gateways</option>
                <option value="bkash">bKash MFS</option>
                <option value="nagad">Nagad MFS</option>
                <option value="sslcommerz">SSLCommerz</option>
                <option value="card">Credit / Debit Card</option>
                <option value="stripe">Stripe / International</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div class="flex items-center gap-1.5">
              <label class="text-[11px] text-slate-500 dark:text-gray-400 font-normal">Status:</label>
              <select v-model="selectedStatus" class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500">
                <option value="ALL">All Statuses</option>
                <option value="success">Paid / Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <!-- Right: Search Filter -->
          <div class="flex items-center gap-2">
            <label class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">SEARCH:</label>
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search tenant, invoice, Trx ID..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-emerald-500 w-56 sm:w-64" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-2 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal"># SL</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Trx No.</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Invoice #</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Pharmacy Store</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Subscription</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">Amount</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Gateway</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Status</th>
                <th class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Date & Time</th>
                <th class="py-2 px-3 text-center w-24 font-normal">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              <tr v-if="loading">
                <td colspan="10" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  <span class="inline-block animate-spin mr-2"></span> Loading subscription transactions from database...
                </td>
              </tr>

              <tr v-else-if="filteredPayments.length === 0">
                <td colspan="10" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No subscription payment transactions found in database.
                </td>
              </tr>

              <tr v-for="(row, idx) in filteredPayments" :key="row.id"
                @click="selectedRow = row.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                  selectedRow === row.id
                    ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                ]">
                
                <!-- SL -->
                <td class="py-2 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 text-slate-500 dark:text-gray-400">
                  {{ idx + 1 }}
                </td>

                <!-- Transaction No -->
                <td class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                  {{ row.trx_no || row.transaction_no || '-' }}
                </td>

                <!-- Invoice No -->
                <td class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-slate-800 dark:text-gray-200">
                  {{ row.invoice_no || '-' }}
                </td>

                <!-- Tenant Name -->
                <td class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-900 dark:text-gray-100">
                  <div>{{ row.tenant_name || `Tenant #${row.tenant_id}` }}</div>
                  <div v-if="row.tenant_domain" class="text-[10px] text-slate-400 font-mono">{{ row.tenant_domain }}</div>
                </td>

                <!-- Plan -->
                <td class="py-2 px-3 border-r border-slate-200 dark:border-gray-800">
                  <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300">
                    {{ row.plan_name || row.plan_id || 'Pro Tier' }}
                    <span class="ml-1 text-[9px] text-slate-400 uppercase font-mono">({{ row.billing_cycle || 'monthly' }})</span>
                  </span>
                </td>

                <!-- Amount -->
                <td class="py-2 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-mono font-medium text-slate-900 dark:text-gray-100">
                  ৳{{ Number(row.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </td>

                <!-- Gateway badge -->
                <td class="py-2 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span :class="getGatewayBadgeClass(row.gateway)">
                    {{ getGatewayLabel(row.gateway) }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-2 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span :class="getStatusBadgeClass(row.status)">
                    {{ (row.status || 'success').toUpperCase() }}
                  </span>
                </td>

                <!-- Date -->
                <td class="py-2 px-3 border-r border-slate-200 dark:border-gray-800 text-[11px] text-slate-600 dark:text-gray-400">
                  {{ formatDate(row.paid_at || row.created_at) }}
                </td>

                <!-- Actions -->
                <td class="py-2 px-3 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button v-if="row.status === 'pending'" @click="handleApprovePayment(row.id)"
                      class="px-2 py-0.5 text-[10px] font-medium text-white bg-[#107c41] hover:bg-[#0e6b37] border border-[#0e6b37] cursor-pointer shadow-2xs transition-colors"
                      title="Verify & Approve Payment">
                      ✓ Approve
                    </button>
                    <button v-if="row.status === 'pending'" @click="handleRejectPayment(row.id)"
                      class="px-2 py-0.5 text-[10px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 cursor-pointer shadow-2xs transition-colors"
                      title="Reject Payment Request">
                      ✕ Reject
                    </button>
                    <button @click="openInvoiceModal(row)"
                      class="px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 cursor-pointer shadow-2xs transition-colors"
                      title="View Invoice Receipt">
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div class="px-3 py-2 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 font-normal">
          <div>Displaying <strong>{{ filteredPayments.length }}</strong> SaaS subscription transaction records</div>
          <div class="text-[10px] text-slate-400 font-mono">
            Platform Gateway: <code>payments</code> table
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- INVOICE DETAILS MODAL -->
      <!-- ===================================================================== -->
      <div v-if="showInvoiceModal && selectedPayment"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-lg shadow-xl overflow-hidden">
          
          <!-- Titlebar -->
          <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-emerald-600 font-semibold">💳</span>
              <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
                Subscription Payment Receipt #{{ selectedPayment.invoice_no || selectedPayment.id }}
              </h3>
            </div>
            <button @click="showInvoiceModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer">✕</button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4 text-xs font-sans">
            <!-- Header -->
            <div class="flex justify-between items-start border-b border-slate-200 dark:border-gray-800 pb-3">
              <div>
                <h4 class="font-semibold text-slate-900 dark:text-white text-sm">PharmaCare SaaS Platform</h4>
                <p class="text-[11px] text-slate-500">Subscription & Licensing Department</p>
              </div>
              <div class="text-right">
                <span :class="getStatusBadgeClass(selectedPayment.status)">
                  {{ (selectedPayment.status || 'pending').toUpperCase() }}
                </span>
                <p class="text-[10px] text-slate-400 font-mono mt-1">Invoice: {{ selectedPayment.invoice_no }}</p>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-50 dark:bg-gray-900 p-2.5 border border-slate-200 dark:border-gray-800">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">Billed To (Tenant)</span>
                <strong class="text-slate-800 dark:text-gray-100 block text-xs mt-0.5">{{ selectedPayment.tenant_name }}</strong>
                <span class="text-[10px] text-slate-500 font-mono block">{{ selectedPayment.tenant_domain }}</span>
              </div>

              <div class="bg-slate-50 dark:bg-gray-900 p-2.5 border border-slate-200 dark:border-gray-800">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">Payment Gateway</span>
                <strong class="text-slate-800 dark:text-gray-100 block text-xs mt-0.5 capitalize">{{ getGatewayLabel(selectedPayment.gateway) }}</strong>
                <span class="text-[10px] text-slate-500 font-mono block">Ref: {{ selectedPayment.gateway_ref || 'N/A' }}</span>
              </div>
            </div>

            <!-- Line Items Table -->
            <div class="border border-slate-200 dark:border-gray-800">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-gray-900 text-slate-500 text-[10px] uppercase border-b border-slate-200 dark:border-gray-800">
                  <tr>
                    <th class="p-2 font-normal">Subscription Item</th>
                    <th class="p-2 font-normal text-center">Cycle</th>
                    <th class="p-2 font-normal text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="p-2 text-slate-800 dark:text-gray-200">
                      {{ selectedPayment.plan_name || 'Pro Tier Subscription' }}
                    </td>
                    <td class="p-2 text-center text-slate-500 capitalize">
                      {{ selectedPayment.billing_cycle || 'monthly' }}
                    </td>
                    <td class="p-2 text-right font-mono font-medium text-slate-900 dark:text-white">
                      ৳{{ Number(selectedPayment.amount || 0).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Transaction Date & Info -->
            <div class="flex justify-between items-center text-[11px] text-slate-500 dark:text-gray-400 pt-1">
              <span>Date: {{ formatDate(selectedPayment.paid_at || selectedPayment.created_at) }}</span>
              <span class="font-mono">Currency: {{ selectedPayment.currency || 'BDT' }}</span>
            </div>

            <!-- Footer Action -->
            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button @click="showInvoiceModal = false"
                class="px-4 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface PaymentRecord {
  id: number;
  tenant_id: number;
  tenant_name?: string;
  tenant_domain?: string;
  transaction_no?: string;
  amount: number;
  currency?: string;
  gateway: string;
  gateway_ref?: string;
  invoice_no?: string;
  plan_id?: string;
  plan_name?: string;
  billing_cycle?: string;
  status: string;
  paid_at?: string;
  created_at?: string;
}

const payments = ref<PaymentRecord[]>([]);
const loading = ref(false);
const filterText = ref('');
const selectedGateway = ref('ALL');
const selectedStatus = ref('ALL');
const selectedRow = ref<number | null>(null);

const showInvoiceModal = ref(false);
const selectedPayment = ref<PaymentRecord | null>(null);

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (process.client) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const fetchPayments = async () => {
  loading.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/payments', {
      headers: getHeaders()
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.payments)) {
      payments.value = data.payments;
    }
  } catch (e) {
    console.error('Failed to fetch payments:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPayments();
});

const totalRevenue = computed(() => {
  return payments.value
    .filter(p => p.status === 'success' || p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
});

const successCount = computed(() => {
  return payments.value.filter(p => p.status === 'success' || p.status === 'paid').length;
});

const pendingCount = computed(() => {
  return payments.value.filter(p => p.status === 'pending').length;
});

const failedCount = computed(() => {
  return payments.value.filter(p => p.status === 'failed').length;
});

const filteredPayments = computed(() => {
  const query = filterText.value.toLowerCase().trim();
  return payments.value.filter(p => {
    // Gateway filter
    if (selectedGateway.value !== 'ALL') {
      const g = (p.gateway || '').toLowerCase();
      if (selectedGateway.value === 'bkash' && !g.includes('bkash')) return false;
      if (selectedGateway.value === 'nagad' && !g.includes('nagad')) return false;
      if (selectedGateway.value === 'sslcommerz' && !g.includes('ssl')) return false;
      if (selectedGateway.value === 'card' && !g.includes('card') && !g.includes('visa')) return false;
      if (selectedGateway.value === 'stripe' && !g.includes('stripe')) return false;
    }

    // Status filter
    if (selectedStatus.value !== 'ALL') {
      const s = (p.status || '').toLowerCase();
      if (selectedStatus.value === 'success' && s !== 'success' && s !== 'paid') return false;
      if (selectedStatus.value === 'pending' && s !== 'pending') return false;
      if (selectedStatus.value === 'failed' && s !== 'failed') return false;
    }

    // Search query filter
    if (query) {
      const tenantName = (p.tenant_name || '').toLowerCase();
      const invoiceNo = (p.invoice_no || '').toLowerCase();
      const trxNo = (p.transaction_no || '').toLowerCase();
      const gatewayRef = (p.gateway_ref || '').toLowerCase();
      const planName = (p.plan_name || '').toLowerCase();
      return tenantName.includes(query) || invoiceNo.includes(query) || trxNo.includes(query) || gatewayRef.includes(query) || planName.includes(query);
    }

    return true;
  });
});

const getGatewayLabel = (gw: string) => {
  if (!gw) return 'MFS Gateway';
  const g = gw.toLowerCase();
  if (g.includes('bkash')) return 'bKash MFS';
  if (g.includes('nagad')) return 'Nagad MFS';
  if (g.includes('ssl')) return 'SSLCommerz';
  if (g.includes('card') || g.includes('visa')) return 'Credit / Debit Card';
  if (g.includes('stripe')) return 'Stripe International';
  return gw;
};

const getGatewayBadgeClass = (gw: string) => {
  if (!gw) return 'bg-slate-100 text-slate-700 border-slate-200';
  const g = gw.toLowerCase();
  if (g.includes('bkash')) return 'bg-pink-50 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border border-pink-200 dark:border-pink-800 px-2 py-0.5 text-[10px] font-semibold';
  if (g.includes('nagad')) return 'bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-2 py-0.5 text-[10px] font-semibold';
  if (g.includes('ssl')) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-semibold';
  if (g.includes('card')) return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-semibold';
  return 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 text-[10px]';
};

const getStatusBadgeClass = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'success' || s === 'paid') return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800 text-[10px] font-medium';
  if (s === 'pending') return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 border border-amber-200 dark:border-amber-800 text-[10px] font-medium';
  return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 border border-rose-200 dark:border-rose-800 text-[10px] font-medium';
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr;
  }
};

const openInvoiceModal = (payment: PaymentRecord) => {
  selectedPayment.value = payment;
  showInvoiceModal.value = true;
};

const handleApprovePayment = async (id: number) => {
  if (!confirm('Are you sure you want to verify and approve this subscription payment? Store access will be reactivated.')) return;
  loading.value = true;
  try {
    const res = await fetch(`http://localhost:5000/api/super-admin/billings/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders()
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(data.message || 'Payment approved successfully!');
      await fetchPayments();
    } else {
      alert(data.message || 'Failed to approve payment.');
    }
  } catch (err: any) {
    console.error('Approve payment error:', err);
    alert('Network error approving payment.');
  } finally {
    loading.value = false;
  }
};

const handleRejectPayment = async (id: number) => {
  if (!confirm('Are you sure you want to reject this payment request?')) return;
  loading.value = true;
  try {
    const res = await fetch(`http://localhost:5000/api/super-admin/billings/${id}/reject`, {
      method: 'PUT',
      headers: getHeaders()
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(data.message || 'Payment request rejected.');
      await fetchPayments();
    } else {
      alert(data.message || 'Failed to reject payment.');
    }
  } catch (err: any) {
    console.error('Reject payment error:', err);
    alert('Network error rejecting payment.');
  } finally {
    loading.value = false;
  }
};
</script>
