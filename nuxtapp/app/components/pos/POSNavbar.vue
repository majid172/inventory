<template>
  <div
    class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-1.5 flex items-center justify-between gap-3 text-slate-800 dark:text-gray-100 select-none z-20 transition-colors duration-200 shadow-inner">
    <!-- Left: Quick Search Label -->


    <!-- Center: Centered Search Input Bar -->
    <div class="flex-1 max-w-xl mx-auto">
      <div class="relative w-full">
        <input type="text" v-model="searchQuery" placeholder="Scan barcode, brand name, generic chemical, or batch #..."
          class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans font-medium shadow-inner" />
        <span class="absolute left-2.5 top-2 text-slate-400 dark:text-gray-400 text-xs">🔍</span>
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 text-xs font-bold cursor-pointer"
          title="Clear search filter">
          ✕
        </button>
      </div>
    </div>

    <!-- Right: Parked Rx Trigger & Reset Action -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Parked / Held Orders Trigger -->
      <button @click="showHeldOrdersModal = true"
        class="flex items-center gap-1.5 bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 hover:bg-slate-100 border border-slate-300 dark:border-gray-700 px-3 py-1.5 rounded-lg text-xs font-extrabold text-amber-700 dark:text-amber-400 transition-all shadow-sm active:scale-95 cursor-pointer"
        title="View Parked Rx Orders">
        <span>⏸</span>
        <span class="hidden sm:inline">Parked Orders</span>
        <span v-if="heldOrders.length > 0"
          class="bg-emerald-500 text-gray-950 px-1.5 py-0.2 rounded-full text-[10px] font-black font-mono ml-0.5">
          {{ heldOrders.length }}
        </span>
      </button>

      <!-- Clear Search Button -->
      <button v-if="searchQuery" @click="searchQuery = ''"
        class="bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-gray-700 cursor-pointer shadow-sm">
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';
import { useCartStore } from '~/stores/cart';

const productStore = useProductStore();
const cartStore = useCartStore();

const { searchQuery } = storeToRefs(productStore);
const { heldOrders, showHeldOrdersModal } = storeToRefs(cartStore);
</script>
