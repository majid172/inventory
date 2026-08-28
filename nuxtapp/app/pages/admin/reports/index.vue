<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 font-sans select-none pb-12">
      <!-- 1. Page Header & Navigation Tabs -->
      <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg border border-emerald-300 dark:border-emerald-800/80">
            📊
          </div>
          <div>
            <h1 class="text-sm font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
              Financial & Expiry Audit Reports
            </h1>
            <p class="text-[11px] text-slate-500 dark:text-gray-400">
              Real-time Profit & Loss (COGS Margin) and FEFO Batch Expiry Financial Loss Analytics
            </p>
          </div>
        </div>

        <!-- Tab Switcher -->
        <div class="flex items-center bg-slate-100 dark:bg-gray-900 p-1 border border-slate-300 dark:border-gray-700">
          <button
            @click="activeTab = 'pnl'"
            class="px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            :class="activeTab === 'pnl' ? 'bg-[#107c41] text-white shadow-xs' : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'"
          >
            <span>📈</span> Profit & Loss (COGS)
          </button>
          <button
            @click="activeTab = 'expiry'"
            class="px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            :class="activeTab === 'expiry' ? 'bg-[#c53929] text-white shadow-xs' : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'"
          >
            <span>⚠️</span> Expiry Loss Report
            <span v-if="expirySummary.expired_batch_count > 0" class="px-1 py-0.2 text-[9px] bg-red-800 text-white font-mono">
              {{ expirySummary.expired_batch_count }}
            </span>
          </button>
          <button
            @click="activeTab = 'stock'"
            class="px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            :class="activeTab === 'stock' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'"
          >
            <span>📦</span> Stock Valuation
          </button>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- TAB 1: PROFIT & LOSS (P&L / COGS) MODULE                              -->
      <!-- ===================================================================== -->
      <div v-if="activeTab === 'pnl'" class="space-y-4">
        <!-- Filter Bar -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 px-3.5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Preset Period Filters -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider mr-1">Period:</span>
            <button
              v-for="p in periodOptions"
              :key="p.key"
              @click="selectPeriod(p.key)"
              class="px-2.5 py-1 text-xs transition-colors border cursor-pointer font-sans"
              :class="selectedPeriod === p.key ? 'bg-slate-800 text-white border-slate-900 dark:bg-gray-200 dark:text-gray-900 font-medium' : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:bg-slate-50'"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Custom Date Pickers & Actions -->
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1">
              <input
                type="date"
                v-model="customStartDate"
                class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-100 font-mono"
              />
              <span class="text-slate-400">to</span>
              <input
                type="date"
                v-model="customEndDate"
                class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-100 font-mono"
              />
              <button
                @click="applyCustomDates"
                class="bg-slate-700 hover:bg-slate-800 text-white px-2 py-1 text-xs font-normal cursor-pointer"
              >
                Apply
              </button>
            </div>

            <button
              @click="loadPnlData"
              :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <svg :class="['w-3.5 h-3.5 text-slate-500', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>

            <button
              @click="exportPnlReport"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              title="Download Profit & Loss Excel CSV"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        <!-- 4 Primary Financial KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- KPI 1: Net Sales Revenue -->
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs transition-colors">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">NET SALES REVENUE</span>
              <span class="text-base">💵</span>
            </div>
            <div class="text-xl font-medium text-slate-900 dark:text-gray-100 font-mono mt-1">
              {{ settingsStore.currencySymbol }}{{ pnlSummary.net_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1 flex items-center justify-between">
              <span>Gross: {{ settingsStore.currencySymbol }}{{ pnlSummary.gross_sales.toFixed(2) }}</span>
              <span>Disc: -{{ settingsStore.currencySymbol }}{{ pnlSummary.total_discounts.toFixed(2) }}</span>
            </div>
          </div>

          <!-- KPI 2: Cost of Goods Sold (COGS) -->
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs transition-colors">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">COST OF GOODS (COGS)</span>
              <span class="text-base">📦</span>
            </div>
            <div class="text-xl font-medium text-amber-700 dark:text-amber-400 font-mono mt-1">
              {{ settingsStore.currencySymbol }}{{ pnlSummary.total_cogs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
              Purchase cost for {{ pnlSummary.total_units_sold }} units dispensed
            </div>
          </div>

          <!-- KPI 3: Gross Profit -->
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs transition-colors">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">GROSS PROFIT (নিট লাভ)</span>
              <span class="text-base">💰</span>
            </div>
            <div class="text-xl font-medium font-mono mt-1" :class="pnlSummary.gross_profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
              {{ settingsStore.currencySymbol }}{{ pnlSummary.gross_profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
              Revenue - COGS across {{ pnlSummary.total_invoices }} orders
            </div>
          </div>

          <!-- KPI 4: Gross Profit Margin % -->
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs transition-colors">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">PROFIT MARGIN RATE</span>
              <span class="text-base">🎯</span>
            </div>
            <div class="text-xl font-medium font-mono mt-1 flex items-center gap-2" :class="pnlSummary.margin_percentage >= 20 ? 'text-emerald-700 dark:text-emerald-400' : (pnlSummary.margin_percentage > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600')">
              <span>{{ pnlSummary.margin_percentage.toFixed(2) }}%</span>
              <span class="text-[10px] px-1.5 py-0.5 border" :class="pnlSummary.margin_percentage >= 20 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-100 text-amber-800 border-amber-300'">
                {{ pnlSummary.margin_percentage >= 20 ? 'Healthy' : 'Moderate' }}
              </span>
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
              Gross Profit / Net Revenue ratio
            </div>
          </div>
        </div>

        <!-- Product Level Profitability & Timeline Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Left 2 Cols: Product Profit Ranking -->
          <div class="lg:col-span-2 border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
            <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
              <h3 class="text-xs font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                <span>💊</span> Medicine Profitability Breakdown
              </h3>
              <input
                type="text"
                v-model="productSearch"
                placeholder="Search medicine..."
                class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2 py-0.5 text-xs rounded-xs w-44"
              />
            </div>
            <div class="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table class="w-full text-left text-xs font-sans border-collapse">
                <thead class="sticky top-0 bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 text-[11px] text-slate-600 dark:text-gray-400 uppercase">
                  <tr>
                    <th class="py-1.5 px-3">Medicine Brand / Generic</th>
                    <th class="py-1.5 px-2 text-right">Sold</th>
                    <th class="py-1.5 px-2 text-right">Revenue</th>
                    <th class="py-1.5 px-2 text-right">Cost (COGS)</th>
                    <th class="py-1.5 px-2 text-right">Profit</th>
                    <th class="py-1.5 px-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-gray-800">
                  <tr v-if="filteredProducts.length === 0">
                    <td colspan="6" class="py-6 text-center text-slate-400 dark:text-gray-500">
                      No product sales recorded in this period.
                    </td>
                  </tr>
                  <tr v-for="item in filteredProducts" :key="item.product_id" class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                    <td class="py-2 px-3">
                      <div class="font-medium text-slate-800 dark:text-gray-100">{{ item.product_name }}</div>
                      <div class="text-[10px] text-slate-500 dark:text-gray-400 font-mono">{{ item.generic_name || item.category_name || 'Generic' }}</div>
                    </td>
                    <td class="py-2 px-2 text-right font-mono">{{ item.units_sold }}</td>
                    <td class="py-2 px-2 text-right font-mono text-slate-700 dark:text-gray-300">{{ settingsStore.currencySymbol }}{{ item.revenue.toFixed(2) }}</td>
                    <td class="py-2 px-2 text-right font-mono text-amber-700 dark:text-amber-400">{{ settingsStore.currencySymbol }}{{ item.cogs.toFixed(2) }}</td>
                    <td class="py-2 px-2 text-right font-mono font-medium" :class="item.profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'">
                      {{ settingsStore.currencySymbol }}{{ item.profit.toFixed(2) }}
                    </td>
                    <td class="py-2 px-3 text-right font-mono text-[11px]">
                      <span class="px-1.5 py-0.5 rounded-xs" :class="item.margin_pct >= 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'">
                        {{ item.margin_pct.toFixed(1) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right 1 Col: Category Profit Summary -->
          <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs flex flex-col">
            <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2">
              <h3 class="text-xs font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                <span>🏷️</span> Category Contribution
              </h3>
            </div>
            <div class="p-3 overflow-y-auto max-h-[380px] space-y-3">
              <div v-if="pnlCategories.length === 0" class="text-center text-slate-400 py-8 text-xs">
                No category sales recorded.
              </div>
              <div v-for="cat in pnlCategories" :key="cat.category_name" class="border border-slate-200 dark:border-gray-800 p-2.5 bg-slate-50/50 dark:bg-gray-900/40 space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-slate-800 dark:text-gray-200">{{ cat.category_name }}</span>
                  <span class="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                    +{{ settingsStore.currencySymbol }}{{ cat.profit.toFixed(2) }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                  <span>Rev: {{ settingsStore.currencySymbol }}{{ cat.revenue.toFixed(0) }}</span>
                  <span>Cost: {{ settingsStore.currencySymbol }}{{ cat.cogs.toFixed(0) }}</span>
                  <span class="text-slate-700 dark:text-gray-300 font-medium">{{ cat.margin_pct.toFixed(1) }}% Margin</span>
                </div>
                <!-- Visual Mini Bar -->
                <div class="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    class="bg-emerald-600 h-full"
                    :style="{ width: `${Math.min(100, Math.max(0, cat.margin_pct))}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Daily Table -->
        <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
          <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="text-xs font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
              <span>📅</span> Daily Sales, Cost & Profit Timeline
            </h3>
            <span class="text-[11px] font-mono text-slate-500">{{ pnlTimeline.length }} Days Recorded</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans border-collapse">
              <thead class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 text-[11px] text-slate-600 dark:text-gray-400 uppercase">
                <tr>
                  <th class="py-1.5 px-3">Date</th>
                  <th class="py-1.5 px-3 text-center">Orders</th>
                  <th class="py-1.5 px-3 text-right">Total Revenue</th>
                  <th class="py-1.5 px-3 text-right">Cost (COGS)</th>
                  <th class="py-1.5 px-3 text-right">Net Profit</th>
                  <th class="py-1.5 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-gray-800 font-mono">
                <tr v-if="pnlTimeline.length === 0">
                  <td colspan="6" class="py-6 text-center text-slate-400 dark:text-gray-500 font-sans">
                    No timeline records available.
                  </td>
                </tr>
                <tr v-for="t in pnlTimeline" :key="t.sale_date" class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2 px-3 font-sans font-medium text-slate-800 dark:text-gray-200">{{ t.sale_date }}</td>
                  <td class="py-2 px-3 text-center text-slate-600 dark:text-gray-400">{{ t.invoice_count }}</td>
                  <td class="py-2 px-3 text-right text-slate-800 dark:text-gray-200">{{ settingsStore.currencySymbol }}{{ t.revenue.toFixed(2) }}</td>
                  <td class="py-2 px-3 text-right text-amber-700 dark:text-amber-400">{{ settingsStore.currencySymbol }}{{ t.cogs.toFixed(2) }}</td>
                  <td class="py-2 px-3 text-right font-medium" :class="t.profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'">
                    {{ settingsStore.currencySymbol }}{{ t.profit.toFixed(2) }}
                  </td>
                  <td class="py-2 px-3 text-right">
                    <span class="px-1.5 py-0.5 rounded-xs" :class="t.margin_pct >= 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-gray-800'">
                      {{ t.margin_pct.toFixed(1) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- TAB 3: STOCK VALUATION REPORT                                         -->
      <!-- ===================================================================== -->
      <div v-else-if="activeTab === 'stock'" class="space-y-4">
        <!-- Stock Toolbar -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 px-3.5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <span class="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
            <span>📦</span> Inventory Stock Valuation Report
          </span>
          <div class="flex items-center gap-2">
            <input type="text" v-model="stockSearch" placeholder="Search medicine..." class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2 py-1 text-xs w-44" />
            <button @click="loadStockData" :disabled="loadingStock" class="bg-white dark:bg-gray-800 hover:bg-slate-100 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer shadow-xs">
              <svg :class="['w-3.5 h-3.5 text-slate-500', { 'animate-spin': loadingStock }]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Refresh
            </button>
            <button @click="exportStockReport" class="bg-white dark:bg-gray-800 hover:bg-slate-100 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer shadow-xs">
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        <!-- Stock KPI Cards — Row 1: Revenue & Profit -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Net Revenue -->
          <div class="bg-white dark:bg-gray-950 border-2 border-emerald-300 dark:border-emerald-800 p-4 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">NET REVENUE (সম্ভাব্য আয়)</span>
              <span class="text-lg">💵</span>
            </div>
            <div class="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              {{ settingsStore.currencySymbol }}{{ stockSummary.total_retail_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">Total retail value of all stock</div>
          </div>

          <!-- COGS / Cost -->
          <div class="bg-white dark:bg-gray-950 border border-amber-200 dark:border-amber-900/60 p-4 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">COST OF GOODS (COGS)</span>
              <span class="text-lg">📦</span>
            </div>
            <div class="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
              {{ settingsStore.currencySymbol }}{{ stockSummary.total_stock_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">Purchase price of all inventory</div>
          </div>

          <!-- Net Profit -->
          <div class="bg-white dark:bg-gray-950 border-2 border-blue-300 dark:border-blue-800 p-4 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">NET PROFIT (নিট লাভ)</span>
              <span class="text-lg">💰</span>
            </div>
            <div class="text-2xl font-bold font-mono mt-1"
              :class="(stockSummary.total_retail_value - stockSummary.total_stock_value) >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
              {{ settingsStore.currencySymbol }}{{ (stockSummary.total_retail_value - stockSummary.total_stock_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">Revenue − COGS (gross margin on inventory)</div>
          </div>

          <!-- Profit Margin % -->
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-4 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">PROFIT MARGIN %</span>
              <span class="text-lg">🎯</span>
            </div>
            <div class="text-2xl font-bold font-mono mt-1 flex items-center gap-2"
              :class="stockSummary.total_retail_value > 0 && ((stockSummary.total_retail_value - stockSummary.total_stock_value) / stockSummary.total_retail_value * 100) >= 20 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
              {{ stockSummary.total_retail_value > 0 ? (((stockSummary.total_retail_value - stockSummary.total_stock_value) / stockSummary.total_retail_value) * 100).toFixed(1) : '0.0' }}%
              <span class="text-[10px] px-1.5 py-0.5 border font-sans"
                :class="stockSummary.total_retail_value > 0 && ((stockSummary.total_retail_value - stockSummary.total_stock_value) / stockSummary.total_retail_value * 100) >= 20 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'">
                {{ stockSummary.total_retail_value > 0 && ((stockSummary.total_retail_value - stockSummary.total_stock_value) / stockSummary.total_retail_value * 100) >= 20 ? 'Healthy' : 'Moderate' }}
              </span>
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">Profit / Revenue ratio</div>
          </div>
        </div>

        <!-- Stock KPI Cards — Row 2: Inventory counts -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider">Total Medicines</div>
            <div class="text-xl font-medium font-mono text-slate-800 dark:text-gray-100 mt-0.5">{{ stockSummary.total_products }}</div>
            <div class="text-[10px] text-slate-400">{{ stockSummary.total_categories }} categories</div>
          </div>
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider">Total Units</div>
            <div class="text-xl font-medium font-mono text-slate-800 dark:text-gray-100 mt-0.5">{{ stockSummary.total_units.toLocaleString() }}</div>
            <div class="text-[10px] text-slate-400">on shelf</div>
          </div>
          <div class="bg-white dark:bg-gray-950 border border-amber-200 dark:border-amber-900/60 p-3 shadow-xs">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider">Low Stock ⚠️</div>
            <div class="text-xl font-medium font-mono text-amber-600 dark:text-amber-400 mt-0.5">{{ stockSummary.low_stock_count }}</div>
            <div class="text-[10px] text-slate-400">below reorder level</div>
          </div>
          <div class="bg-white dark:bg-gray-950 border border-red-200 dark:border-red-900/60 p-3 shadow-xs">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider">Out of Stock 🚨</div>
            <div class="text-xl font-medium font-mono text-red-600 dark:text-red-400 mt-0.5">{{ stockSummary.out_of_stock_count }}</div>
            <div class="text-[10px] text-slate-400">zero units</div>
          </div>
        </div>


        <!-- Main stock table + category sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Product Table -->
          <div class="lg:col-span-2 border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
            <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2">
              <h3 class="text-xs font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide">💊 Medicine Stock Ledger ({{ filteredStockProducts.length }} items)</h3>
            </div>
            <div class="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table class="w-full text-left text-xs font-sans border-collapse">
                <thead class="sticky top-0 bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 text-[11px] text-slate-600 dark:text-gray-400 uppercase">
                  <tr>
                    <th class="py-1.5 px-3">Medicine</th>
                    <th class="py-1.5 px-2 text-center">Category</th>
                    <th class="py-1.5 px-2 text-right">Units</th>
                    <th class="py-1.5 px-2 text-right">Cost Price</th>
                    <th class="py-1.5 px-2 text-right">Retail Price</th>
                    <th class="py-1.5 px-2 text-right">Stock Value</th>
                    <th class="py-1.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-gray-800">
                  <tr v-if="loadingStock">
                    <td colspan="7" class="py-6 text-center text-slate-400"><span class="inline-block animate-spin mr-1">⏳</span> Loading inventory...</td>
                  </tr>
                  <tr v-else-if="filteredStockProducts.length === 0">
                    <td colspan="7" class="py-8 text-center text-slate-400">No medicines in inventory yet. Add products first.</td>
                  </tr>
                  <tr v-for="item in filteredStockProducts" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                    <td class="py-2 px-3">
                      <div class="font-medium text-slate-800 dark:text-gray-100">{{ item.name }}</div>
                      <div class="text-[10px] text-slate-400 font-mono">{{ item.generic_name || item.dosage_form || '-' }}</div>
                    </td>
                    <td class="py-2 px-2 text-center text-slate-500 dark:text-gray-400">{{ item.category_name || '-' }}</td>
                    <td class="py-2 px-2 text-right font-mono font-medium text-slate-800 dark:text-gray-100">{{ item.stock_qty }}</td>
                    <td class="py-2 px-2 text-right font-mono text-amber-700 dark:text-amber-400">{{ settingsStore.currencySymbol }}{{ item.cost_price.toFixed(2) }}</td>
                    <td class="py-2 px-2 text-right font-mono text-slate-700 dark:text-gray-300">{{ settingsStore.currencySymbol }}{{ item.retail_price.toFixed(2) }}</td>
                    <td class="py-2 px-2 text-right font-mono font-medium text-emerald-700 dark:text-emerald-400">{{ settingsStore.currencySymbol }}{{ item.retail_value.toFixed(0) }}</td>
                    <td class="py-2 px-2 text-center">
                      <span class="text-[10px] px-1.5 py-0.5 font-mono uppercase border"
                        :class="item.status === 'OUT' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300' : item.status === 'LOW' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'">
                        {{ item.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs flex flex-col">
            <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2">
              <h3 class="text-xs font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide">🏷️ Category Breakdown</h3>
            </div>
            <div class="p-3 space-y-2.5 overflow-y-auto">
              <div v-if="stockCategories.length === 0" class="text-center text-slate-400 py-8 text-xs">No categories found.</div>
              <div v-for="cat in stockCategories" :key="cat.category_name" class="border border-slate-200 dark:border-gray-800 p-2.5 space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-slate-800 dark:text-gray-200">{{ cat.category_name }}</span>
                  <span class="font-mono text-emerald-700 dark:text-emerald-400">{{ settingsStore.currencySymbol }}{{ Number(cat.retail_value).toFixed(0) }}</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{{ cat.product_count }} items</span>
                  <span>{{ cat.total_units }} units</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-gray-800 h-1.5 overflow-hidden">
                  <div class="bg-blue-600 h-full" :style="{ width: `${Math.min(100, (Number(cat.retail_value) / (stockSummary.total_retail_value || 1)) * 100)}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- TAB 2: EXPIRY LOSS & RISK REPORT MODULE                               -->
      <!-- ===================================================================== -->
      <div v-else-if="activeTab === 'expiry'" class="space-y-4">
        <!-- Expiry Toolbar -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 px-3.5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
              <span>⚠️</span> FEFO Expiry Audit & Stock Loss Ledger
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="loadExpiryData"
              :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <svg :class="['w-3.5 h-3.5 text-slate-500', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Scan Expired Batches
            </button>

            <button
              @click="exportExpiryReport"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              title="Download Expiry Loss Excel CSV"
            >
              <span>📥</span> Export Loss Ledger CSV
            </button>
          </div>
        </div>

        <!-- 4 Expiry Loss KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Card 1: Actual Expired Loss -->
          <div class="bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/80 p-3.5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-red-800 dark:text-red-400 uppercase tracking-wider">TOTAL EXPIRED LOSS (নষ্ট ক্ষতি)</span>
              <span class="text-base">🚨</span>
            </div>
            <div class="text-xl font-medium text-red-700 dark:text-red-400 font-mono mt-1">
              {{ settingsStore.currencySymbol }}{{ expirySummary.expired_total_loss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-red-700 dark:text-red-300 mt-1">
              {{ expirySummary.expired_total_units }} expired units across {{ expirySummary.expired_batch_count }} batches
            </div>
          </div>

          <!-- Card 2: Critical at Risk (< 30 Days) -->
          <div class="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/80 p-3.5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">CRITICAL RISK (&lt;30 DAYS)</span>
              <span class="text-base">⏳</span>
            </div>
            <div class="text-xl font-medium text-amber-700 dark:text-amber-400 font-mono mt-1">
              {{ settingsStore.currencySymbol }}{{ expirySummary.near30_loss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
              {{ expirySummary.near30_units }} units expiring within 30 days
            </div>
          </div>

          <!-- Card 3: Moderate Risk (31-90 Days) -->
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">NEAR EXPIRY (31-90 DAYS)</span>
              <span class="text-base">⚠️</span>
            </div>
            <div class="text-xl font-medium text-slate-900 dark:text-gray-100 font-mono mt-1">
              {{ settingsStore.currencySymbol }}{{ (expirySummary.near60_loss + expirySummary.near90_loss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
              {{ expirySummary.near60_units + expirySummary.near90_units }} units in warning window
            </div>
          </div>

          <!-- Card 4: Total Value at Risk -->
          <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3.5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">TOTAL VALUE AT RISK</span>
              <span class="text-base">🛡️</span>
            </div>
            <div class="text-xl font-medium text-slate-900 dark:text-gray-100 font-mono mt-1">
              {{ settingsStore.currencySymbol }}{{ expirySummary.total_at_risk_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
              {{ expirySummary.total_at_risk_units }} units at potential risk
            </div>
          </div>
        </div>

        <!-- 1. Expired Stock Write-off Loss Ledger -->
        <div class="border border-red-200 dark:border-red-950 bg-white dark:bg-gray-950 shadow-xs">
          <div class="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 px-3 py-2 flex items-center justify-between">
            <h3 class="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🚨</span> Expired Medicines Write-off Loss Ledger (মেয়াদোত্তীর্ণ নষ্ট ওষুধের তালিকা)
            </h3>
            <span class="text-[11px] font-mono text-red-700 dark:text-red-400 font-medium">
              Total Loss: {{ settingsStore.currencySymbol }}{{ expirySummary.expired_total_loss.toFixed(2) }}
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans border-collapse">
              <thead class="bg-red-50/70 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/40 text-[11px] text-red-900 dark:text-red-300 uppercase">
                <tr>
                  <th class="py-2 px-3">Medicine Brand & Generic</th>
                  <th class="py-2 px-3">Batch Lot #</th>
                  <th class="py-2 px-3">Supplier</th>
                  <th class="py-2 px-3">Rack</th>
                  <th class="py-2 px-3 font-mono">Expiry Date</th>
                  <th class="py-2 px-3 font-mono text-right">Expired Units</th>
                  <th class="py-2 px-3 font-mono text-right">Cost Price</th>
                  <th class="py-2 px-3 font-mono text-right text-red-700 dark:text-red-400">Total Loss</th>
                  <th class="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-red-100 dark:divide-red-950/50">
                <tr v-if="expiredBatches.length === 0">
                  <td colspan="9" class="py-8 text-center text-emerald-700 dark:text-emerald-400">
                    <div class="inline-flex items-center gap-2">
                      <span>✅</span>
                      <span>Great news! No expired medicine batches found in stock.</span>
                    </div>
                  </td>
                </tr>
                <tr v-for="b in expiredBatches" :key="b.id" class="hover:bg-red-50/40 dark:hover:bg-red-950/20">
                  <td class="py-2.5 px-3">
                    <div class="font-medium text-slate-900 dark:text-gray-100">{{ b.product_name }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">{{ b.generic_name || b.category_name || 'Pharma' }}</div>
                  </td>
                  <td class="py-2.5 px-3 font-mono font-medium text-slate-700 dark:text-gray-300">{{ b.batch_number }}</td>
                  <td class="py-2.5 px-3 text-slate-600 dark:text-gray-400">{{ b.supplier_name || 'Local Supplier' }}</td>
                  <td class="py-2.5 px-3 font-mono text-slate-500">{{ b.rack_location || '-' }}</td>
                  <td class="py-2.5 px-3 font-mono text-red-700 dark:text-red-400 font-medium">
                    {{ b.expiry_date }}
                    <span class="text-[10px] block text-red-500">({{ b.days_expired }}d ago)</span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-medium text-red-700 dark:text-red-400">{{ b.expired_units }}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-gray-300">{{ settingsStore.currencySymbol }}{{ b.unit_cost.toFixed(2) }}</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-red-700 dark:text-red-400">
                    {{ settingsStore.currencySymbol }}{{ b.total_loss.toFixed(2) }}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 text-[10px] uppercase font-mono font-semibold">
                      EXPIRED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Near Expiry Risk Table (< 90 Days) -->
        <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
          <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="text-xs font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
              <span>⏳</span> Upcoming Expiry Alert Table (Next 90 Days Early Warning)
            </h3>
            <span class="text-[11px] font-mono text-slate-500">{{ nearExpiryBatches.length }} Batches at Risk</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans border-collapse">
              <thead class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 text-[11px] text-slate-600 dark:text-gray-400 uppercase">
                <tr>
                  <th class="py-2 px-3">Medicine Brand & Generic</th>
                  <th class="py-2 px-3">Batch Lot #</th>
                  <th class="py-2 px-3">Supplier</th>
                  <th class="py-2 px-3">Rack</th>
                  <th class="py-2 px-3 font-mono">Expiry Date</th>
                  <th class="py-2 px-3 font-mono text-right">Units on Shelf</th>
                  <th class="py-2 px-3 font-mono text-right">Cost Price</th>
                  <th class="py-2 px-3 font-mono text-right">Value at Risk</th>
                  <th class="py-2 px-3 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-gray-800">
                <tr v-if="nearExpiryBatches.length === 0">
                  <td colspan="9" class="py-6 text-center text-slate-400 dark:text-gray-500">
                    No upcoming batches expiring in the next 90 days.
                  </td>
                </tr>
                <tr v-for="nb in nearExpiryBatches" :key="nb.id" class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-3">
                    <div class="font-medium text-slate-800 dark:text-gray-100">{{ nb.product_name }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">{{ nb.generic_name || nb.category_name || 'Pharma' }}</div>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-slate-700 dark:text-gray-300 font-medium">{{ nb.batch_number }}</td>
                  <td class="py-2.5 px-3 text-slate-600 dark:text-gray-400">{{ nb.supplier_name || 'Supplier' }}</td>
                  <td class="py-2.5 px-3 font-mono text-slate-500">{{ nb.rack_location || '-' }}</td>
                  <td class="py-2.5 px-3 font-mono font-medium" :class="nb.days_left <= 30 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">
                    {{ nb.expiry_date }}
                    <span class="text-[10px] block">({{ nb.days_left }} days left)</span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-medium">{{ nb.stock_units }}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-gray-400">{{ settingsStore.currencySymbol }}{{ nb.unit_cost.toFixed(2) }}</td>
                  <td class="py-2.5 px-3 text-right font-mono font-medium text-amber-700 dark:text-amber-400">
                    {{ settingsStore.currencySymbol }}{{ nb.total_value_at_risk.toFixed(2) }}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span
                      class="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold border"
                      :class="nb.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300' : (nb.risk_level === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300')"
                    >
                      {{ nb.risk_level }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useReports } from '~/composables/useReports';
import { useSettingsStore } from '~/stores/settings';
import axios from 'axios';

const route = useRoute();
const settingsStore = useSettingsStore();
const {
  loading,
  error,
  pnlSummary,
  pnlTimeline,
  pnlProducts,
  pnlCategories,
  expirySummary,
  expiredBatches,
  nearExpiryBatches,
  fetchProfitLoss,
  fetchExpiryLoss,
  exportToCSV
} = useReports();

const activeTab = ref<'pnl' | 'expiry' | 'stock'>('stock');
const selectedPeriod = ref('all');
const customStartDate = ref('');
const customEndDate = ref('');
const productSearch = ref('');

// Stock Valuation Report State
const loadingStock = ref(false);
const stockSearch = ref('');
const stockSummary = ref({
  total_products: 0,
  total_categories: 0,
  total_units: 0,
  total_stock_value: 0,
  total_retail_value: 0,
  low_stock_count: 0,
  out_of_stock_count: 0
});
const stockProducts = ref<any[]>([]);
const stockCategories = ref<any[]>([]);

const filteredStockProducts = computed(() => {
  if (!stockSearch.value.trim()) return stockProducts.value;
  const q = stockSearch.value.toLowerCase();
  return stockProducts.value.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.generic_name?.toLowerCase().includes(q) ||
    p.category_name?.toLowerCase().includes(q)
  );
});

const getStockHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.client) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const tid = user?.tenantId || user?.tenant_id;
        if (user && tid && String(tid) !== 'SYSTEM') {
          headers['x-tenant-id'] = String(tid);
        }
      } catch (e) {}
    }
    if (!headers['x-tenant-id']) {
      const savedStore = localStorage.getItem('active_tenant_store');
      if (savedStore) {
        try {
          const store = JSON.parse(savedStore);
          if (store?.id) headers['x-tenant-id'] = String(store.id);
        } catch (e) {}
      }
    }
  }
  return headers;
};

const loadStockData = async () => {
  loadingStock.value = true;
  try {
    const res = await axios.get('/inventory/reports/stock', { headers: getStockHeaders() });
    if (res.data && res.data.success) {
      stockSummary.value = res.data.summary || stockSummary.value;
      stockProducts.value = res.data.products || [];
      stockCategories.value = res.data.categories || [];
    }
  } catch (err: any) {
    console.error('Failed to load stock report:', err.message);
  } finally {
    loadingStock.value = false;
  }
};

const exportStockReport = () => {
  const headers = ['Medicine', 'Generic', 'Category', 'Units on Shelf', 'Cost Price', 'Retail Price', 'Stock Value (Retail)', 'Status'];
  const rows = filteredStockProducts.value.map(p => [
    p.name, p.generic_name || '', p.category_name || '',
    p.stock_qty, p.cost_price.toFixed(2), p.retail_price.toFixed(2),
    p.retail_value.toFixed(2), p.status
  ]);
  exportToCSV('Stock_Valuation_Report', headers, rows);
};

const periodOptions = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7days', label: 'Last 7 Days' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'this_year', label: 'This Year' },
  { key: 'all', label: 'All Time' }
];

const filteredProducts = computed(() => {
  if (!productSearch.value.trim()) return pnlProducts.value;
  const q = productSearch.value.toLowerCase();
  return pnlProducts.value.filter(p =>
    p.product_name.toLowerCase().includes(q) ||
    (p.generic_name && p.generic_name.toLowerCase().includes(q)) ||
    (p.category_name && p.category_name.toLowerCase().includes(q))
  );
});

const selectPeriod = (key: string) => {
  selectedPeriod.value = key;
  customStartDate.value = '';
  customEndDate.value = '';
  loadPnlData();
};

const applyCustomDates = () => {
  if (!customStartDate.value || !customEndDate.value) {
    alert('Please select both Start and End dates.');
    return;
  }
  selectedPeriod.value = 'custom';
  fetchProfitLoss({
    startDate: customStartDate.value,
    endDate: customEndDate.value
  });
};

const loadPnlData = () => {
  if (selectedPeriod.value === 'custom' && customStartDate.value && customEndDate.value) {
    fetchProfitLoss({
      startDate: customStartDate.value,
      endDate: customEndDate.value
    });
  } else {
    fetchProfitLoss({ period: selectedPeriod.value });
  }
};

const loadExpiryData = () => {
  fetchExpiryLoss();
};

const exportPnlReport = () => {
  const headers = ['Medicine Name', 'Generic', 'Category', 'Units Sold', 'Revenue (BDT)', 'COGS (BDT)', 'Net Profit (BDT)', 'Margin %'];
  const rows = pnlProducts.value.map(p => [
    p.product_name,
    p.generic_name || '',
    p.category_name || '',
    p.units_sold,
    p.revenue.toFixed(2),
    p.cogs.toFixed(2),
    p.profit.toFixed(2),
    p.margin_pct.toFixed(2)
  ]);
  exportToCSV(`Profit_Loss_Report_${selectedPeriod.value}`, headers, rows);
};

const exportExpiryReport = () => {
  const headers = ['Medicine Name', 'Batch #', 'Supplier', 'Expiry Date', 'Expired Units', 'Unit Cost Price (BDT)', 'Total Financial Loss (BDT)', 'Days Expired'];
  const rows = expiredBatches.value.map(b => [
    b.product_name,
    b.batch_number,
    b.supplier_name || '',
    b.expiry_date,
    b.expired_units,
    b.unit_cost.toFixed(2),
    b.total_loss.toFixed(2),
    b.days_expired
  ]);
  exportToCSV('Expiry_Loss_Ledger', headers, rows);
};

onMounted(() => {
  if (route.query.tab === 'expiry') {
    activeTab.value = 'expiry';
  } else if (route.query.tab === 'stock') {
    activeTab.value = 'stock';
  }
  loadPnlData();
  loadExpiryData();
  loadStockData();
});
</script>
