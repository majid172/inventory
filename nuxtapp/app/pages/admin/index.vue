<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Top Desktop Executive Metric KPI Panels Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Card 1: Today Rx Sales Revenue -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>Today's Dispensed Rx</span>
            <span class="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-black">+18.5%</span>
          </div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">$2,840.50</div>
          <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-mono font-medium">38 prescriptions completed</div>
        </div>

        <!-- Card 2: Active Medicines Catalog -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>Active Medicines</span>
            <span class="text-emerald-600 dark:text-emerald-400">💊</span>
          </div>
          <div class="text-2xl font-black text-slate-900 dark:text-gray-100 font-mono">{{ products.length }}</div>
          <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-medium">Across active categories</div>
        </div>

        <!-- Card 3: Prescription Required (Rx) Items -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>Prescription (Rx) Items</span>
            <span class="text-sky-600 dark:text-sky-400">🩺</span>
          </div>
          <div class="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">{{ rxProductsCount }}</div>
          <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-medium">Doctor Rx verification required</div>
        </div>

        <!-- Card 4: Near Expiry Alerts (<90 days) -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>Near Expiry Alerts</span>
            <span class="text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-900 px-1.5 py-0.2 rounded text-[10px] font-black animate-pulse">FEFO</span>
          </div>
          <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{{ expiringSoonCount }}</div>
          <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-mono font-medium">Expiring within 90 days</div>
        </div>
      </div>

      <!-- Graphical Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <!-- 7-Day Revenue Area Graph (col-span-2) -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-4 shadow-sm flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h3 class="font-extrabold text-sm text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
                <span>📈</span> 7-Day Revenue Trend
              </h3>
              <div class="text-[11px] text-slate-500 dark:text-gray-400 font-medium">Daily gross sales volume across all registers</div>
            </div>
            <div class="text-right">
              <div class="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">$18,452.00</div>
              <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">+12% vs last week</div>
            </div>
          </div>
          
          <!-- SVG Area Chart -->
          <div class="flex-1 relative min-h-[160px] w-full mt-4 flex flex-col justify-end">
            <svg viewBox="0 0 700 200" class="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <!-- Filled Area -->
              <path :d="areaPath" fill="url(#area-gradient)" class="transition-all duration-700 ease-in-out" />
              <!-- Stroke Line -->
              <path :d="linePath" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-700 ease-in-out drop-shadow-md" />
              <!-- Data Points -->
              <g v-for="(point, i) in areaPoints" :key="`pt-${i}`" class="group cursor-pointer">
                <circle :cx="point.x" :cy="point.y" r="5" class="fill-white dark:fill-gray-900 stroke-sky-500 stroke-[3px] transition-all duration-300 group-hover:r-7 group-hover:stroke-blue-600" />
                <text :x="point.x" :y="point.y - 15" class="opacity-0 group-hover:opacity-100 fill-slate-700 dark:fill-gray-200 text-[12px] font-bold text-anchor-middle transition-opacity shadow-sm">${{ salesData[i].value }}</text>
              </g>
            </svg>
            
            <!-- X-Axis Labels -->
            <div class="flex justify-between mt-2 border-t border-slate-200 dark:border-gray-800 pt-2">
              <div v-for="day in salesData" :key="day.label" class="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase w-[30px] text-center">
                {{ day.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Top Selling Medicines Pie/Donut Chart (col-span-1) -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-4 shadow-sm flex flex-col items-center justify-between">
          <div class="w-full text-left mb-2">
            <h3 class="font-extrabold text-sm text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>💊</span> Top Selling Medicines
            </h3>
            <div class="text-[11px] text-slate-500 dark:text-gray-400 font-medium">By volume dispensed this month</div>
          </div>

          <!-- CSS Conic Donut Chart -->
          <div class="relative w-40 h-40 rounded-full flex items-center justify-center shadow-xl transform transition-transform hover:scale-105 duration-300"
               style="background: conic-gradient(
                  #0ea5e9 0% 35%,
                  #6366f1 35% 65%,
                  #8b5cf6 65% 85%,
                  #ec4899 85% 100%
               )">
               <div class="w-24 h-24 bg-white dark:bg-gray-950 rounded-full flex items-center justify-center flex-col shadow-inner">
                  <span class="font-black text-xl text-slate-800 dark:text-gray-100">8.2k</span>
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Dispensed</span>
               </div>
          </div>

          <!-- Chart Legend -->
          <div class="mt-4 w-full space-y-2 text-xs font-bold text-slate-600 dark:text-gray-300">
             <div class="flex justify-between items-center hover:bg-slate-50 dark:hover:bg-gray-900 p-1 rounded transition-colors cursor-pointer">
               <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-sky-500 shadow-sm"></span> Paracetamol 500mg</div>
               <span class="font-mono text-sky-600 dark:text-sky-400">35%</span>
             </div>
             <div class="flex justify-between items-center hover:bg-slate-50 dark:hover:bg-gray-900 p-1 rounded transition-colors cursor-pointer">
               <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-indigo-500 shadow-sm"></span> Amoxicillin 250mg</div>
               <span class="font-mono text-indigo-600 dark:text-indigo-400">30%</span>
             </div>
             <div class="flex justify-between items-center hover:bg-slate-50 dark:hover:bg-gray-900 p-1 rounded transition-colors cursor-pointer">
               <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-violet-500 shadow-sm"></span> Omeprazole 20mg</div>
               <span class="font-mono text-violet-600 dark:text-violet-400">20%</span>
             </div>
             <div class="flex justify-between items-center hover:bg-slate-50 dark:hover:bg-gray-900 p-1 rounded transition-colors cursor-pointer">
               <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-pink-500 shadow-sm"></span> Cetirizine 10mg</div>
               <span class="font-mono text-pink-600 dark:text-pink-400">15%</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Main Overview Content: Data Grid & FEFO Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Recent Dispensed Sales Data Grid -->
        <div class="lg:col-span-2 border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="font-extrabold text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🛍️</span> Recent Dispensed Prescription Audit Feed
            </h3>
            <NuxtLink to="/admin/orders" class="text-xs text-blue-700 dark:text-sky-400 hover:underline font-bold">View Full Sales Log →</NuxtLink>
          </div>

          <!-- Desktop Table Viewport with 1px Gridlines -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
              <thead>
                <tr class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                  <th class="py-2 px-2.5 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">#</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">Rx REF ID</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">PATIENT NAME</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">PRESCRIBING DOCTOR</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">DISPENSE TYPE</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-right">TOTAL</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(order, idx) in mockRecentOrders" 
                  :key="order.id" 
                  @click="selectedRow = order.id"
                  :class="[
                    'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                    selectedRow === order.id 
                      ? 'bg-sky-500 text-white font-bold' 
                      : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
                  ]"
                >
                  <td 
                    class="py-2 px-2.5 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                    :class="selectedRow === order.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'"
                  >
                    {{ idx + 1 }}
                  </td>
                  <td class="py-2 px-2.5 font-mono font-bold border border-slate-300 dark:border-gray-800" :class="selectedRow === order.id ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'">
                    {{ order.id }}
                  </td>
                  <td class="py-2 px-2.5 font-extrabold border border-slate-300 dark:border-gray-800">
                    <span :class="selectedRow === order.id ? 'text-white' : 'text-blue-700 dark:text-sky-400 hover:underline'">{{ order.patient }}</span>
                  </td>
                  <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-medium" :class="selectedRow === order.id ? 'text-white' : 'text-slate-600 dark:text-gray-400'">
                    {{ order.doctor }}
                  </td>
                  <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-mono">
                    <span :class="selectedRow === order.id ? 'bg-white/20 text-white border-white/40' : order.type === 'Prescription (Rx)' ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' : 'bg-slate-100 text-emerald-800 border-slate-200 dark:bg-gray-950 dark:text-emerald-300 dark:border-gray-800'" class="px-1.5 py-0.2 rounded border text-[10px] font-bold">
                      {{ order.type }}
                    </span>
                  </td>
                  <td class="py-2 px-2.5 text-right font-mono font-black border border-slate-300 dark:border-gray-800" :class="selectedRow === order.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'">
                    ${{ order.total }}
                  </td>
                  <td class="py-2 px-2.5 text-center border border-slate-300 dark:border-gray-800">
                    <span :class="selectedRow === order.id ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'" class="px-2 py-0.2 rounded text-[10px] font-black border uppercase">
                      DISPENSED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-3 py-1.5 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-400">
            <div>Showing 5 latest sales transactions</div>
            <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Audit Feed Active</div>
          </div>
        </div>

        <!-- FEFO & Expiry Restock Warning Panel -->
        <div class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="font-extrabold text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>⚠️</span> FEFO & Batch Expiry Alerts
            </h3>
            <NuxtLink to="/admin/inventory" class="text-xs text-rose-700 dark:text-rose-400 hover:underline font-bold">Batches →</NuxtLink>
          </div>

          <div class="p-2 space-y-2">
            <div 
              v-for="item in expiringItems" 
              :key="item.id"
              class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 p-2.5 rounded hover:border-rose-400 transition-colors shadow-sm"
            >
              <div class="flex items-center justify-between">
                <div class="font-bold text-xs text-slate-900 dark:text-gray-100 truncate max-w-[170px]">{{ item.name }}</div>
                <span class="text-[10px] font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900">
                  Exp: {{ item.expiryDate }}
                </span>
              </div>
              
              <div class="flex items-center justify-between mt-1 text-[11px] font-mono">
                <span class="text-emerald-700 dark:text-emerald-400 font-semibold">Lot: {{ item.batchNumber }}</span>
                <span class="text-slate-600 dark:text-gray-400">📍 {{ item.rackLocation }}</span>
                <span class="font-bold text-slate-800 dark:text-gray-200">{{ item.stockQuantity }} units left</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';

const productStore = useProductStore();
const { products, rxProductsCount, expiringSoonCount } = storeToRefs(productStore);

const selectedRow = ref<string | null>(null);

onMounted(() => {
  productStore.fetchProducts();
});

const expiringItems = computed(() => {
  return products.value.slice(0, 5);
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

const maxSale = Math.max(...salesData.map(d => d.value));

// SVG Graph Calculations
const areaPoints = computed(() => {
  const width = 700;
  const height = 200;
  const step = width / (salesData.length - 1);
  const max = Math.max(...salesData.map(d => d.value)) * 1.1; // Add 10% padding top
  
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
    // Smooth bezier curve approximations (simplified)
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
  const height = 200;
  // Close the path to form an area down to the bottom
  return `${line} L ${width},${height} L 0,${height} Z`;
});
</script>
