<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Toolbar & Expiry Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase">Total Tracked Batches</div>
            <div class="text-2xl font-black text-gray-100 font-mono mt-1">{{ products.length }}</div>
          </div>
          <span class="text-2xl">📦</span>
        </div>

        <div class="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-amber-400 uppercase">Near Expiry (&lt;90 Days)</div>
            <div class="text-2xl font-black text-amber-400 font-mono mt-1">{{ expiringSoonCount }}</div>
          </div>
          <span class="text-2xl">⚠️</span>
        </div>

        <div class="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-emerald-400 uppercase">FEFO Status</div>
            <div class="text-xs text-emerald-300 font-bold mt-1">First-Expired First-Out Enforced</div>
          </div>
          <span class="text-2xl">🛡️</span>
        </div>
      </div>

      <!-- Main Batch & Expiry Table -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg space-y-4 p-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-800">
          <h2 class="text-base font-extrabold text-gray-100 flex items-center gap-2">
            <span>📦 Batch & Expiry Inventory Balance (FEFO)</span>
          </h2>
          <input 
            type="text" 
            v-model="filterText" 
            placeholder="Filter batch #, medicine, or rack..." 
            class="bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 border-b border-gray-800 text-gray-400 font-extrabold uppercase tracking-wider">
                <th class="py-3.5 px-4 w-10">#</th>
                <th class="py-3.5 px-4">BATCH LOT #</th>
                <th class="py-3.5 px-4">MEDICINE BRAND & GENERIC</th>
                <th class="py-3.5 px-4">RACK / SHELF</th>
                <th class="py-3.5 px-4 text-right">UNITS IN STOCK</th>
                <th class="py-3.5 px-4">EXPIRY DATE</th>
                <th class="py-3.5 px-4 text-center">FEFO EXPIRY STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60">
              <tr v-for="(item, idx) in batchList" :key="item.id" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-4 text-gray-500 font-mono">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">
                  {{ item.batchNumber }}
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-extrabold text-gray-100 flex items-center gap-1.5">
                    <span>{{ item.icon }}</span>
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="text-[10px] text-emerald-400 font-medium">🧪 {{ item.genericName }} ({{ item.strength }})</div>
                </td>
                <td class="py-3.5 px-4 text-gray-300 font-mono">📍 {{ item.rackLocation }}</td>
                <td class="py-3.5 px-4 text-right font-mono font-black text-sm text-gray-100">
                  {{ item.stockQuantity }} units
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-gray-200">
                  {{ item.expiryDate }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span 
                    :class="[
                      'px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider',
                      item.expiryStatus.color
                    ]"
                  >
                    {{ item.expiryStatus.label }}
                  </span>
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
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';

const productStore = useProductStore();
const { products, expiringSoonCount } = storeToRefs(productStore);
const filterText = ref('');

const getExpiryStatus = (dateStr?: string) => {
  if (!dateStr) return { label: 'GOOD STOCK', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
  const today = new Date();
  const exp = new Date(dateStr);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));

  if (diffDays <= 0) {
    return { label: 'EXPIRED - DO NOT DISPENSE', color: 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse' };
  } else if (diffDays <= 30) {
    return { label: `CRITICAL (${diffDays} DAYS LEFT)`, color: 'bg-rose-950 text-rose-300 border-rose-800' };
  } else if (diffDays <= 90) {
    return { label: `WARNING (${diffDays} DAYS LEFT)`, color: 'bg-amber-950 text-amber-400 border-amber-800' };
  } else {
    return { label: 'GOOD STOCK', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
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
      strength: p.strength || '500mg',
      batchNumber: p.batchNumber || `BATCH-${p.id}`,
      expiryDate: p.expiryDate || '2027-12-31',
      rackLocation: p.rackLocation || 'Shelf A-01',
      stockQuantity: p.stockQuantity || 50,
      icon: p.icon || '💊',
      expiryStatus: getExpiryStatus(p.expiryDate)
    }));
});
</script>
