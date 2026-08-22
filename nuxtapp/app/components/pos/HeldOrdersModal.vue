<template>
  <div v-if="showHeldOrdersModal" class="modal-backdrop select-none">
    <div class="modal-content max-w-lg">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
        <h2 class="text-base font-black text-amber-600 dark:text-amber-500 flex items-center gap-2">
          <span>⏸ Parked / Held Orders</span>
          <span class="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-bold">{{ heldOrders.length }}</span>
        </h2>
        <button @click="showHeldOrdersModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg cursor-pointer">✕</button>
      </div>

      <div v-if="heldOrders.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
        <span class="text-3xl block mb-2">📭</span>
        <p>No parked orders available.</p>
      </div>

      <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
        <div 
          v-for="order in heldOrders" 
          :key="order.id"
          class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">{{ order.id }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">• {{ order.heldAt }}</span>
              <span class="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold">{{ order.orderType }}</span>
            </div>
            <div class="text-xs text-slate-800 dark:text-slate-300 font-bold mt-1">{{ order.customerName }}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {{ order.items.length }} items ({{ order.items.map(i => i.product.name).join(', ') }})
            </div>
          </div>

          <div class="text-right flex flex-col items-end gap-2">
            <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">${{ order.total.toFixed(2) }}</span>
            <button 
              @click="restoreHeldOrder(order.id)"
              class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Resume Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart';

const { showHeldOrdersModal, heldOrders, restoreHeldOrder } = useCart();
</script>
