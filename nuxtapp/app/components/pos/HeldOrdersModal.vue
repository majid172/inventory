<template>
  <div v-if="showHeldOrdersModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
    <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-lg shadow-lg overflow-hidden font-sans">
      <!-- Titlebar -->
      <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
        <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
          <span>⏸</span> Parked / Held Orders ({{ heldOrders.length }})
        </h3>
        <button @click="showHeldOrdersModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
      </div>

      <div class="p-3.5 space-y-2 text-xs">
        <div v-if="heldOrders.length === 0" class="text-center py-8 text-slate-400 dark:text-gray-500 text-xs">
          <span class="text-2xl block mb-1">📭</span>
          <p class="font-normal text-slate-600 dark:text-gray-400">No parked orders in queue.</p>
        </div>

        <div v-else class="space-y-1.5 max-h-80 overflow-y-auto">
          <div 
            v-for="order in heldOrders" 
            :key="order.id"
            class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 p-2.5 flex items-center justify-between"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-normal text-amber-700 dark:text-amber-400">{{ order.id }}</span>
                <span class="text-[11px] text-slate-400">• {{ order.heldAt }}</span>
                <span class="text-[10px] bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 px-1 py-0.2 border border-slate-200 dark:border-gray-700">{{ order.orderType }}</span>
              </div>
              <div class="text-xs text-slate-800 dark:text-gray-200 font-normal mt-0.5">{{ order.customerName || 'Walk-in Customer' }}</div>
              <div class="text-[11px] text-slate-500 dark:text-gray-400">
                {{ order.items.length }} items: {{ order.items.map(i => i.product.name).join(', ') }}
              </div>
            </div>

            <div class="text-right flex flex-col items-end gap-1.5">
              <span class="font-mono font-normal text-slate-900 dark:text-gray-100">{{ settingsStore.currencySymbol }}{{ order.total.toFixed(2) }}</span>
              <button 
                @click="restoreHeldOrder(order.id)"
                class="bg-white hover:bg-emerald-50 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-gray-700 hover:border-emerald-500 text-xs px-2.5 py-1 transition-colors cursor-pointer"
              >
                Resume Order
              </button>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-gray-800">
          <button @click="showHeldOrdersModal = false" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';
import { useSettingsStore } from '~/stores/settings';

const emit = defineEmits(['close']);
const cartStore = useCartStore();
const settingsStore = useSettingsStore();

const { showHeldOrdersModal, heldOrders } = storeToRefs(cartStore);
const { restoreHeldOrder } = cartStore;
</script>
