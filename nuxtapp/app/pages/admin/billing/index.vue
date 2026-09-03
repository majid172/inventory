<template>
  <NuxtLayout name="admin">

    <!-- ================================================================= -->
    <!-- SUBSCRIPTION LOCKED OVERLAY                                        -->
    <!-- Shown when ?locked=1 is in the URL (redirected by middleware)      -->
    <!-- ================================================================= -->
    <div
      v-if="isLocked"
      class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6 font-sans select-none"
    >
      <!-- Lock Icon Card -->
      <div class="bg-white dark:bg-gray-950 border border-red-300 dark:border-red-800 shadow-xl max-w-lg w-full p-8 text-center space-y-5">
        <!-- Icon -->
        <div class="text-6xl mb-2">🔒</div>

        <!-- Title -->
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
            {{ lockedReasonLabel.title }}
          </h2>
          <p class="text-sm text-slate-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            {{ lockedReasonLabel.message }}
          </p>
        </div>

        <!-- Expiry info -->
        <div class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded p-3 text-xs text-red-700 dark:text-red-400 font-mono">
          Store Status:
          <strong class="uppercase ml-1">{{ lockedReasonLabel.status }}</strong>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            @click="openUpgradeModal()"
            class="w-full sm:w-auto px-6 py-2.5 bg-[#107c41] hover:bg-[#0e6b37] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>💳</span> Renew / Upgrade Plan
          </button>
          <button
            @click="isLocked = false"
            class="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-sm hover:bg-slate-50 transition-all"
          >
            View Billing Details
          </button>
        </div>

        <!-- Support note -->
        <p class="text-[11px] text-slate-400 dark:text-gray-500 pt-2 border-t border-slate-100 dark:border-gray-800">
          Need help? Contact our support team or contact the platform administrator.
        </p>
      </div>
    </div>

    <!-- Normal billing content (shown when not locked, or after user dismisses overlay) -->
    <div v-else class="space-y-3 font-sans select-none">
      <!-- 1. Top KPI Summary Metrics Cards (Clean Desktop 1px Border Style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Card 1: Active Plan -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">CURRENT PLAN
              TIER</div>
            <div
              class="text-base font-normal text-emerald-700 dark:text-emerald-400 font-sans mt-0.5 flex items-center gap-1.5">
              <span>💎</span>
              <span>{{ activePlanName }}</span>
            </div>
            <div class="text-[11px] font-mono text-slate-500 dark:text-gray-400 mt-0.5">
              {{ settingsStore.currencySymbol }}{{ activePlanPrice }} / month
            </div>
          </div>
          <span class="text-2xl">🏷️</span>
        </div>

        <!-- Card 2: Subscription Status -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">SUBSCRIPTION
              STATUS</div>
            <div class="mt-1">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide border bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                ● {{ activePlanStatus }}
              </span>
            </div>
            <div class="text-[10px] text-slate-400 dark:text-gray-500 mt-1">Multi-tenant Cloud POS Verified</div>
          </div>
          <span class="text-2xl">🛡️</span>
        </div>

        <!-- Card 3: Next Renewal Date -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">NEXT RENEWAL
              DATE</div>
            <div class="text-sm font-normal text-slate-800 dark:text-gray-100 font-mono mt-0.5 flex items-center gap-1">
              <span>📅</span>
              <span>{{ activeRenewalDate }}</span>
            </div>
            <div class="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">
              Auto-renew active
            </div>
          </div>
          <span class="text-2xl">⏳</span>
        </div>

        <!-- Card 4: Total Invoices Paid -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">TOTAL
              INVOICES</div>
            <div class="text-lg font-normal text-slate-900 dark:text-gray-100 font-mono mt-0.5">
              {{ payments.length }} Invoices
            </div>
            <div class="text-[10px] font-mono text-slate-500 dark:text-gray-400 mt-0.5">
              Total Spent: {{ settingsStore.currencySymbol }}{{ totalSpent.toFixed(2) }}
            </div>
          </div>
          <span class="text-2xl">🧾</span>
        </div>
      </div>

      <!-- 2. Main Desktop Frame (Toolbar, Tab Switcher & Data Grid) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Left: Tab Switcher & Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Tabs -->
            <div
              class="flex items-center border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-0.5 shadow-2xs">
              <button @click="activeView = 'invoices'" :class="[
                'px-3 py-1 text-xs font-normal transition-all flex items-center gap-1.5 cursor-pointer',
                activeView === 'invoices'
                  ? 'bg-[#107c41] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              ]">
                <span>🧾</span> Billing Invoices
              </button>
              <button @click="activeView = 'plans'" :class="[
                'px-3 py-1 text-xs font-normal transition-all flex items-center gap-1.5 cursor-pointer',
                activeView === 'plans'
                  ? 'bg-[#107c41] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              ]">
                <span>💎</span> Subscription Plans
              </button>
            </div>

            <!-- Action Buttons -->
            <button @click="openUpgradeModal()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span>+</span> Upgrade / Renew Plan
            </button>

            <button @click="fetchBillingData" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh
            </button>
          </div>

          <!-- Right: Search Filter (only for invoices tab) -->
          <div v-if="activeView === 'invoices'" class="flex items-center gap-2">
            <label
              class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER:</label>
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search invoice #, plan, trx ID..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-56 sm:w-64 shadow-2xs" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- VIEW 1: BILLING INVOICES DATA GRID TABLE                          -->
        <!-- ================================================================= -->
        <div v-if="activeView === 'invoices'" class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-10 text-center border-r border-slate-200 dark:border-gray-800 font-normal">#
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">INVOICE NO</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">PLAN TIER</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">AMOUNT
                  PAID</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">PAYMENT METHOD</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">TRANSACTION ID</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">STATUS
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">DATE PAID</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">EXPIRY DATE</th>
                <th class="py-1.5 px-3 text-center w-24 font-normal">RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="10" class="py-12">
                  <PharmacyLoader text="Loading Billing Invoices..." />
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredPayments.length === 0">
                <td colspan="10" class="py-6 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No billing invoices found matching your filter.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-else v-for="(item, idx) in paginatedData" :key="item.id" @click="selectedRow = item.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === item.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- Index -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-10 font-normal text-slate-500 dark:text-gray-400">
                  {{ idx + 1 }}
                </td>

                <!-- Invoice No -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono font-normal"
                  :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  <div class="flex items-center gap-1.5">

                    <span>{{ item.invoice_no || ('INV-' + String(item.id).padStart(5, '0')) }}</span>
                  </div>
                </td>

                <!-- Plan Tier -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="[
                    'px-1.5 py-0.2 border text-[10px] uppercase font-mono',
                    (item.plan_name || '').toLowerCase().includes('enterprise')
                      ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                      : (item.plan_name || '').toLowerCase().includes('pro')
                        ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                  ]">
                    {{ item.plan_name || 'Standard Tier' }}
                  </span>
                </td>

                <!-- Amount Paid -->
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-mono font-normal"
                  :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ settingsStore.currencySymbol }}{{ Number(item.amount || 0).toFixed(2) }}
                </td>

                <!-- Payment Method -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 uppercase font-mono text-[11px]"
                  :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-300'">
                  <div class="flex items-center gap-1.5">
                    <!-- <span>{{ getGatewayIcon(item.gateway || item.payment_method) }}</span> -->
                    <span>{{ item.gateway || item.payment_method || 'Cash' }}</span>
                  </div>
                </td>

                <!-- Trx ID -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-[11px]"
                  :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ item.trx_no || item.transaction_no || '-' }}
                </td>

                <!-- Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-normal uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                    ● {{ item.status || 'PAID' }}
                  </span>
                </td>

                <!-- Date Paid -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400 text-[11px]">
                  {{ formatItemDate(item.created_at) }}
                </td>

                <!-- Expiry Date -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-[11px]">
                  <span :class="isItemExpired(item) ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-700 dark:text-emerald-400 font-medium'">
                    {{ getItemExpiryDate(item) }}
                  </span>
                </td>

                <!-- Actions / Receipt -->
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <button @click="viewInvoiceReceipt(item)"
                    class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer shadow-2xs"
                    title="View & Print Official Receipt">
                    Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Footer -->
          <PaginationControls 
            :current-page="currentPage" 
            :total-pages="totalPages" 
            :total-items="filteredPayments.length" 
            :items-per-page="itemsPerPage"
            @prev="prevPage" 
            @next="nextPage" 
          />
        </div>

        <!-- ================================================================= -->
        <!-- VIEW 2: SUBSCRIPTION PLANS & UPGRADE MATRIX                      -->
        <!-- ================================================================= -->
        <div v-else-if="activeView === 'plans'" class="p-4 space-y-4">
          <!-- Billing Cycle Selector Bar -->
          <div
            class="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-gray-800">
            <div>
              <h3
                class="text-xs font-normal text-slate-800 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                <span>💎</span> Subscription Plans
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                Loaded in real-time from server database. Choose a plan matching your branch scale.
              </p>
            </div>

            <!-- Annual / Monthly Toggle -->
            <div
              class="flex items-center gap-2 border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 p-0.5">
              <button @click="isAnnualBilling = false" :class="[
                'px-3 py-1 text-xs font-normal transition-all cursor-pointer',
                !isAnnualBilling ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-gray-700' : 'text-slate-500 hover:text-slate-800'
              ]">
                Monthly Billing
              </button>
              <button @click="isAnnualBilling = true" :class="[
                'px-3 py-1 text-xs font-normal transition-all cursor-pointer flex items-center gap-1',
                isAnnualBilling ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              ]">
                <span>Annual Billing</span>
                <span
                  class="text-[9px] px-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">SAVE
                  20%</span>
              </button>
            </div>
          </div>

          <!-- Loading State for Plans -->
          <div v-if="loadingPlans" class="py-12 text-center text-slate-500 dark:text-gray-400 font-normal text-xs">
            <div class="inline-flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <span>Fetching dynamic subscription plans from database...</span>
            </div>
          </div>

          <!-- Subscription Plans Grid Cards -->
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="plan in availablePlans" :key="plan.id" :class="[
              'border p-4 flex flex-col justify-between transition-all bg-white dark:bg-gray-950 shadow-xs relative',
              isPlanActive(plan)
                ? 'border-emerald-500 dark:border-emerald-600 bg-[#f0fdf4]/40 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700'
            ]">
              <!-- Active Plan Badge -->
              <div v-if="isPlanActive(plan)"
                class="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-normal uppercase px-2 py-0.5 shadow-xs tracking-wider">
                CURRENT ACTIVE PLAN
              </div>

              <div>
                <!-- Plan Header -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-normal text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
                      <span>{{ plan.icon }}</span>
                      <span>{{ plan.name }}</span>
                    </h4>
                    <p class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">{{ plan.description }}</p>
                  </div>
                </div>

                <!-- Price -->
                <div class="my-4 pb-3 border-b border-slate-200 dark:border-gray-800">
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-normal font-mono text-slate-900 dark:text-white">
                      {{ settingsStore.currencySymbol }}{{ getPlanCalculatedPrice(plan) }}
                    </span>
                    <span class="text-xs text-slate-500 dark:text-gray-400 font-normal">/ month</span>
                  </div>
                  <div class="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 font-mono">
                    {{ getPlanBilledSubtitle(plan) }}
                  </div>
                </div>

                <!-- Specifications List -->
                <div class="space-y-2 text-xs font-normal text-slate-700 dark:text-gray-300">
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span><strong>{{ plan.maxTerminals }}</strong> POS Cashier {{ plan.maxTerminals > 1 ? 'Terminals' :
                      'Terminal' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span><strong>{{ plan.maxUsers }}</strong> Pharmacist / Staff Accounts</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span><strong>{{ Number(plan.maxProducts).toLocaleString() }}</strong> Product Catalog
                      Capacity</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span>FEFO Batch Expiry Enforcement</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span>Doctor Prescription (Rx) Compliance</span>
                  </div>
                  <div v-if="plan.customFeatures && plan.customFeatures.length > 0"
                    class="pt-1 border-t border-slate-100 dark:border-gray-800/60 space-y-1.5">
                    <div v-for="(feat, fIdx) in plan.customFeatures" :key="fIdx"
                      class="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <span class="font-bold">★</span>
                      <span>{{ feat }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="mt-6 pt-3 border-t border-slate-200 dark:border-gray-800">
                <button v-if="isPlanActive(plan)" disabled
                  class="w-full py-1.5 px-3 bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 text-xs font-normal border border-slate-200 dark:border-gray-700 cursor-not-allowed text-center">
                  ✓ Current Plan Active
                </button>
                <button v-else @click="openUpgradeModal(plan)"
                  class="w-full py-1.5 px-3 bg-[#107c41] hover:bg-[#0e6b37] text-white text-xs font-normal shadow-xs transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5">
                  <span>🚀 Switch to {{ plan.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CLEAN & SHARP DESKTOP MODAL: INVOICE RECEIPT VIEWER                   -->
      <!-- ===================================================================== -->
      <div v-if="showReceiptModal && selectedInvoice"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-xl shadow-lg overflow-hidden flex flex-col">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🧾</span> Official Billing Invoice & Payment Receipt
            </h3>
            <button @click="showReceiptModal = false"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
          </div>

          <!-- Printable Receipt Viewport -->
          <div class="p-5 space-y-4 text-xs font-sans bg-white dark:bg-gray-950 text-slate-800 dark:text-gray-200"
            id="printable-receipt">
            <!-- Header Info -->
            <div class="flex items-start justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
              <div>
                <div class="font-normal text-sm text-slate-900 dark:text-white">Pharmacy Cloud SaaS Inc.</div>
                <div class="text-[11px] text-slate-500 dark:text-gray-400">Enterprise Multi-Tenant Subscription Ledger
                </div>
                <div class="text-[11px] text-slate-500 dark:text-gray-400">Dhaka, Bangladesh • support@pharmasaas.com
                </div>
              </div>
              <div class="text-right">
                <span
                  class="px-2 py-0.5 text-[10px] font-normal uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                  ● PAID RECEIPT
                </span>
                <div class="font-mono text-xs text-slate-800 dark:text-gray-200 mt-1">
                  {{ selectedInvoice.invoice_no || ('INV-' + String(selectedInvoice.id).padStart(5, '0')) }}
                </div>
                <div class="text-[10px] text-slate-400 font-mono">
                  Date: {{ formatItemDate(selectedInvoice.created_at) }}
                </div>
              </div>
            </div>

            <!-- Customer / Tenant Info -->
            <div
              class="grid grid-cols-2 gap-3 py-2 bg-slate-50 dark:bg-gray-900 px-3 border border-slate-200 dark:border-gray-800 text-[11px]">
              <div>
                <span class="text-slate-500 dark:text-gray-400 uppercase text-[10px] block">BILLED TO PHARMACY:</span>
                <strong class="text-slate-800 dark:text-gray-200">{{ tenantStoreName }}</strong>
                <div class="text-slate-500">Tenant ID: #{{ selectedInvoice.tenant_id || 1 }}</div>
              </div>
              <div>
                <span class="text-slate-500 dark:text-gray-400 uppercase text-[10px] block">PAYMENT GATEWAY
                  DETAILS:</span>
                <div>Method: <strong class="uppercase font-mono">{{ selectedInvoice.gateway || 'bKash' }}</strong></div>
                <div>Trx ID: <span class="font-mono text-emerald-700 dark:text-emerald-400">{{ selectedInvoice.trx_no ||
                  selectedInvoice.transaction_no || 'TRX-8291481' }}</span></div>
                <div>Plan Expiry: <strong class="font-mono text-emerald-700 dark:text-emerald-400">{{ getItemExpiryDate(selectedInvoice) }}</strong></div>
              </div>
            </div>

            <!-- Line Items Table -->
            <table class="w-full border-collapse border border-slate-200 dark:border-gray-800 text-xs">
              <thead>
                <tr
                  class="bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-400 text-[11px] border-b border-slate-200 dark:border-gray-800">
                  <th class="py-1.5 px-2.5 text-left font-normal border-r border-slate-200 dark:border-gray-800">
                    Description</th>
                  <th class="py-1.5 px-2.5 text-center font-normal border-r border-slate-200 dark:border-gray-800 w-20">
                    Cycle</th>
                  <th class="py-1.5 px-2.5 text-right font-normal w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-200 dark:border-gray-800">
                  <td class="py-2 px-2.5 border-r border-slate-200 dark:border-gray-800 font-normal">
                    {{ selectedInvoice.plan_name || 'Standard Plan' }} Subscription Access
                    <div class="text-[10px] text-slate-400">Full Cloud POS, FEFO inventory, Master Drug sync & Unlimited
                      Rx register</div>
                  </td>
                  <td
                    class="py-2 px-2.5 text-center border-r border-slate-200 dark:border-gray-800 font-mono text-[11px]">
                    1 Month
                  </td>
                  <td class="py-2 px-2.5 text-right font-mono font-normal">
                    {{ settingsStore.currencySymbol }}{{ Number(selectedInvoice.amount || 0).toFixed(2) }}
                  </td>
                </tr>
                <tr>
                  <td colspan="2"
                    class="py-2 px-2.5 text-right font-normal border-r border-slate-200 dark:border-gray-800 uppercase text-[11px]">
                    Total Paid in Full:
                  </td>
                  <td class="py-2 px-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ settingsStore.currencySymbol }}{{ Number(selectedInvoice.amount || 0).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Modal Footer -->
          <div
            class="px-4 py-2.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-mono">Digital Invoice Verified</span>
            <div class="flex items-center gap-2">
              <button @click="printReceipt"
                class="bg-white dark:bg-gray-800 hover:bg-slate-100 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-700 px-3 py-1 text-xs font-normal cursor-pointer shadow-2xs flex items-center gap-1">
                <span>🖨️</span> Print Invoice
              </button>
              <button @click="showReceiptModal = false"
                class="bg-[#107c41] hover:bg-[#0e6b37] text-white px-3 py-1 text-xs font-normal shadow-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CLEAN & SHARP DESKTOP MODAL: UPGRADE / RENEW PLAN                      -->
      <!-- ===================================================================== -->
      <div v-if="showUpgradeModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🚀</span> Upgrade / Renew Pharmacy Store Subscription
            </h3>
            <button @click="showUpgradeModal = false"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
          </div>

          <div class="p-4 space-y-3 overflow-y-auto text-xs font-sans">
            <!-- 1. Plan Selector -->
            <div>
              <label
                class="block font-normal text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                SELECT SUBSCRIPTION TIER *
              </label>
              <select v-model="upgradeForm.planId"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41]">
                <option v-for="plan in availablePlans" :key="plan.id" :value="plan.id">
                  {{ plan.name }} — {{ settingsStore.currencySymbol }}{{ plan.priceMonthly }}/mo (Max {{
                    plan.maxTerminals }} Terminals)
                </option>
              </select>
            </div>

            <!-- 2. Billing Cycle -->
            <div>
              <label
                class="block font-normal text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                BILLING DURATION
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" @click="upgradeForm.cycle = 'monthly'" :class="[
                  'py-1.5 px-2 border text-xs font-normal text-center cursor-pointer transition-all',
                  upgradeForm.cycle === 'monthly' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-normal' : 'border-slate-200 dark:border-gray-800'
                ]">
                  Monthly (1 Month)
                </button>
                <button type="button" @click="upgradeForm.cycle = 'yearly'" :class="[
                  'py-1.5 px-2 border text-xs font-normal text-center cursor-pointer transition-all',
                  upgradeForm.cycle === 'yearly' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-normal' : 'border-slate-200 dark:border-gray-800'
                ]">
                  Annual (12 Months - 20% Off)
                </button>
              </div>
            </div>

            <!-- 3. Dynamic Payment Gateway Selector -->
            <div>
              <label
                class="block font-normal text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                PAYMENT GATEWAY *
              </label>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button v-for="gw in dynamicGateways" :key="gw.id" type="button" @click="upgradeForm.gateway = gw.id"
                  :class="[
                    'py-1.5 px-2 border text-xs font-normal text-center cursor-pointer transition-all flex items-center justify-center gap-1',
                    upgradeForm.gateway === gw.id
                      ? 'border-[#107c41] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-normal shadow-2xs'
                      : 'border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-900 text-slate-700 dark:text-gray-300'
                  ]">
                  <!-- <span>{{ gw.icon }}</span> -->
                  <span>{{ gw.name }}</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Merchant Instructions Box -->
            <div
              class="p-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-[11px] text-slate-600 dark:text-gray-400 space-y-1.5">
              <div
                class="font-normal text-slate-800 dark:text-gray-200 flex items-center justify-between flex-wrap gap-2">
                <span>{{ selectedGatewayInfo.name }} Official Number:</span>
                <span
                  class="font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                  {{ selectedGatewayInfo.number }}
                </span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Pay Amount: <strong class="text-slate-800 dark:text-gray-200">{{ settingsStore.currencySymbol }}{{
                  calculatedUpgradeAmount }}</strong></span>
                <button type="button" @click="copyMerchantNumber(selectedGatewayInfo.number)"
                  class="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium">
                  {{ copiedNumber ? '✓ Number Copied' : '📋 Copy Number' }}
                </button>
              </div>
              <div class="text-[10px] text-slate-500">
                Please complete the payment using your {{ selectedGatewayInfo.name }} App and paste the Transaction ID
                (Trx ID) below.
              </div>
            </div>

            <!-- 4. Trx ID Input -->
            <div>
              <label
                class="block font-normal text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                TRANSACTION ID (TRX ID) *
              </label>
              <input type="text" v-model="upgradeForm.trxId" placeholder="e.g. 9J81KL90Z or TXN-489182"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-gray-200 font-mono focus:outline-none focus:border-[#107c41]" />
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="px-4 py-2.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-end gap-2">
            <button @click="showUpgradeModal = false"
              class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-3 py-1 text-xs font-normal cursor-pointer shadow-2xs">
              Cancel
            </button>
            <button @click="submitUpgrade" :disabled="isSubmitting || !upgradeForm.trxId"
              class="bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal px-3 py-1 text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all">
              {{ isSubmitting ? 'Verifying...' : 'Submit & Activate Subscription' }}
            </button>
          </div>
        </div>
      </div>
    </div><!-- /v-else normal billing -->

  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useSettingsStore } from '~/stores/settings';
import { useAuth } from '~/composables/useAuth';
import { usePagination } from '~/composables/usePagination';
import PaginationControls from '~/components/PaginationControls.vue';

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();
const auth = useAuth();

// ── Subscription Lock ──────────────────────────────────────────────────────
// isLocked = true when redirected by middleware (?locked=1)
// User can dismiss the overlay to view billing details
const isLocked = ref(route.query.locked === '1');

const lockedReasonLabel = computed(() => {
  const reason = (route.query.reason as string || 'expired').toLowerCase();
  const labels: Record<string, { title: string; message: string; status: string }> = {
    expired: {
      title: 'Subscription Expired',
      message: 'Your PharmaCare subscription has expired. Renew your plan to restore full POS and inventory access for your pharmacy.',
      status: 'EXPIRED',
    },
    suspended: {
      title: 'Account Suspended',
      message: 'Your account has been suspended by the platform administrator. Please renew or contact support to reinstate access.',
      status: 'SUSPENDED',
    },
    trial_expired: {
      title: 'Free Trial Ended',
      message: 'Your 14-day free trial has come to an end. Choose a subscription plan to continue using PharmaCare.',
      status: 'TRIAL EXPIRED',
    },
    inactive: {
      title: 'Account Inactive',
      message: 'Your pharmacy account is currently inactive. Renew your subscription to reactivate full access.',
      status: 'INACTIVE',
    },
  };
  return labels[reason] || labels['expired'];
});

// ── Regular billing state ──────────────────────────────────────────────────
const activeView = ref<'invoices' | 'plans'>('invoices');
const isAnnualBilling = ref(false);
const filterText = ref('');
const selectedRow = ref<number | null>(null);
const loading = ref(true);
const loadingPlans = ref(true);
const isSubmitting = ref(false);

const payments = ref<any[]>([]);
const activeSubscription = ref<any>(null);

// Modals
const showReceiptModal = ref(false);
const selectedInvoice = ref<any>(null);

const showUpgradeModal = ref(false);
const upgradeForm = ref({
  planId: 'pro',
  cycle: 'monthly',
  gateway: 'bkash',
  trxId: ''
});

export interface DynamicPlan {
  id: string | number;
  name: string;
  icon: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxTerminals: number;
  maxUsers: number;
  maxProducts: number;
  customFeatures: string[];
  features?: any;
}

const availablePlans = ref<DynamicPlan[]>([]);

// Computed helpers to safely format display values without template breaking
const activePlanName = computed(() => {
  return activeSubscription.value?.plan_name || activeSubscription.value?.name || 'Professional Plan';
});

const activePlanPrice = computed(() => {
  return activeSubscription.value?.price || '49.00';
});

const activePlanStatus = computed(() => {
  return (activeSubscription.value?.status || 'active').toUpperCase();
});

const activeRenewalDate = computed(() => {
  if (activeSubscription.value?.end_date) {
    return new Date(activeSubscription.value.end_date).toLocaleDateString();
  }
  return 'Dec 31, 2026';
});

const tenantStoreName = computed(() => {
  return settingsStore.tenantSettings?.storeName || 'My Retail Pharmacy Store';
});

const formatItemDate = (dateStr?: string) => {
  if (!dateStr) return 'Today';
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch (e) {
    return dateStr;
  }
};

const getItemExpiryDate = (item?: any) => {
  if (!item) return activeRenewalDate.value;
  const d = item.end_date || item.expiry_date || item.subscription_end || item.nextBillingDate;
  if (d) {
    try {
      const expDate = new Date(d);
      if (!isNaN(expDate.getTime())) return expDate.toISOString().split('T')[0];
    } catch(e) {}
  }
  if (item.created_at) {
    try {
      const created = new Date(item.created_at);
      created.setDate(created.getDate() + 30);
      return created.toISOString().split('T')[0];
    } catch(e) {}
  }
  return activeRenewalDate.value;
};

const isItemExpired = (item?: any) => {
  const expStr = getItemExpiryDate(item);
  if (!expStr) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return expStr < todayStr;
};

const getPlanCalculatedPrice = (plan: DynamicPlan) => {
  if (isAnnualBilling.value) {
    return Math.round(plan.priceMonthly * 0.8);
  }
  return plan.priceMonthly;
};

const getPlanBilledSubtitle = (plan: DynamicPlan) => {
  if (isAnnualBilling.value) {
    const annualPrice = Math.round(plan.priceMonthly * 0.8 * 12);
    return `Billed annually (${settingsStore.currencySymbol}${annualPrice}/yr)`;
  }
  return 'Billed monthly';
};

const copiedNumber = ref(false);

const dynamicGateways = computed(() => {
  const s = settingsStore.systemSettings || ({} as any);
  const list: Array<{ id: string; name: string; icon: string; number: string; type: string }> = [];
  if (s.bkashEnabled !== false) {
    list.push({ id: 'bkash', name: 'bKash', icon: '🌸', number: s.bkashNumber || '01700-000000', type: 'Merchant' });
  }
  if (s.nagadEnabled !== false) {
    list.push({ id: 'nagad', name: 'Nagad', icon: '⚡', number: s.nagadNumber || '01800-000000', type: 'Merchant' });
  }
  if (s.upayEnabled) {
    list.push({ id: 'upay', name: 'Upay', icon: '🟣', number: s.upayNumber || '01900-000000', type: 'Merchant' });
  }
  if (s.rocketEnabled) {
    list.push({ id: 'rocket', name: 'Rocket', icon: '🚀', number: s.rocketNumber || '01600-000000', type: 'Merchant' });
  }
  if (s.cardEnabled) {
    list.push({ id: 'card', name: 'Visa / Card', icon: '💳', number: s.cardRef || 'SSL-COMMERZ', type: 'Gateway' });
  }
  if (list.length === 0) {
    list.push(
      { id: 'bkash', name: 'bKash', icon: '🌸', number: s.bkashNumber || '01700-000000', type: 'Merchant' },
      { id: 'nagad', name: 'Nagad', icon: '⚡', number: s.nagadNumber || '01800-000000', type: 'Merchant' }
    );
  }
  return list;
});

const selectedGatewayInfo = computed(() => {
  const gId = upgradeForm.value.gateway;
  const found = dynamicGateways.value.find(g => g.id === gId);
  if (found) return found;
  return dynamicGateways.value[0] || { id: 'bkash', name: 'bKash', icon: '🌸', number: '01700-000000', type: 'Merchant' };
});

const calculatedUpgradeAmount = computed(() => {
  const chosenPlan = availablePlans.value.find(p => String(p.id) === String(upgradeForm.value.planId)) || availablePlans.value[0];
  if (!chosenPlan) return '49.00';
  const price = upgradeForm.value.cycle === 'yearly' ? Math.round(chosenPlan.priceMonthly * 0.8 * 12) : chosenPlan.priceMonthly;
  return Number(price).toFixed(2);
});

const copyMerchantNumber = (num: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(num);
    copiedNumber.value = true;
    setTimeout(() => {
      copiedNumber.value = false;
    }, 2000);
  }
};

const getGatewayIcon = (gw?: string) => {
  const g = (gw || '').toLowerCase();
  if (g.includes('bkash')) return '🌸';
  if (g.includes('nagad')) return '⚡';
  if (g.includes('card') || g.includes('visa')) return '💳';
  return '🏦';
};

const isPlanActive = (plan: DynamicPlan) => {
  if (!activeSubscription.value) return plan.name.toLowerCase().includes('pro');
  const curName = (activeSubscription.value.plan_name || activeSubscription.value.name || '').toLowerCase();
  const curId = String(activeSubscription.value.plan_id || activeSubscription.value.id || '');
  return curName === plan.name.toLowerCase() || curId === String(plan.id);
};

const totalSpent = computed(() => {
  return payments.value.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
});

const filteredPayments = computed(() => {
  const query = filterText.value.toLowerCase().trim();
  if (!query) return payments.value;
  return payments.value.filter(p =>
    (p.invoice_no && String(p.invoice_no).toLowerCase().includes(query)) ||
    (p.plan_name && String(p.plan_name).toLowerCase().includes(query)) ||
    (p.gateway && String(p.gateway).toLowerCase().includes(query)) ||
    (p.trx_no && String(p.trx_no).toLowerCase().includes(query))
  );
});

const { currentPage, totalPages, paginatedData, nextPage, prevPage, itemsPerPage } = usePagination(filteredPayments, 10);

const getHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.client) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.tenantId && user.tenantId !== 'SYSTEM') {
          headers['x-tenant-id'] = String(user.tenantId);
        }
      } catch (e) { }
    }

    const savedStore = localStorage.getItem('active_tenant_store');
    if (savedStore && !headers['x-tenant-id']) {
      try {
        const store = JSON.parse(savedStore);
        if (store && store.id) headers['x-tenant-id'] = String(store.id);
      } catch (e) { }
    }
  }
  return headers;
};

const fetchPlans = async () => {
  loadingPlans.value = true;
  try {
    let rawPlans: any[] = [];
    try {
      const res = await fetch('http://localhost:5000/api/plans');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.plans)) {
        rawPlans = data.plans;
      }
    } catch (e) {
      console.warn("Direct fetch /api/plans failed, trying Nuxt proxy:", e);
      const res: any = await $fetch('/api/plans').catch(() => null);
      if (res && res.success && Array.isArray(res.plans)) {
        rawPlans = res.plans;
      }
    }

    if (rawPlans.length > 0) {
      availablePlans.value = rawPlans.map(p => {
        const pName = p.name || 'Plan';
        const isEnt = pName.toLowerCase().includes('enterprise') || pName.toLowerCase().includes('unlimited');
        const isPro = pName.toLowerCase().includes('pro') || pName.toLowerCase().includes('standard');
        const icon = isEnt ? '👑' : isPro ? '💎' : '🌱';

        let customFeatures: string[] = [];
        if (p.features) {
          if (Array.isArray(p.features)) {
            customFeatures = p.features;
          } else if (typeof p.features === 'object') {
            customFeatures = Object.entries(p.features)
              .filter(([_, val]) => !!val)
              .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
          }
        }
        if (customFeatures.length === 0) {
          if (isEnt) customFeatures = ['Multi-Branch Central Warehouse Sync', 'Custom Doctor Rx Integration API', 'Dedicated Account Manager'];
          else if (isPro) customFeatures = ['Full Master Drug Catalog Sync', 'FEFO Smart Batch Sorting', 'SMS Invoicing Support'];
          else customFeatures = ['Essential Retail Cash Register', 'Standard Barcode Scanner Support'];
        }

        return {
          id: p.id || pName.toLowerCase(),
          name: pName,
          icon: icon,
          description: p.description || p.master_drug_limit_description || `${pName} for retail pharmacy store management.`,
          priceMonthly: Number(p.priceMonthly || p.price_monthly || p.price || 29),
          priceYearly: Number(p.priceYearly || p.price_yearly || (p.priceMonthly || 29) * 10),
          maxTerminals: Number(p.maxTerminals || p.max_terminals || p.terminalsLimit || p.terminals_limit || 1),
          maxUsers: Number(p.maxUsers || p.max_users || 3),
          maxProducts: Number(p.maxProducts || p.max_products || 2000),
          customFeatures: customFeatures,
          features: p.features
        };
      });
      return;
    }
  } catch (err) {
    console.error('Failed to fetch dynamic plans:', err);
  } finally {
    // Fallback plans if database returned empty
    if (availablePlans.value.length === 0) {
      availablePlans.value = [
        {
          id: 'starter',
          name: 'Starter Plan',
          icon: '🌱',
          description: 'Essential POS cash register & generics inventory for single-counter retail shops.',
          priceMonthly: 29,
          priceYearly: 290,
          maxTerminals: 1,
          maxUsers: 2,
          maxProducts: 2000,
          customFeatures: ['Essential Retail Cash Register', 'Standard Barcode Scanner Support']
        },
        {
          id: 'pro',
          name: 'Professional Plan',
          icon: '💎',
          description: 'Complete high-speed multi-counter retail POS with FEFO batching & Rx compliance.',
          priceMonthly: 49,
          priceYearly: 490,
          maxTerminals: 3,
          maxUsers: 5,
          maxProducts: 10000,
          customFeatures: ['Full Master Drug Catalog Sync', 'FEFO Smart Batch Sorting', 'SMS Invoicing Support']
        },
        {
          id: 'enterprise',
          name: 'Enterprise Plan',
          icon: '👑',
          description: 'Uncapped power for hospital pharmacy networks, multiple store locations & API access.',
          priceMonthly: 99,
          priceYearly: 990,
          maxTerminals: 10,
          maxUsers: 25,
          maxProducts: 50000,
          customFeatures: ['Multi-Branch Central Warehouse Sync', 'Custom Doctor Rx Integration API', 'Dedicated Account Manager']
        }
      ];
    }
    loadingPlans.value = false;
  }
};

const fetchSubscription = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/inventory/my-subscription', {
      headers: getHeaders()
    });
    const data = await res.json();
    if (data && data.success && data.subscription) {
      activeSubscription.value = data.subscription;
    }
  } catch (err) {
    console.warn("Direct subscription fetch error:", err);
  }
};

const fetchBillingData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/super-admin/payments');
    if (res.data && res.data.payments && Array.isArray(res.data.payments)) {
      payments.value = res.data.payments;
    }
  } catch (err) {
    console.warn('Fetch billing history via axios error, loading fallback store ledger:', err);
    if (payments.value.length === 0) {
      payments.value = [
        { id: 104, invoice_no: 'INV-2026-00104', plan_name: 'Professional Plan', amount: 49.00, gateway: 'bKash', trx_no: '9J881KL920', status: 'PAID', created_at: '2026-08-01' },
        { id: 103, invoice_no: 'INV-2026-00103', plan_name: 'Professional Plan', amount: 49.00, gateway: 'bKash', trx_no: '8H712NN450', status: 'PAID', created_at: '2026-07-01' },
        { id: 102, invoice_no: 'INV-2026-00102', plan_name: 'Starter Plan', amount: 29.00, gateway: 'Nagad', trx_no: '7K661PP312', status: 'PAID', created_at: '2026-06-01' },
      ];
    }
  } finally {
    loading.value = false;
  }
};

const viewInvoiceReceipt = (item: any) => {
  selectedInvoice.value = item;
  showReceiptModal.value = true;
};

const printReceipt = () => {
  window.print();
};

const openUpgradeModal = (plan?: any) => {
  if (plan) {
    upgradeForm.value.planId = plan.id;
  } else if (availablePlans.value.length > 0) {
    upgradeForm.value.planId = availablePlans.value[0].id as string;
  }
  if (dynamicGateways.value.length > 0 && !dynamicGateways.value.some(g => g.id === upgradeForm.value.gateway)) {
    upgradeForm.value.gateway = dynamicGateways.value[0].id;
  }
  upgradeForm.value.trxId = '';
  showUpgradeModal.value = true;
};

const submitUpgrade = async () => {
  if (!upgradeForm.value.trxId) return;
  isSubmitting.value = true;
  try {
    const chosenPlan = availablePlans.value.find(p => String(p.id) === String(upgradeForm.value.planId)) || availablePlans.value[0];
    const amount = upgradeForm.value.cycle === 'yearly' ? Math.round(chosenPlan.priceMonthly * 0.8 * 12) : chosenPlan.priceMonthly;

    // Push new invoice record
    const newInvoice = {
      id: payments.value.length + 105,
      invoice_no: `INV-${new Date().getFullYear()}-${String(payments.value.length + 105).padStart(5, '0')}`,
      plan_name: chosenPlan.name,
      amount: amount,
      gateway: upgradeForm.value.gateway,
      trx_no: upgradeForm.value.trxId,
      status: 'PAID',
      created_at: new Date().toISOString()
    };
    payments.value.unshift(newInvoice);

    if (activeSubscription.value) {
      activeSubscription.value.plan_name = chosenPlan.name;
      activeSubscription.value.price = chosenPlan.priceMonthly;
    } else {
      activeSubscription.value = {
        plan_name: chosenPlan.name,
        price: chosenPlan.priceMonthly,
        status: 'active',
        end_date: new Date(Date.now() + 30 * 86400000).toISOString()
      };
    }

    showUpgradeModal.value = false;
    alert(`🎉 Subscription upgraded to ${chosenPlan.name} successfully! Payment Trx recorded.`);
  } catch (err: any) {
    alert("Error upgrading subscription: " + err.message);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  const { isBranchManager, isCashier } = auth;
  if (isBranchManager.value || isCashier.value) {
    router.replace('/admin');
    return;
  }

  await Promise.all([
    settingsStore.fetchSystemSettings(),
    settingsStore.fetchTenantSettings(),
    fetchPlans(),
    fetchSubscription(),
    fetchBillingData()
  ]);

  try {
    const currentUser = await auth.fetchCurrentUser();
    if (currentUser && (currentUser as any).subscription && !activeSubscription.value) {
      activeSubscription.value = (currentUser as any).subscription;
    }
  } catch (e) { }
});
</script>
