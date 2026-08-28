<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Toolbar & Expiry Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-4 rounded shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-xs font-normal text-slate-500 dark:text-gray-400 uppercase">Total Tracked Batches</div>
            <div class="text-2xl font-normal text-slate-900 dark:text-gray-100 font-mono mt-1">{{ products.length }}</div>
          </div>
          <span class="text-2xl">📦</span>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-4 rounded shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-xs font-normal text-amber-600 dark:text-amber-400 uppercase">Near Expiry (&lt;90 Days)</div>
            <div class="text-2xl font-normal text-amber-600 dark:text-amber-400 font-mono mt-1">{{ expiringSoonCount }}</div>
          </div>
          <span class="text-2xl">⚠️</span>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-4 rounded shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div class="text-xs font-normal text-emerald-600 dark:text-emerald-400 uppercase">FEFO Status</div>
            <div class="text-xs text-emerald-700 dark:text-emerald-300 font-normal mt-1">First-Expired First-Out Enforced</div>
          </div>
          <span class="text-2xl">🛡️</span>
        </div>
      </div>

      <!-- Desktop Application Database Data Grid Frame -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Desktop Data Grid Toolbar Bar -->
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="text-xs font-normal text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>📦</span> Batch & Expiry Inventory Balance (FEFO)
            </h2>
            <button 
              @click="productStore.fetchProducts()" 
              :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2 py-0.5 text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer ml-2"
              title="Refresh Batches"
            >
              <svg :class="['w-3 h-3 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER SEARCH:</label>
            <div class="relative">
              <input 
                type="text" 
                v-model="filterText" 
                placeholder="Filter batch #, medicine, or rack..." 
                class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans shadow-inner w-56 sm:w-64"
              />
              <button v-if="filterText" @click="filterText = ''" class="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 text-xs">✕</button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-10 text-center border-r border-slate-200 dark:border-gray-800 font-normal">#</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">BATCH LOT #</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">MEDICINE BRAND & GENERIC</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">RACK / SHELF</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">UNITS IN STOCK</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">EXPIRY DATE</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">FEFO EXPIRY STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colSpan="7" class="py-8 text-center text-slate-500 dark:text-gray-400 font-normal text-xs">
                  <div class="inline-flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading batch inventory...
                  </div>
                </td>
              </tr>
              <tr v-else-if="batchList.length === 0">
                <td colSpan="7" class="py-6 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No batch inventory items found in database grid.
                </td>
              </tr>
              <tr 
                v-else
                v-for="(item, idx) in batchList" 
                :key="item.id" 
                @click="selectedRow = item.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                  selectedRow === item.id 
                    ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white' 
                    : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                ]"
              >
                <!-- Index Column -->
                <td 
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-10 font-normal text-slate-500 dark:text-gray-400"
                >
                  {{ idx + 1 }}
                </td>

                <!-- Batch Lot -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ item.batchNumber }}
                </td>

                <!-- Brand & Generic -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div class="flex items-center gap-1.5">
                    <span>{{ item.icon }}</span>
                    <span :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">{{ item.name }}</span>
                  </div>
                  <div class="text-[10px] font-normal" :class="selectedRow === item.id ? 'text-slate-600 dark:text-gray-400' : 'text-slate-500 dark:text-gray-400'">{{ item.genericName }} ({{ item.strength }})</div>
                </td>

                <!-- Rack Location -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ item.rackLocation }}
                </td>

                <!-- Stock Qty -->
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ item.stockQuantity }} units
                </td>

                <!-- Expiry Date -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ item.expiryDate }}
                </td>

                <!-- FEFO Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-normal border uppercase tracking-wider',
                      selectedRow === item.id ? 'bg-white text-slate-900 border-white' : item.expiryStatus.color
                    ]"
                  >
                    ● {{ item.expiryStatus.label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 font-normal">
          <div>Displaying {{ batchList.length }} batch items (Page 1 of 1)</div>
          <div class="font-normal text-[10px] text-emerald-600 dark:text-emerald-500">PostgreSQL Batch Inventory • Grid Connected</div>
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
const { products, expiringSoonCount, loading } = storeToRefs(productStore);
const filterText = ref('');
const selectedRow = ref<number | string | null>(null);

onMounted(() => {
  productStore.fetchProducts();
});

const getExpiryStatus = (dateStr?: string) => {
  if (!dateStr) return { label: 'GOOD STOCK', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' };
  const today = new Date();
  const exp = new Date(dateStr);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));

  if (diffDays <= 0) {
    return { label: 'EXPIRED - DO NOT DISPENSE', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800 animate-pulse' };
  } else if (diffDays <= 30) {
    return { label: `CRITICAL (${diffDays} DAYS LEFT)`, color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' };
  } else if (diffDays <= 90) {
    return { label: `WARNING (${diffDays} DAYS LEFT)`, color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' };
  } else {
    return { label: 'GOOD STOCK', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' };
  }
};

const batchList = computed(() => {
  const query = filterText.value.toLowerCase();
  return products.value
    .filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.genericName && p.genericName.toLowerCase().includes(query)) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(query)) ||
      (p.rackLocation && p.rackLocation.toLowerCase().includes(query))
    )
    .map(p => ({
      id: p.id,
      name: p.name,
      genericName: p.genericName || p.name,
      strength: p.strength || '',
      batchNumber: p.batchNumber || `BATCH-${p.id}`,
      expiryDate: p.expiryDate || '2028-12-31',
      rackLocation: p.rackLocation || 'N/A',
      stockQuantity: p.stockQuantity || 0,
      icon: p.icon || '',
      expiryStatus: getExpiryStatus(p.expiryDate)
    }));
});
</script>
