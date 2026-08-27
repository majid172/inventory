<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 font-sans select-none">
      <!-- Top Action Desktop Ribbon / Quick Action Toolbar -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <NuxtLink to="/pos"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3 py-1 text-xs flex items-center gap-1 shadow-xs cursor-pointer">
              <span>💻</span> Open POS Cashier (F10)
            </NuxtLink>
            <NuxtLink to="/admin/products"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1 shadow-xs">
              <span>💊</span> Products Catalog
            </NuxtLink>
            <NuxtLink to="/admin/inventory"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1 shadow-xs">
              <span>📦</span> Batches & Stock
            </NuxtLink>
            <NuxtLink to="/admin/orders"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1 shadow-xs">
              <span>🛍️</span> Sales Orders
            </NuxtLink>
            <NuxtLink to="/admin/reports"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1 shadow-xs">
              <span>📊</span> Reports & P&L
            </NuxtLink>
          </div>

          <div class="flex items-center gap-2 text-xs font-normal">
            <span class="text-slate-500">Live Status:</span>
            <span class="text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Shift Active
            </span>
            <button @click="refreshData" :disabled="loading || dashLoading"
              class="text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 cursor-pointer ml-2 flex items-center gap-1 border border-slate-200 dark:border-gray-700 px-2 py-0.5 bg-white dark:bg-gray-800">
              <span :class="{ 'inline-block animate-spin': loading || dashLoading }">🔄</span> Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Top Desktop Executive Metric KPI Panels Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <!-- Card 1: Today Sales Revenue -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div
            class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Today's Sales Revenue</span>
            <span
              class="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 text-[10px] font-mono">LIVE</span>
          </div>
          <div class="text-2xl font-normal text-emerald-700 dark:text-emerald-400 font-mono">
            {{ settingsStore.currencySymbol }}{{ dashboard.todayRevenue.toLocaleString('en-US', {
              minimumFractionDigits:
                2, maximumFractionDigits: 2
            }) }}
          </div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1 font-mono">
            {{ dashboard.todaySales }} transactions completed today
          </div>
        </div>

        <!-- Card 2: Active Medicines Catalog -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div
            class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Active Catalog Medicines</span>
            <span>💊</span>
          </div>
          <div class="text-2xl font-normal text-slate-800 dark:text-gray-100 font-mono">
            {{ dashboard.totalProducts || products.length }} Items
          </div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1">
            Active pharmacy inventory
          </div>
        </div>

        <!-- Card 3: Prescription Required (Rx) Items -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div
            class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Prescription (Rx) Items</span>
            <span>🩺</span>
          </div>
          <div class="text-2xl font-normal text-blue-700 dark:text-sky-400 font-mono">
            {{ dashboard.rxProductsCount || rxProductsCount }} Items
          </div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1">
            Doctor Rx verification required
          </div>
        </div>

        <!-- Card 4: Near Expiry Alerts (<90 days) -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div
            class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Near Expiry Alerts</span>
            <span
              class="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-900 px-1.5 py-0.2 text-[10px] font-mono">FEFO</span>
          </div>
          <div class="text-2xl font-normal text-rose-600 dark:text-rose-400 font-mono">
            {{ dashboard.nearExpiryCount }} Batches
          </div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1 font-mono">
            Expiring within 90 days
          </div>
        </div>
      </div>

      <!-- Graphical Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <!-- Multi-Period Sales Revenue Trend (col-span-2) -->
        <div
          class="lg:col-span-2 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs flex flex-col justify-between">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <h3
                class="font-semibold text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
                <span>📈</span> Sales Revenue Trend Graph
              </h3>
              <div class="text-[11px] text-slate-400">Live sales performance across all checkout counters</div>
            </div>

            <!-- Timeframe Filter Buttons -->
            <div class="flex items-center gap-2">
              <div
                class="flex items-center bg-slate-100 dark:bg-gray-900 p-0.5 border border-slate-200 dark:border-gray-800 text-[11px]">
                <button v-for="tf in timeframes" :key="tf.key" @click="activeTimeframe = tf.key"
                  class="px-2 py-0.5 font-medium transition-all cursor-pointer"
                  :class="activeTimeframe === tf.key ? 'bg-[#107c41] text-white shadow-2xs' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'">
                  {{ tf.label }}
                </button>
              </div>

              <div class="text-right pl-2 border-l border-slate-200 dark:border-gray-800">
                <div class="text-base font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                  {{ settingsStore.currencySymbol }}{{ currentPeriodTotal.toLocaleString('en-US', {
                    minimumFractionDigits: 2, maximumFractionDigits: 2
                  }) }}
                </div>
                <div class="text-[10px] text-slate-500 dark:text-gray-400 font-mono">{{ activeTimeframeLabel }} total
                </div>
              </div>
            </div>
          </div>

          <!-- SVG Trend Chart Container -->
          <div class="flex-1 relative min-h-[160px] w-full mt-2 flex flex-col justify-end">
            <svg viewBox="0 0 700 200" class="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#107c41" stop-opacity="0.32" />
                  <stop offset="100%" stop-color="#107c41" stop-opacity="0.02" />
                </linearGradient>
              </defs>

              <!-- Horizontal subtle gridlines -->
              <line x1="0" y1="30" x2="700" y2="30" stroke="currentColor" class="text-slate-100 dark:text-gray-900"
                stroke-width="1" stroke-dasharray="4,4" />
              <line x1="0" y1="95" x2="700" y2="95" stroke="currentColor" class="text-slate-100 dark:text-gray-900"
                stroke-width="1" stroke-dasharray="4,4" />
              <line x1="0" y1="165" x2="700" y2="165" stroke="currentColor" class="text-slate-200 dark:border-gray-800"
                stroke-width="1" />

              <!-- Vertical dashed guide lines -->
              <g v-for="(point, i) in areaPoints" :key="`guide-${i}`">
                <line :x1="point.x" y1="20" :x2="point.x" y2="165" stroke="currentColor"
                  class="text-slate-100 dark:text-gray-900" stroke-width="1" stroke-dasharray="2,2" />
              </g>

              <!-- Filled Area under curve -->
              <path :d="areaPath" fill="url(#area-gradient)" />

              <!-- Main Trend Stroke Line -->
              <path :d="linePath" fill="none" stroke="#107c41" stroke-width="2.5" stroke-linecap="round"
                stroke-linejoin="round" />

              <!-- Interactive Data Points -->
              <g v-for="(point, i) in areaPoints" :key="`pt-${i}`" class="group cursor-pointer"
                @mouseenter="hoveredDayIdx = i" @mouseleave="hoveredDayIdx = null">
                <!-- Outer glow ring on hover -->
                <circle :cx="point.x" :cy="point.y" r="8"
                  class="fill-[#107c41]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <!-- Center Point Dot -->
                <circle :cx="point.x" :cy="point.y" r="4.5"
                  class="fill-white dark:fill-gray-950 stroke-[#107c41] stroke-[2.5px]" />

                <!-- Persistent / Hover Price Badge -->
                <g :transform="`translate(${point.x}, ${Math.max(18, point.y - 12)})`">
                  <text text-anchor="middle"
                    class="font-mono text-[11px] font-medium fill-slate-800 dark:fill-gray-100 select-none transition-all"
                    :class="salesData[i]?.value > 0 ? 'opacity-100 font-semibold' : 'opacity-40 group-hover:opacity-100'">
                    {{ settingsStore.currencySymbol }}{{ Number(salesData[i]?.value || 0).toFixed(0) }}
                  </text>
                </g>
              </g>
            </svg>

            <!-- X-Axis Labels (Day & Date) -->
            <div
              class="flex justify-between mt-2 border-t border-slate-200 dark:border-gray-800 pt-1.5 overflow-x-auto">
              <div v-for="(day, idx) in salesData" :key="day.label + day.date + idx"
                class="text-center font-mono cursor-pointer transition-colors px-1"
                :class="hoveredDayIdx === idx ? 'text-[#107c41] dark:text-emerald-400 font-semibold' : 'text-slate-600 dark:text-gray-400'"
                @mouseenter="hoveredDayIdx = idx" @mouseleave="hoveredDayIdx = null">
                <div class="text-[11px] uppercase font-sans font-medium">{{ day.label }}</div>
                <div class="text-[9px] text-slate-400 dark:text-gray-500 font-mono">{{ day.date ? day.date.slice(5) : ''
                }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Dispensed Medicines Breakdown -->
        <div
          class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs flex flex-col justify-between">
          <div class="w-full text-left mb-2">
            <h3
              class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>💊</span> Top Dispensed Medicines
            </h3>
            <div class="text-[11px] text-slate-400">By volume sold in store</div>
          </div>

          <!-- Dynamic List Items -->
          <div class="space-y-2 text-xs font-normal text-slate-700 dark:text-gray-300">
            <div v-if="dashboard.topMedicines.length === 0" class="text-center text-slate-400 py-6 text-xs">
              No product dispense records yet.
            </div>
            <div v-for="(med, idx) in dashboard.topMedicines" :key="med.name"
              class="flex justify-between items-center bg-slate-50 dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-1.5 truncate max-w-[170px]">
                <span class="w-2 h-2"
                  :class="idx === 0 ? 'bg-emerald-600' : idx === 1 ? 'bg-blue-600' : idx === 2 ? 'bg-purple-600' : 'bg-amber-600'"></span>
                <span class="truncate font-medium text-slate-800 dark:text-gray-200">{{ med.name }}</span>
              </div>
              <span class="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                {{ med.units_sold }} units ({{ settingsStore.currencySymbol }}{{ Number(med.revenue).toFixed(0) }})
              </span>
            </div>
          </div>

          <div
            class="text-[11px] text-slate-400 font-mono border-t border-slate-200 dark:border-gray-800 pt-1.5 text-right">
            Top Dispensed Analytics
          </div>
        </div>
      </div>

      <!-- Main Overview Content: Recent Orders & FEFO Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <!-- Recent Dispensed Sales Data Grid -->
        <div class="lg:col-span-2 border border-slate-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-950">
          <div
            class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between text-xs">
            <h3 class="font-normal text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🛍️</span> Recent Dispensed Sales & Invoices (Live Feed)
            </h3>
            <NuxtLink to="/admin/orders" class="text-emerald-700 dark:text-emerald-400 hover:underline font-normal">
              Full Sales Log →
            </NuxtLink>
          </div>

          <!-- Desktop Table Viewport -->
          <div class="overflow-x-auto">
            <table
              class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
              <thead>
                <tr
                  class="bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                  <th class="py-1.5 px-3 w-10 text-center border-r border-slate-200 dark:border-gray-800 font-normal">#
                  </th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">INVOICE NO</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">CUSTOMER</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">DISPENSED MEDICINES
                  </th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-28">
                    PAYMENT METHOD</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-24">
                    TRX NO</th>
                  <th
                    class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-normal font-mono w-24">
                    AMOUNT</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-28">
                    STATUS</th>
                  <th
                    class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-32 font-mono">
                    DATE / TIME</th>
                  <th class="py-1.5 px-3 text-center w-20 font-normal">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-950">

                <tr v-if="dashboard.recentSales.length === 0">
                  <td colspan="10" class="py-8 text-center text-slate-400 dark:text-gray-500 font-sans">
                    No sales recorded yet. Dispense items at POS Cashier.
                  </td>
                </tr>
                <tr v-for="(order, idx) in dashboard.recentSales" :key="order.id"
                  @click="selectedRow = String(order.id)" :class="[
                    'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                    selectedRow === String(order.id)
                      ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                  ]">
                  <!-- # Serial -->
                  <td
                    class="py-1.5 px-3 text-center font-mono border-r border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 w-10">
                    {{ idx + 1 }}
                  </td>

                  <!-- Invoice No -->
                  <td
                    class="py-1.5 px-3 font-mono border-r border-slate-200 dark:border-gray-800 text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap">
                    {{ order.invoice_no || ('INV-' + String(order.id).padStart(5, '0')) }}
                  </td>

                  <!-- Customer / Patient -->
                  <td
                    class="py-1.5 px-3 font-normal border-r border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 whitespace-nowrap">
                    {{ order.patient || 'Walk-in Patient' }}
                  </td>

                  <!-- Dispensed Medicines -->
                  <td
                    class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 truncate max-w-[200px]"
                    :title="order.items_summary || '1x Dispensed Item'">
                    {{ order.items_summary || `${order.items_count || 1}x Dispensed Item` }}
                  </td>

                  <!-- Payment Method -->
                  <td
                    class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center uppercase font-mono text-[10px]">
                    <span :class="[
                      'px-1.5 py-0.2 border text-[10px] uppercase font-mono inline-block',
                      (order.payment_method || '').toLowerCase() === 'cash'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                        : (order.payment_method || '').toLowerCase() === 'bkash' || (order.payment_method || '').toLowerCase() === 'mobile'
                          ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800'
                          : 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                    ]">
                      {{ order.payment_method || 'CASH' }}
                    </span>
                  </td>

                  <!-- TRX NO -->
                  <td
                    class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-mono text-[11px]">
                    <span v-if="order.transaction_no"
                      class="text-amber-700 dark:text-amber-400 font-medium px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                      {{ order.transaction_no }}
                    </span>
                    <span v-else class="text-slate-400">-</span>
                  </td>

                  <!-- Amount -->
                  <td
                    class="py-1.5 px-3 text-right font-mono font-normal text-slate-800 dark:text-gray-200 font-medium border-r border-slate-200 dark:border-gray-800 whitespace-nowrap">
                    {{ settingsStore.currencySymbol }}{{ Number(order.total || 0).toFixed(2) }}
                  </td>

                  <!-- Status -->
                  <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-normal uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 whitespace-nowrap">
                      ● {{ order.status || 'COMPLETED' }}
                    </span>
                  </td>

                  <!-- Date / Time -->
                  <td
                    class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal text-slate-500 dark:text-gray-400 text-[11px] font-mono whitespace-nowrap">
                    {{ order.formatted_date || formatDate(order.created_at) }}
                  </td>

                  <!-- Action -->
                  <td class="py-1.5 px-3 text-center" @click.stop>
                    <button @click="openInvoiceDetails(order)"
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer shadow-2xs transition-colors"
                      title="View Sale Details">
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 font-normal">
            <div>Showing latest {{ dashboard.recentSales.length }} sales transactions</div>
            <div class="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">MySQL Connection: Active</div>
          </div>
        </div>

        <!-- FEFO & Expiry Restock Warning Panel -->
        <div
          class="border border-slate-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-950 flex flex-col justify-between">
          <div>
            <div
              class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between text-xs">
              <h3
                class="font-normal text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
                <span>⚠️</span> FEFO & Expiry Alerts
              </h3>
              <NuxtLink to="/admin/reports?tab=expiry"
                class="text-rose-700 dark:text-rose-400 hover:underline font-normal">Audit →</NuxtLink>
            </div>

            <div class="p-2.5 space-y-2 text-xs">
              <div v-if="dashboard.nearExpiryAlerts.length === 0" class="text-center text-slate-400 py-6 text-xs">
                No batches expiring in the next 90 days.
              </div>
              <div v-for="item in dashboard.nearExpiryAlerts" :key="item.id"
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2 space-y-1">
                <div class="flex items-center justify-between">
                  <div class="font-normal text-slate-800 dark:text-gray-200 truncate max-w-[170px] font-medium">{{
                    item.name }}</div>
                  <span
                    class="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1 py-0.2 border border-rose-300">
                    Exp: {{ item.expiry_date }}
                  </span>
                </div>

                <div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Lot: {{ item.batch_number }}</span>
                  <span>Rack: {{ item.rack_location || '-' }}</span>
                  <span class="text-slate-700 dark:text-gray-300 font-normal">{{ item.quantity }} units</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 font-normal">
            <span>Critical FEFO Priority</span>
            <span class="text-rose-600 font-mono text-[10px]">{{ dashboard.nearExpiryCount }} batches alert</span>
          </div>
        </div>
      </div>

      <!-- Quick Receipt Details Modal -->
      <div v-if="viewInvoiceModal && selectedInvoice"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-lg shadow-xl overflow-hidden font-sans">
          <!-- Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">🧾</span>
              <div>
                <h3 class="font-bold text-xs text-slate-800 dark:text-gray-100">
                  Sale Invoice #{{ selectedInvoice.invoice_no || selectedInvoice.id }}
                </h3>
                <div class="text-[10px] text-slate-400 font-mono">{{ selectedInvoice.formatted_date ||
                  formatDate(selectedInvoice.created_at) }}</div>
              </div>
            </div>
            <button @click="viewInvoiceModal = false"
              class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-sm cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Body Info -->
          <div class="p-4 space-y-3 text-xs">
            <div
              class="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-gray-900 p-3 border border-slate-200 dark:border-gray-800">
              <div>
                <div class="text-[10px] text-slate-400 uppercase font-mono">Customer / Patient</div>
                <div class="font-semibold text-slate-800 dark:text-gray-100 mt-0.5">{{ selectedInvoice.patient ||
                  'Walk-in Patient' }}</div>
              </div>
              <div>
                <div class="text-[10px] text-slate-400 uppercase font-mono">Payment Method</div>
                <div class="font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold mt-0.5">
                  {{ selectedInvoice.payment_method }}
                  <span v-if="selectedInvoice.transaction_no" class="text-amber-600 font-mono text-[10px] ml-1">({{
                    selectedInvoice.transaction_no }})</span>
                </div>
              </div>
            </div>

            <div>
              <div class="text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-1">Dispensed Items</div>
              <div
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2.5 text-slate-700 dark:text-gray-300 font-mono text-xs">
                {{ selectedInvoice.items_summary || '1x Dispensed Prescription Items' }}
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200 dark:border-gray-800 pt-3 text-xs">
              <span class="font-semibold text-slate-700 dark:text-gray-300">Total Invoice Amount:</span>
              <span class="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {{ settingsStore.currencySymbol }}{{ Number(selectedInvoice.total || 0).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
            <NuxtLink to="/admin/orders" class="text-xs text-emerald-700 dark:text-emerald-400 hover:underline">
              Go to Full Sales Ledger →
            </NuxtLink>
            <button @click="viewInvoiceModal = false"
              class="px-3 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white text-xs font-normal cursor-pointer shadow-xs">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '~/stores/settings';
import { useProductStore } from '~/stores/products';
import { useDashboard, type RecentSaleItem } from '~/composables/useDashboard';

const loading = ref(false);
const settingsStore = useSettingsStore();
const productStore = useProductStore();
const { products, rxProductsCount } = storeToRefs(productStore);
const { dashboard, loading: dashLoading, fetchDashboard } = useDashboard();

const selectedRow = ref<string | null>(null);
const viewInvoiceModal = ref(false);
const selectedInvoice = ref<RecentSaleItem | null>(null);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
};

const openInvoiceDetails = (order: RecentSaleItem) => {
  selectedInvoice.value = order;
  viewInvoiceModal.value = true;
};

const refreshData = async () => {
  loading.value = true;
  await Promise.all([
    productStore.fetchProducts(),
    fetchDashboard()
  ]);
  loading.value = false;
};

onMounted(() => {
  productStore.fetchProducts();
  fetchDashboard();
});

const hoveredDayIdx = ref<number | null>(null);
const activeTimeframe = ref<'7d' | '30d' | 'monthly'>('7d');

const timeframes = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'monthly', label: '12 Months' }
];

const activeTimeframeLabel = computed(() => {
  if (activeTimeframe.value === '30d') return 'Last 30 days';
  if (activeTimeframe.value === 'monthly') return 'Last 12 months';
  return 'Last 7 days';
});

const currentPeriodTotal = computed(() => {
  if (activeTimeframe.value === '30d') {
    return dashboard.value.total30DayRevenue || salesData.value.reduce((s, d) => s + (Number(d.value) || 0), 0);
  }
  if (activeTimeframe.value === 'monthly') {
    return dashboard.value.totalMonthlyRevenue || salesData.value.reduce((s, d) => s + (Number(d.value) || 0), 0);
  }
  return dashboard.value.total7DayRevenue || salesData.value.reduce((s, d) => s + (Number(d.value) || 0), 0);
});

const salesData = computed(() => {
  if (activeTimeframe.value === '30d' && dashboard.value.revenueTrend30Days && dashboard.value.revenueTrend30Days.length > 0) {
    return dashboard.value.revenueTrend30Days;
  }
  if (activeTimeframe.value === 'monthly' && dashboard.value.revenueTrendMonthly && dashboard.value.revenueTrendMonthly.length > 0) {
    return dashboard.value.revenueTrendMonthly;
  }
  if (dashboard.value.revenueTrend7Days && dashboard.value.revenueTrend7Days.length > 0) {
    return dashboard.value.revenueTrend7Days;
  }
  return [
    { label: 'Mon', value: 0, date: '', invoices: 0 },
    { label: 'Tue', value: 0, date: '', invoices: 0 },
    { label: 'Wed', value: 0, date: '', invoices: 0 },
    { label: 'Thu', value: 0, date: '', invoices: 0 },
    { label: 'Fri', value: 0, date: '', invoices: 0 },
    { label: 'Sat', value: 0, date: '', invoices: 0 },
    { label: 'Sun', value: 0, date: '', invoices: 0 }
  ];
});

const areaPoints = computed(() => {
  const width = 700;
  const baselineY = 165;
  const topY = 30;
  const availableHeight = baselineY - topY;
  const data = salesData.value;
  if (!data || data.length === 0) return [];
  const step = width / Math.max(1, data.length - 1);
  const maxVal = Math.max(...data.map(d => Number(d.value) || 0));
  const max = maxVal > 0 ? maxVal * 1.15 : 100;

  return data.map((d, i) => {
    const val = Number(d.value) || 0;
    const y = val > 0 ? (baselineY - ((val / max) * availableHeight)) : baselineY;
    return {
      x: i * step,
      y
    };
  });
});

const linePath = computed(() => {
  const points = areaPoints.value;
  if (!points || points.length === 0) return '';
  return points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
  }, '');
});

const areaPath = computed(() => {
  const points = areaPoints.value;
  if (!points || points.length === 0) return '';
  const line = linePath.value;
  const width = 700;
  const baselineY = 165;
  return `${line} L ${width},${baselineY} L 0,${baselineY} Z`;
});
</script>
