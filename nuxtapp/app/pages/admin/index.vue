<template>
  <NuxtLayout name="admin">
    <div class="space-y-6 select-none">
      <!-- Quick Metric Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Today Rx Sales Revenue -->
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Today's Dispensed Rx</span>
            <span class="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full text-[10px]">+18.5%</span>
          </div>
          <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">$2,840.50</div>
          <div class="text-xs text-slate-400 dark:text-gray-500 mt-2 font-medium">From 38 completed prescriptions</div>
        </div>

        <!-- Card 2: Active Medicines Catalog -->
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active Medicines</span>
            <span class="text-emerald-600 dark:text-emerald-400">💊</span>
          </div>
          <div class="text-3xl font-black text-slate-800 dark:text-gray-100 font-mono">{{ products.length }}</div>
          <div class="text-xs text-slate-400 dark:text-gray-500 mt-2 font-medium">Across 8 pharmaceutical categories</div>
        </div>

        <!-- Card 3: Prescription Required (Rx) Items -->
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Prescription (Rx) Items</span>
            <span class="text-teal-600 dark:text-teal-400">🩺</span>
          </div>
          <div class="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">{{ rxProductsCount }}</div>
          <div class="text-xs text-slate-400 dark:text-gray-500 mt-2 font-medium">Requires licensed doctor approval</div>
        </div>

        <!-- Card 4: Near Expiry Alerts (<90 days) -->
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
          <div class="flex items-center justify-between text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Near Expiry Alerts</span>
            <span class="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">FEFO</span>
          </div>
          <div class="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">{{ expiringSoonCount }}</div>
          <div class="text-xs text-slate-400 dark:text-gray-500 mt-2 font-medium">Items expiring within 90 days</div>
        </div>
      </div>

      <!-- Main Overview Tables Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Dispensed Sales Feed -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800 mb-4">
            <h3 class="font-extrabold text-slate-800 dark:text-gray-100 text-base flex items-center gap-2">
              <span>🛍️ Recent Dispensed Prescriptions</span>
            </h3>
            <NuxtLink to="/admin/orders" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">View All Sales →</NuxtLink>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans">
              <thead>
                <tr class="border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  <th class="py-2.5">Rx Ref ID</th>
                  <th class="py-2.5">Patient Name</th>
                  <th class="py-2.5">Prescribing Doctor</th>
                  <th class="py-2.5">Type</th>
                  <th class="py-2.5 text-right">Total</th>
                  <th class="py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-gray-800/60">
                <tr v-for="order in mockRecentOrders" :key="order.id" class="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td class="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ order.id }}</td>
                  <td class="py-3 font-medium text-slate-800 dark:text-gray-200">{{ order.patient }}</td>
                  <td class="py-3 text-slate-500 dark:text-gray-400">{{ order.doctor }}</td>
                  <td class="py-3">
                    <span 
                      :class="[
                        'px-2 py-0.5 rounded text-[10px] font-bold font-mono',
                        order.type === 'Prescription (Rx)' ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' : 'bg-slate-100 text-emerald-800 border border-slate-200 dark:bg-gray-950 dark:text-emerald-300 dark:border-gray-800'
                      ]"
                    >
                      {{ order.type }}
                    </span>
                  </td>
                  <td class="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">${{ order.total }}</td>
                  <td class="py-3 text-center">
                    <span class="bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                      DISPENSED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Near Expiry & FEFO Restock Recommendations -->
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800 mb-4">
            <h3 class="font-extrabold text-slate-800 dark:text-gray-100 text-base flex items-center gap-2">
              <span>⚠️ FEFO & Expiry Warnings</span>
            </h3>
            <NuxtLink to="/admin/inventory" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Manage Batches →</NuxtLink>
          </div>

          <div class="space-y-3">
            <div 
              v-for="item in expiringItems" 
              :key="item.id"
              class="bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 rounded-xl flex items-center justify-between transition-colors"
            >
              <div>
                <div class="font-bold text-xs text-slate-800 dark:text-gray-200">{{ item.name }}</div>
                <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">Lot: {{ item.batchNumber }}</div>
                <div class="text-[10px] text-slate-500 dark:text-gray-500">Rack: {{ item.rackLocation }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-mono font-black text-rose-600 dark:text-rose-400">Exp: {{ item.expiryDate }}</div>
                <div class="text-[10px] text-slate-500 dark:text-gray-400 font-bold mt-0.5">{{ item.stockQuantity }} units left</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>


<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';

const productStore = useProductStore();
const { products, rxProductsCount, expiringSoonCount } = storeToRefs(productStore);

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
</script>
