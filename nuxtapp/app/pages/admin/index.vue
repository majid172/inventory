<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 font-sans select-none">
      <!-- Top Action Desktop Ribbon / Quick Action Toolbar -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <NuxtLink to="/pos" class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3 py-1 text-xs flex items-center gap-1 shadow-xs cursor-pointer">
              <span>💻</span> Open POS Cashier (F10)
            </NuxtLink>
            <NuxtLink to="/admin/products" class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1 shadow-xs">
              <span>💊</span> Products Catalog
            </NuxtLink>
            <NuxtLink to="/admin/inventory" class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1 shadow-xs">
              <span>📦</span> Batches & Stock
            </NuxtLink>
            <NuxtLink to="/admin/categories" class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1 shadow-xs">
              <span>📁</span> Categories
            </NuxtLink>
          </div>

          <div class="flex items-center gap-2 text-xs font-normal">
            <span class="text-slate-500">Store Shift:</span>
            <span class="text-emerald-700 dark:text-emerald-400 font-mono">Shift #1 (Active)</span>
            <button @click="refreshData" :disabled="loading" class="text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 cursor-pointer ml-2">
              <span :class="{'inline-block animate-spin': loading}">🔄</span> Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Top Desktop Executive Metric KPI Panels Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <!-- Card 1: Today Rx Sales Revenue -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Today's Sales Revenue</span>
            <span class="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 text-[10px] font-mono">+18.5%</span>
          </div>
          <div class="text-2xl font-normal text-emerald-700 dark:text-emerald-400 font-mono">$2,840.50</div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1 font-mono">38 transactions completed</div>
        </div>

        <!-- Card 2: Active Medicines Catalog -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Active Catalog Medicines</span>
            <span>💊</span>
          </div>
          <div class="text-2xl font-normal text-slate-800 dark:text-gray-100 font-mono">{{ products.length }} Items</div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1">Managed across categories</div>
        </div>

        <!-- Card 3: Prescription Required (Rx) Items -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Prescription (Rx) Items</span>
            <span>🩺</span>
          </div>
          <div class="text-2xl font-normal text-blue-700 dark:text-sky-400 font-mono">{{ rxProductsCount }} Items</div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1">Doctor Rx verification required</div>
        </div>

        <!-- Card 4: Near Expiry Alerts (<90 days) -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-[11px] font-normal uppercase tracking-wider mb-1">
            <span>Near Expiry Alerts</span>
            <span class="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-900 px-1.5 py-0.2 text-[10px] font-mono">FEFO</span>
          </div>
          <div class="text-2xl font-normal text-rose-600 dark:text-rose-400 font-mono">{{ expiringSoonCount }} Batches</div>
          <div class="text-[11px] text-slate-400 dark:text-gray-500 mt-1 font-mono">Expiring within 90 days</div>
        </div>
      </div>

      <!-- Graphical Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <!-- 7-Day Revenue Trend (col-span-2) -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
                <span>📈</span> 7-Day Revenue Trend
              </h3>
              <div class="text-[11px] text-slate-400">Daily gross sales volume across all registers</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-normal text-emerald-700 dark:text-emerald-400 font-mono">$18,452.00</div>
              <div class="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">+12% vs last week</div>
            </div>
          </div>
          
          <!-- SVG Trend Chart -->
          <div class="flex-1 relative min-h-[140px] w-full mt-2 flex flex-col justify-end">
            <svg viewBox="0 0 700 180" class="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#107c41" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#107c41" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path :d="areaPath" fill="url(#area-gradient)" />
              <path :d="linePath" fill="none" stroke="#107c41" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              <g v-for="(point, i) in areaPoints" :key="`pt-${i}`" class="group cursor-pointer">
                <circle :cx="point.x" :cy="point.y" r="4" class="fill-white dark:fill-gray-900 stroke-[#107c41] stroke-[2px]" />
                <text :x="point.x" :y="point.y - 10" class="opacity-0 group-hover:opacity-100 fill-slate-700 dark:fill-gray-200 text-[11px] font-mono text-anchor-middle transition-opacity">{{ settingsStore.currencySymbol }}{{ salesData[i].value }}</text>
              </g>
            </svg>
            
            <!-- X-Axis Labels -->
            <div class="flex justify-between mt-2 border-t border-slate-200 dark:border-gray-800 pt-1">
              <div v-for="day in salesData" :key="day.label" class="text-[10px] font-normal text-slate-500 dark:text-gray-400 uppercase w-[30px] text-center font-mono">
                {{ day.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Top Dispensed Medicines Breakdown -->
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs flex flex-col justify-between">
          <div class="w-full text-left mb-2">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>💊</span> Top Dispensed Medicines
            </h3>
            <div class="text-[11px] text-slate-400">By volume sold this month</div>
          </div>

          <!-- List Items -->
          <div class="space-y-2 text-xs font-normal text-slate-700 dark:text-gray-300">
            <div class="flex justify-between items-center bg-slate-50 dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-emerald-600"></span>
                <span>Paracetamol 500mg</span>
              </div>
              <span class="font-mono text-emerald-700 dark:text-emerald-400">35% (2.8k)</span>
            </div>
            <div class="flex justify-between items-center bg-slate-50 dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-blue-600"></span>
                <span>Amoxicillin 250mg</span>
              </div>
              <span class="font-mono text-blue-700 dark:text-blue-400">30% (2.4k)</span>
            </div>
            <div class="flex justify-between items-center bg-slate-50 dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-purple-600"></span>
                <span>Omeprazole 20mg</span>
              </div>
              <span class="font-mono text-purple-700 dark:text-purple-400">20% (1.6k)</span>
            </div>
            <div class="flex justify-between items-center bg-slate-50 dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-amber-600"></span>
                <span>Cetirizine 10mg</span>
              </div>
              <span class="font-mono text-amber-700 dark:text-amber-400">15% (1.2k)</span>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 font-mono border-t border-slate-200 dark:border-gray-800 pt-1.5 text-right">
            Total Dispensed: 8.2k units
          </div>
        </div>
      </div>

      <!-- Main Overview Content: Recent Orders & FEFO Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <!-- Recent Dispensed Sales Data Grid -->
        <div class="lg:col-span-2 border border-slate-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-950">
          <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between text-xs">
            <h3 class="font-normal text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🛍️</span> Recent Dispensed Sales & Prescriptions
            </h3>
            <NuxtLink to="/admin/orders" class="text-emerald-700 dark:text-emerald-400 hover:underline font-normal">
              Full Sales Log →
            </NuxtLink>
          </div>

          <!-- Desktop Table Viewport -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
              <thead>
                <tr class="bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                  <th class="py-1.5 px-3 w-10 text-center border-r border-slate-200 dark:border-gray-800 font-normal">#</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Rx REF ID</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Patient Name</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Prescribing Doctor</th>
                  <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Type</th>
                  <th class="py-1.5 px-3 text-right font-normal font-mono w-24">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                <tr 
                  v-for="(order, idx) in mockRecentOrders" 
                  :key="order.id" 
                  @click="selectedRow = order.id"
                  :class="[
                    'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                    selectedRow === order.id 
                      ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white' 
                      : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                  ]"
                >
                  <td class="py-1.5 px-3 text-center font-mono border-r border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400">
                    {{ idx + 1 }}
                  </td>
                  <td class="py-1.5 px-3 font-mono border-r border-slate-200 dark:border-gray-800 text-emerald-700 dark:text-emerald-400">
                    {{ order.id }}
                  </td>
                  <td class="py-1.5 px-3 font-normal border-r border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200">
                    {{ order.patient }}
                  </td>
                  <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                    {{ order.doctor }}
                  </td>
                  <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono">
                    <span :class="[
                      'text-[10px] px-1.5 py-0.2 border uppercase',
                      order.type.includes('Rx') ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                    ]">
                      {{ order.type }}
                    </span>
                  </td>
                  <td class="py-1.5 px-3 text-right font-mono font-normal text-slate-800 dark:text-gray-200">
                    {{ settingsStore.currencySymbol }}{{ order.total }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 font-normal">
            <div>Showing 5 latest sales transactions</div>
            <div class="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">MySQL Connection: Active</div>
          </div>
        </div>

        <!-- FEFO & Expiry Restock Warning Panel -->
        <div class="border border-slate-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-950 flex flex-col justify-between">
          <div>
            <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between text-xs">
              <h3 class="font-normal text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
                <span>⚠️</span> FEFO & Expiry Alerts
              </h3>
              <NuxtLink to="/admin/inventory" class="text-rose-700 dark:text-rose-400 hover:underline font-normal">Batches →</NuxtLink>
            </div>

            <div class="p-2.5 space-y-2 text-xs">
              <div 
                v-for="item in expiringItems" 
                :key="item.id"
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2 space-y-1"
              >
                <div class="flex items-center justify-between">
                  <div class="font-normal text-slate-800 dark:text-gray-200 truncate max-w-[170px]">{{ item.name }}</div>
                  <span class="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1 py-0.2 border border-rose-300">
                    Exp: {{ item.expiryDate }}
                  </span>
                </div>
                
                <div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Lot: {{ item.batchNumber }}</span>
                  <span>Rack: {{ item.rackLocation }}</span>
                  <span class="text-slate-700 dark:text-gray-300 font-normal">{{ item.stockQuantity }} left</span>
                </div>
              </div>
            </div>
          </div>

          <div class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 font-normal">
            <span>Critical FEFO Priority</span>
            <span class="text-rose-600 font-mono text-[10px]">Restock Needed</span>
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

const loading = ref(false);
const settingsStore = useSettingsStore();
const productStore = useProductStore();
const { products, rxProductsCount, expiringSoonCount } = storeToRefs(productStore);

const selectedRow = ref<string | null>(null);

const refreshData = async () => {
  loading.value = true;
  await productStore.fetchProducts();
  loading.value = false;
};

onMounted(() => {
  productStore.fetchProducts();
});

const expiringItems = computed(() => {
  return products.value.slice(0, 4);
});

const mockRecentOrders = [
  { id: "RX_2841", patient: "Eleanor Vance", doctor: "Dr. A. Miller", type: "Prescription (Rx)", total: "42.50" },
  { id: "RX_2840", patient: "Marcus Brody", doctor: "N/A (OTC)", type: "OTC Dispense", total: "14.80" },
  { id: "RX_2839", patient: "Sophia Martinez", doctor: "Dr. K. Patel", type: "Prescription (Rx)", total: "68.00" },
  { id: "RX_2838", patient: "Walk-in Patient", doctor: "N/A (OTC)", type: "OTC Dispense", total: "9.20" },
  { id: "RX_2837", patient: "David Kim", doctor: "Dr. R. Hayes", type: "Home Delivery", total: "34.50" }
];

const salesData = [
  { label: 'Mon', value: 2100 },
  { label: 'Tue', value: 2450 },
  { label: 'Wed', value: 1950 },
  { label: 'Thu', value: 2800 },
  { label: 'Fri', value: 3100 },
  { label: 'Sat', value: 3500 },
  { label: 'Sun', value: 2552 }
];

const areaPoints = computed(() => {
  const width = 700;
  const height = 180;
  const step = width / (salesData.length - 1);
  const max = Math.max(...salesData.map(d => d.value)) * 1.15;
  
  return salesData.map((d, i) => {
    return {
      x: i * step,
      y: height - ((d.value / max) * height)
    };
  });
});

const linePath = computed(() => {
  const points = areaPoints.value;
  if (points.length === 0) return '';
  return points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
  }, '');
});

const areaPath = computed(() => {
  const points = areaPoints.value;
  if (points.length === 0) return '';
  const line = linePath.value;
  const width = 700;
  const height = 180;
  return `${line} L ${width},${height} L 0,${height} Z`;
});
</script>
