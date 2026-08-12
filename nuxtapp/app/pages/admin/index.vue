<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <!-- Quick Metric Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Today Revenue -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Today's Sales Revenue</span>
            <span class="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px]">+14.2%</span>
          </div>
          <div class="text-3xl font-black text-emerald-400 font-mono">$1,482.50</div>
          <div class="text-xs text-gray-500 mt-2 font-medium">From 142 completed POS orders</div>
        </div>

        <!-- Card 2: Active Categories -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Menu Categories</span>
            <span class="text-amber-400">📁</span>
          </div>
          <div class="text-3xl font-black text-gray-100 font-mono">{{ categories.length }}</div>
          <div class="text-xs text-gray-500 mt-2 font-medium">Hot Drinks, Bakery, Cold Brews</div>
        </div>

        <!-- Card 3: Menu Products -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Menu Products</span>
            <span class="text-amber-400">☕</span>
          </div>
          <div class="text-3xl font-black text-gray-100 font-mono">{{ products.length }}</div>
          <div class="text-xs text-gray-500 mt-2 font-medium">Active items on POS catalog</div>
        </div>

        <!-- Card 4: Low Stock Alert -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Low Stock Items</span>
            <span class="text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">ATTN</span>
          </div>
          <div class="text-3xl font-black text-rose-400 font-mono">{{ lowStockCount }}</div>
          <div class="text-xs text-gray-500 mt-2 font-medium">Whole Milk & Oat Milk restock needed</div>
        </div>
      </div>

      <!-- Main Overview Tables Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Orders Feed -->
        <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
            <h3 class="font-extrabold text-gray-100 text-base flex items-center gap-2">
              <span>🛍️ Recent POS Sales Orders</span>
            </h3>
            <NuxtLink to="/admin/orders" class="text-xs text-amber-400 hover:text-amber-300 font-bold">View All →</NuxtLink>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans">
              <thead>
                <tr class="border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th class="py-2.5">Order ID</th>
                  <th class="py-2.5">Customer</th>
                  <th class="py-2.5">Type</th>
                  <th class="py-2.5 text-right">Total</th>
                  <th class="py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/60">
                <tr v-for="order in mockRecentOrders" :key="order.id" class="hover:bg-gray-800/40 transition-colors">
                  <td class="py-3 font-mono font-bold text-amber-400">{{ order.id }}</td>
                  <td class="py-3 font-medium text-gray-200">{{ order.customer }}</td>
                  <td class="py-3 text-gray-400">{{ order.type }}</td>
                  <td class="py-3 text-right font-mono font-bold text-emerald-400">${{ order.total }}</td>
                  <td class="py-3 text-center">
                    <span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Inventory Restock Recommendations -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
            <h3 class="font-extrabold text-gray-100 text-base flex items-center gap-2">
              <span>⚠️ Low Stock Alerts</span>
            </h3>
            <NuxtLink to="/admin/ingredients" class="text-xs text-amber-400 hover:text-amber-300 font-bold">Manage Stock →</NuxtLink>
          </div>

          <div class="space-y-3">
            <div 
              v-for="ing in lowStockIngredients" 
              :key="ing.id"
              class="bg-gray-950 border border-gray-800 p-3 rounded-xl flex items-center justify-between"
            >
              <div>
                <div class="font-bold text-xs text-gray-200">{{ ing.name }}</div>
                <div class="text-[11px] text-gray-400 mt-0.5">Supplier: {{ ing.supplier }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-mono font-black text-rose-400">{{ ing.stock }} {{ ing.unit }}</div>
                <div class="text-[10px] text-gray-500">Min: {{ ing.min_level }} {{ ing.unit }}</div>
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
import { useAdminCategories } from '~/composables/useAdminCategories';
import { useAdminProducts } from '~/composables/useAdminProducts';
import { useAdminIngredients } from '~/composables/useAdminIngredients';

const { categories, fetchCategories } = useAdminCategories();
const { products, fetchProducts } = useAdminProducts();
const { ingredients } = useAdminIngredients();

onMounted(() => {
  fetchCategories();
  fetchProducts();
});

const lowStockIngredients = computed(() => ingredients.value.filter(i => i.stock <= i.min_level));
const lowStockCount = computed(() => lowStockIngredients.value.length);

const mockRecentOrders = [
  { id: "ORD_1082", customer: "Walk-in Customer", type: "Dine In", total: "14.20" },
  { id: "ORD_1081", customer: "Jerome Smith", type: "Takeaway", total: "9.50" },
  { id: "ORD_1080", customer: "Maria Lopez", type: "Delivery", total: "22.40" },
  { id: "ORD_1079", customer: "Arthur Wang", type: "Dine In", total: "7.80" },
  { id: "ORD_1078", customer: "Walk-in Customer", type: "Takeaway", total: "11.50" }
];
</script>
