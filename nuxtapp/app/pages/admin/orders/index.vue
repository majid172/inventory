<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <div class="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
        <h2 class="text-base font-extrabold text-gray-100 flex items-center gap-2">
          <span>🛍️ POS Sales Orders History</span>
        </h2>
        <div class="text-xs text-gray-400 font-mono">Completed Transactions</div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 border-b border-gray-800 text-gray-400 font-extrabold uppercase tracking-wider">
                <th class="py-3.5 px-4">ORDER ID</th>
                <th class="py-3.5 px-4">CUSTOMER</th>
                <th class="py-3.5 px-4">ITEMS PURCHASED</th>
                <th class="py-3.5 px-4">PAYMENT METHOD</th>
                <th class="py-3.5 px-4 text-right">TOTAL PAID</th>
                <th class="py-3.5 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60">
              <tr v-for="order in mockOrders" :key="order.id" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-4 font-mono font-bold text-amber-400">{{ order.id }}</td>
                <td class="py-3.5 px-4 font-extrabold text-gray-100">{{ order.customer }}</td>
                <td class="py-3.5 px-4 text-gray-300">{{ order.items }}</td>
                <td class="py-3.5 px-4 font-mono text-gray-400">{{ order.method }}</td>
                <td class="py-3.5 px-4 text-right font-mono font-black text-emerald-400">${{ order.total }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    {{ order.status }}
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
const mockOrders = [
  { id: "ORD_1082", customer: "Walk-in Customer", items: "1x Espresso Double, 1x Croissant", method: "CASH", total: "6.40", status: "COMPLETED" },
  { id: "ORD_1081", customer: "Jerome Smith", items: "2x Vanilla Latte", method: "CARD", total: "9.00", status: "COMPLETED" },
  { id: "ORD_1080", customer: "Maria Lopez", items: "1x Caramel Macchiato, 1x Muffin", method: "MOBILE", total: "8.00", status: "COMPLETED" },
  { id: "ORD_1079", customer: "Arthur Wang", items: "1x Iced Americano", method: "CASH", total: "3.80", status: "COMPLETED" },
  { id: "ORD_1078", customer: "Walk-in Customer", items: "1x Coffee Beans (250g bag)", method: "CARD", total: "14.50", status: "COMPLETED" }
];
</script>
