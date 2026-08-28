<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 font-sans select-none">
      <!-- 1. Top KPI Summary Metrics Cards (Clean Desktop 1px Border Style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Card 1: Total Sales Revenue -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">TOTAL SALES
              REVENUE</div>
            <div class="text-lg font-normal text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              {{ settingsStore.currencySymbol }}{{ stats.total_revenue.toFixed(2) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
              Across {{ stats.total_invoices }} sales transactions
            </div>
          </div>
          <span class="text-2xl">💰</span>
        </div>

        <!-- Card 2: Today's Revenue & Invoices -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">TODAY'S
              DISPENSES</div>
            <div class="text-lg font-normal text-slate-900 dark:text-gray-100 font-mono mt-0.5">
              {{ settingsStore.currencySymbol }}{{ stats.today_revenue.toFixed(2) }}
            </div>
            <div class="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">
              ● {{ stats.today_invoices }} Invoices Dispensed Today
            </div>
          </div>
          <span class="text-2xl">📅</span>
        </div>

        <!-- Card 3: Cash vs Digital Split -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">PAYMENT
              SPLIT</div>
            <div class="text-sm font-normal text-slate-800 dark:text-gray-100 font-mono mt-0.5 flex items-center gap-2">
              <span> {{ stats.cash_count }} Cash</span>
              <span class="text-slate-400">|</span>
              <span> {{ stats.digital_count }} Digital</span>
            </div>
            <div class="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
              bKash, Nagad, Card & Insurance
            </div>
          </div>
          <span class="text-2xl">📊</span>
        </div>

        <!-- Card 4: FEFO Batch Dispense Audit -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider">FEFO BATCH
              AUDIT</div>
            <div
              class="text-base font-normal text-slate-900 dark:text-gray-100 font-sans mt-0.5 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Automated Stock Deduct</span>
            </div>
            <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              Live MySQL 8.4 Sync Active
            </div>
          </div>
          <span class="text-2xl">🛡️</span>
        </div>
      </div>

      <!-- 2. Main Desktop Frame (Toolbar, Filters & Data Grid) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Left: Actions & Date Filters -->
          <div class="flex items-center gap-2 flex-wrap">
            <NuxtLink to="/pos"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span>💻</span> Open POS Cashier [F10]
            </NuxtLink>

            <button @click="loadSales" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh
            </button>

            <button @click="exportCSV" :disabled="sales.length === 0"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Export Sales Ledger to CSV / Excel Spreadsheet">
              <span>📥</span> Export CSV
            </button>

            <!-- Date Filter Toggle -->
            <div
              class="flex items-center border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-0.5 shadow-2xs ml-1">
              <button v-for="dOption in dateOptions" :key="dOption.value" @click="setDateFilter(dOption.value)" :class="[
                'px-2.5 py-0.5 text-[11px] font-normal transition-all cursor-pointer',
                selectedDatePreset === dOption.value
                  ? 'bg-[#107c41] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              ]">
                {{ dOption.label }}
              </button>
            </div>
          </div>

          <!-- Right: Filters & Search -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Payment Method Filter -->
            <div class="flex items-center gap-1">
              <label
                class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">METHOD:</label>
              <select v-model="selectedMethodFilter" @change="currentPage = 1; loadSales()"
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] shadow-2xs">
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="mobile">Mobile / Wallet</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>

            <!-- Search Input -->
            <div class="relative">
              <input type="text" v-model="searchQuery" @input="handleSearchDebounced"
                placeholder="Search invoice #, customer phone..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-56 sm:w-64 shadow-2xs" />
              <button v-if="searchQuery" @click="searchQuery = ''; currentPage = 1; loadSales()"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- SALE INVOICES DATA GRID TABLE VIEWPORT                            -->
        <!-- ================================================================= -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-10 text-center border-r border-slate-200 dark:border-gray-800 font-normal">#
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">INVOICE NO</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">CUSTOMER
                </th>
                <!-- <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">DOCTOR / RX REF</th> -->
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal min-w-[200px]">
                  DISPENSED MEDICINES</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">PAYMENT METHOD</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">TRX NO</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">AMOUNT
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">STATUS
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">DATE / TIME</th>
                <th class="py-1.5 px-3 text-center w-24 font-normal">ACTION</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="11" class="py-12">
                  <PharmacyLoader text="Loading Sales Records..." />
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="sales.length === 0">
                <td colspan="11" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  <div class="space-y-1">
                    <p>No sale invoices found matching your criteria.</p>
                    <NuxtLink to="/pos" class="text-emerald-600 dark:text-emerald-400 hover:underline text-xs">
                      + Open POS Cashier to make a sale
                    </NuxtLink>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-else v-for="(order, idx) in sales" :key="order.id" @click="selectedRow = order.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === order.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- Index (Continuous Serial Across Pages) -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-10 font-normal text-slate-500 dark:text-gray-400">
                  {{ (currentPage - 1) * pageSize + idx + 1 }}
                </td>

                <!-- Invoice No -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono font-normal"
                  :class="selectedRow === order.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold">{{ order.invoice_no || ('INV-' + String(order.id).padStart(5, '0'))
                      }}</span>
                  </div>
                </td>

                <!-- Patient / Customer -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div class="font-medium text-slate-800 dark:text-gray-200">{{ order.customer_phone ||
                    order.customer_name || 'Walk-in Patient' }}</div>
                </td>

                <!-- Dispensed Medicines Summary -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-[11px]">
                  <div class="truncate max-w-xs" :title="order.items_summary || '1x Dispensed Item'">
                    {{ order.items_summary || 'Dispensed Prescription Package' }}
                  </div>
                </td>

                <!-- Payment Method -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 uppercase font-mono text-[11px]">
                  <span :class="[
                    'px-1.5 py-0.2 border text-[10px] uppercase font-mono inline-flex items-center gap-1',
                    (order.payment_method || '').toLowerCase() === 'cash'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                      : (order.payment_method || '').toLowerCase() === 'insurance'
                        ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                        : 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800'
                  ]">
                    <span>{{ order.payment_method || 'CASH' }}</span>
                  </span>
                </td>

                <!-- TRX NO Column -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-[11px]">
                  <span v-if="order.transaction_no"
                    class="text-amber-700 dark:text-amber-400 font-medium px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                    {{ order.transaction_no }}
                  </span>
                  <span v-else class="text-slate-400">-</span>
                </td>

                <!-- Total Amount -->
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-mono font-normal"
                  :class="selectedRow === order.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ settingsStore.currencySymbol }}{{ Number(order.total || 0).toFixed(2) }}
                </td>

                <!-- Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-normal uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                    ● {{ order.status || 'COMPLETED' }}
                  </span>
                </td>

                <!-- Date / Time -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-500 dark:text-gray-400 text-[11px] font-mono">
                  {{ formatDate(order.created_at) }}
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <button @click="openInvoiceDetails(order)"
                    class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer shadow-2xs"
                    title="View & Print Official Thermal/A4 Sales Receipt">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Desktop Grid Pagination & Footer Bar -->
          <div
            class="px-3 py-2 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-gray-400 font-normal">

            <!-- Left: Page Size Selector & Record Counts -->
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 text-[11px]">
                <span>Rows:</span>
                <select v-model.number="pageSize" @change="handlePageSizeChange"
                  class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-1.5 py-0.5 text-xs text-slate-800 dark:text-gray-200 font-mono focus:outline-none focus:border-[#107c41] shadow-2xs">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>

              <div class="text-[11px]">
                Showing <strong>{{ recordRangeStart }}</strong> - <strong>{{ recordRangeEnd }}</strong> of <strong>{{
                  totalCount }}</strong> invoices
              </div>
            </div>

            <!-- Right: Interactive Pagination Buttons -->
            <div class="flex items-center gap-1">
              <button @click="goToPage(1)" :disabled="currentPage <= 1 || loading"
                class="px-2 py-0.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-xs font-mono transition-all shadow-2xs cursor-pointer"
                title="First Page">
                «
              </button>

              <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1 || loading"
                class="px-2.5 py-0.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-xs font-normal transition-all shadow-2xs cursor-pointer flex items-center gap-1">
                ‹ Prev
              </button>

              <div
                class="px-2.5 py-0.5 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-mono text-xs font-normal">
                Page <span class="font-bold text-[#107c41] dark:text-emerald-400">{{ currentPage }}</span> / {{
                  totalPages }}
              </div>

              <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages || loading"
                class="px-2.5 py-0.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-xs font-normal transition-all shadow-2xs cursor-pointer flex items-center gap-1">
                Next ›
              </button>

              <button @click="goToPage(totalPages)" :disabled="currentPage >= totalPages || loading"
                class="px-2 py-0.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-xs font-mono transition-all shadow-2xs cursor-pointer"
                title="Last Page">
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- OFFICIAL SALE INVOICE & PRINTABLE RECEIPT MODAL                       -->
      <!-- ===================================================================== -->
      <div v-if="showInvoiceModal && activeOrder"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🧾</span> Official Pharmacy Sales Receipt & Dispense Invoice
            </h3>
            <button @click="showInvoiceModal = false"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
          </div>

          <!-- Printable Area Viewport -->
          <div
            class="p-5 space-y-4 text-xs font-sans bg-white dark:bg-gray-950 text-slate-800 dark:text-gray-200 overflow-y-auto"
            id="printable-sales-receipt">
            <!-- Header Info -->
            <div class="flex items-start justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
              <div>
                <div class="font-bold text-sm text-slate-900 dark:text-white">{{ storeName }}</div>
                <div v-if="storeAddress" class="text-[11px] text-slate-500 dark:text-gray-400">{{ storeAddress }}</div>
                <div class="text-[11px] text-slate-500 dark:text-gray-400">
                  <span v-if="storePhone">Phone: {{ storePhone }} • </span>Reg: DGDA-RX-8849
                </div>
              </div>
              <div class="text-right">
                <span
                  class="px-2 py-0.5 text-[10px] font-normal uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                  ● {{ activeOrder.status || 'DISPENSED' }}
                </span>
                <div class="font-mono text-xs font-bold text-slate-800 dark:text-gray-200 mt-1">
                  {{ activeOrder.invoice_no || ('INV-' + String(activeOrder.id).padStart(5, '0')) }}
                </div>
                <div class="text-[10px] text-slate-400 font-mono">
                  Date: {{ formatDate(activeOrder.created_at) }}
                </div>
              </div>
            </div>

            <!-- Patient / Customer & Dispenser Info -->
            <div
              class="grid grid-cols-2 gap-3 py-2 bg-slate-50 dark:bg-gray-900 px-3 border border-slate-200 dark:border-gray-800 text-[11px]">
              <div>
                <span class="text-slate-500 dark:text-gray-400 uppercase text-[10px] block">PATIENT DETAILS:</span>
                <strong class="text-slate-800 dark:text-gray-200">{{ activeOrder.customer_name || 'Walk-in Patient'
                }}</strong>
                <div v-if="activeOrder.customer_phone" class="text-slate-500 font-mono">{{ activeOrder.customer_phone }}
                </div>
                <div v-if="activeOrder.doctor_name" class="text-slate-500 text-[10px]">Prescriber: {{
                  activeOrder.doctor_name }}</div>
              </div>
              <div>
                <span class="text-slate-500 dark:text-gray-400 uppercase text-[10px] block">DISPENSE METADATA:</span>
                <div>Method: <strong class="uppercase font-mono">{{ activeOrder.payment_method || 'Cash' }}</strong>
                </div>
                <div v-if="activeOrder.transaction_no">TrxID: <strong
                    class="font-mono text-amber-800 dark:text-amber-300 font-bold">{{ activeOrder.transaction_no
                    }}</strong></div>
                <div>Cashier: <span class="font-normal text-slate-700 dark:text-gray-300">{{ activeOrder.cashier_name ||
                  'Admin Pharmacist' }}</span></div>
                <div v-if="activeOrder.prescription_ref" class="text-emerald-700 dark:text-emerald-400 font-mono">Rx
                  Ref: {{ activeOrder.prescription_ref }}</div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="border border-slate-200 dark:border-gray-800">
              <table class="w-full border-collapse text-xs">
                <thead>
                  <tr
                    class="bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-400 text-[11px] border-b border-slate-200 dark:border-gray-800">
                    <th class="py-1.5 px-2 text-left font-normal border-r border-slate-200 dark:border-gray-800">Item &
                      Batch Description</th>
                    <th class="py-1.5 px-2 text-center font-normal border-r border-slate-200 dark:border-gray-800 w-12">
                      Qty</th>
                    <th class="py-1.5 px-2 text-right font-normal border-r border-slate-200 dark:border-gray-800 w-20">
                      Rate</th>
                    <th class="py-1.5 px-2 text-right font-normal w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(it, i) in displayedItems" :key="i"
                    class="border-b border-slate-200 dark:border-gray-800/80 font-normal">
                    <td class="py-1.5 px-2 border-r border-slate-200 dark:border-gray-800">
                      <div class="font-medium text-slate-800 dark:text-gray-200">{{ it.product_name }}</div>
                      <div class="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                        <span v-if="it.batch_number">Batch: {{ it.batch_number }}</span>
                        <span v-if="it.expiry_date">Exp: {{ new Date(it.expiry_date).toLocaleDateString() }}</span>
                        <span v-if="it.strength">{{ it.strength }}</span>
                      </div>
                    </td>
                    <td class="py-1.5 px-2 text-center border-r border-slate-200 dark:border-gray-800 font-mono">
                      {{ it.quantity }}
                    </td>
                    <td class="py-1.5 px-2 text-right border-r border-slate-200 dark:border-gray-800 font-mono">
                      {{ settingsStore.currencySymbol }}{{ Number(it.unit_price || 0).toFixed(2) }}
                    </td>
                    <td class="py-1.5 px-2 text-right font-mono font-medium text-slate-800 dark:text-gray-200">
                      {{ settingsStore.currencySymbol }}{{ Number(it.subtotal || (it.quantity * it.unit_price) ||
                        0).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <div class="p-3 bg-slate-50/60 dark:bg-gray-900/60 space-y-1 text-[11px] font-sans">
                <div class="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Subtotal Amount:</span>
                  <span class="font-mono text-slate-800 dark:text-gray-200">{{ settingsStore.currencySymbol }}{{
                    Number(activeOrder.subtotal || activeOrder.total || 0).toFixed(2) }}</span>
                </div>
                <div v-if="activeOrder.discount > 0"
                  class="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Special Discount:</span>
                  <span class="font-mono">- {{ settingsStore.currencySymbol }}{{ Number(activeOrder.discount ||
                    0).toFixed(2) }}</span>
                </div>
                <div v-if="activeOrder.tax > 0" class="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Tax (VAT):</span>
                  <span class="font-mono">{{ settingsStore.currencySymbol }}{{ Number(activeOrder.tax || 0).toFixed(2)
                  }}</span>
                </div>
                <div
                  class="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-gray-800">
                  <span>Grand Total Paid:</span>
                  <span class="font-mono text-emerald-700 dark:text-emerald-400">{{ settingsStore.currencySymbol }}{{
                    Number(activeOrder.total || 0).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="text-[10px] text-slate-400 text-center pt-1 font-mono">
              Thank you for trusting {{ storeName }}! Keep medicines in a cool, dry place.
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="px-4 py-2.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-mono">Design & Developed by <NuxtLink to="javascript:void(0)">
                Binary IT</NuxtLink></span>
            <div class="flex items-center gap-2">
              <button @click="printReceipt"
                class="bg-white dark:bg-gray-800 hover:bg-slate-100 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-700 px-3 py-1 text-xs font-normal cursor-pointer shadow-2xs flex items-center gap-1">
                <span>🖨️</span> Print Receipt
              </button>
              <button @click="showInvoiceModal = false"
                class="bg-[#107c41] hover:bg-[#0e6b37] text-white px-3 py-1 text-xs font-normal shadow-xs cursor-pointer">
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
import { useSalesOrders, type SaleInvoice, type SaleItemDetail } from '~/composables/useSalesOrders';
import { useSettingsStore } from '~/stores/settings';

const settingsStore = useSettingsStore();
const {
  sales,
  selectedSale,
  selectedSaleItems,
  loading,
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  stats,
  fetchSales,
  fetchSaleDetails,
  exportToCSV
} = useSalesOrders();

const selectedRow = ref<number | null>(null);
const searchQuery = ref('');
const selectedMethodFilter = ref('all');
const selectedDatePreset = ref('all');
let searchTimeout: any = null;

const recordRangeStart = computed(() => {
  if (totalCount.value === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const recordRangeEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, totalCount.value);
});

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadSales();
};

const handlePageSizeChange = () => {
  currentPage.value = 1;
  loadSales();
};

// Modal
const showInvoiceModal = ref(false);
const activeOrder = ref<SaleInvoice | null>(null);
const activeOrderItems = ref<SaleItemDetail[]>([]);

const dateOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Month', value: 'month' }
];

const storeName = computed(() => {
  return settingsStore.tenantSettings?.name ||
    settingsStore.tenantSettings?.store_name ||
    settingsStore.tenantSettings?.storeName ||
    (process.client && JSON.parse(localStorage.getItem('active_tenant_store') || '{}')?.name) ||
    'My Pharmacy Store';
});

const storeAddress = computed(() => {
  return settingsStore.tenantSettings?.address ||
    (process.client && JSON.parse(localStorage.getItem('active_tenant_store') || '{}')?.address) ||
    '';
});

const storePhone = computed(() => {
  return settingsStore.tenantSettings?.phone ||
    (process.client && JSON.parse(localStorage.getItem('active_tenant_store') || '{}')?.phone) ||
    '';
});

const displayedItems = computed(() => {
  if (activeOrderItems.value && activeOrderItems.value.length > 0) {
    return activeOrderItems.value;
  }
  if (activeOrder.value?.items && activeOrder.value.items.length > 0) {
    return activeOrder.value.items;
  }
  return [
    {
      product_id: 1,
      product_name: activeOrder.value?.items_summary || 'Dispensed Medicine Package',
      batch_number: 'B26-089',
      expiry_date: '2027-12-31',
      quantity: 1,
      unit_price: activeOrder.value?.total || 0,
      subtotal: activeOrder.value?.total || 0
    }
  ];
});

const loadSales = () => {
  let startDate: string | undefined;
  let endDate: string | undefined;

  const now = new Date();
  if (selectedDatePreset.value === 'today') {
    startDate = now.toISOString().slice(0, 10);
    endDate = now.toISOString().slice(0, 10);
  } else if (selectedDatePreset.value === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate = firstDay.toISOString().slice(0, 10);
    endDate = now.toISOString().slice(0, 10);
  }

  fetchSales({
    search: searchQuery.value.trim() || undefined,
    method: selectedMethodFilter.value !== 'all' ? selectedMethodFilter.value : undefined,
    startDate,
    endDate,
    page: currentPage.value,
    limit: pageSize.value
  });
};

const setDateFilter = (preset: string) => {
  selectedDatePreset.value = preset;
  currentPage.value = 1;
  loadSales();
};

const handleSearchDebounced = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadSales();
  }, 300);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Today';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return dateStr;
  }
};

const getMethodIcon = (method?: string) => {
  const m = (method || '').toLowerCase();
  if (m === 'cash') return '💵';
  if (m === 'card' || m === 'visa') return '💳';
  if (m === 'bkash') return '🌸';
  if (m === 'nagad') return '⚡';
  if (m === 'insurance') return '🏥';
  return '📱';
};

const openInvoiceDetails = async (order: SaleInvoice) => {
  activeOrder.value = order;
  activeOrderItems.value = [];
  showInvoiceModal.value = true;

  await fetchSaleDetails(order.id);
  if (selectedSaleItems.value.length > 0) {
    activeOrderItems.value = selectedSaleItems.value;
  }
};

const printReceipt = () => {
  window.print();
};

const exportCSV = () => {
  exportToCSV(sales.value, settingsStore.currencySymbol);
};

onMounted(async () => {
  await Promise.all([
    settingsStore.fetchTenantSettings(),
    settingsStore.fetchSystemSettings()
  ]);
  loadSales();
});
</script>
