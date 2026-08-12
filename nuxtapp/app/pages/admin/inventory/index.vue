<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <div class="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
        <h2 class="text-base font-extrabold text-gray-100 flex items-center gap-2">
          <span>📦 Overall Inventory Balance</span>
        </h2>
        <div class="text-xs text-gray-400 font-mono">Real-time Stock Monitor</div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 border-b border-gray-800 text-gray-400 font-extrabold uppercase tracking-wider">
                <th class="py-3.5 px-4">ITEM NAME</th>
                <th class="py-3.5 px-4">TYPE</th>
                <th class="py-3.5 px-4 text-right">IN STOCK</th>
                <th class="py-3.5 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60">
              <tr v-for="item in inventoryList" :key="item.id" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-4 font-extrabold text-gray-100">{{ item.name }}</td>
                <td class="py-3.5 px-4 text-gray-400">{{ item.type }}</td>
                <td class="py-3.5 px-4 text-right font-mono font-black text-emerald-400">{{ item.stock }} {{ item.unit }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    {{ item.status }}
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
import { computed } from 'vue';
import { useAdminIngredients } from '~/composables/useAdminIngredients';

const { ingredients } = useAdminIngredients();

const inventoryList = computed(() => {
  return ingredients.value.map(i => ({
    id: i.id,
    name: i.name,
    type: 'Raw Ingredient',
    stock: i.stock,
    unit: i.unit,
    status: i.status
  }));
});
</script>
