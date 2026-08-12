<template>
  <header class="bg-gray-950/95 backdrop-blur-md border-b border-gray-800/80 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between text-gray-100 select-none z-20 gap-y-2">
    <!-- Left: Store Logo, Terminal Info & Live Clock -->
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="flex items-center gap-2 font-black text-amber-500 text-lg sm:text-xl tracking-tight font-sans">
        <span class="text-xl sm:text-2xl drop-shadow-md">☕</span> 
        <span class="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent font-black tracking-wider">
          <span class="hidden xs:inline">COFFEE </span>POS
        </span>
      </div>

      <!-- Terminal Badge -->
      <div class="hidden lg:flex items-center gap-2 text-xs bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-gray-300 font-semibold shadow-inner">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Main Store • Terminal #01</span>
      </div>

      <!-- Live Date & Time Display -->
      <div class="hidden xl:flex items-center gap-2 text-xs font-mono bg-gray-900 border border-gray-800 px-3.5 py-1.5 rounded-xl text-amber-400 font-bold shadow-inner">
        <span>🕒</span>
        <span>{{ formattedDateTime }}</span>
      </div>
    </div>

    <!-- Center: Responsive Search Input -->
    <div class="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-xs md:max-w-md sm:mx-3">
      <div class="relative w-full">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search product name or SKU..."
          class="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans font-medium"
        />
        <span class="absolute left-3 top-2 sm:top-2.5 text-gray-400 text-xs sm:text-sm">🔍</span>
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''" 
          class="absolute right-2.5 top-2 sm:top-2.5 text-gray-400 hover:text-gray-200 text-[10px] font-bold bg-gray-800 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Right: Controls & Cashier Profile -->
    <div class="order-2 sm:order-3 flex items-center gap-2 sm:gap-3">
      <!-- Mobile/Tablet Short Date-Time Badge -->
      <div class="flex xl:hidden items-center gap-1 text-[11px] font-mono text-amber-400 font-bold bg-gray-900 border border-gray-800 px-2 py-1 rounded-lg">
        <span>🕒</span>
        <span>{{ shortTime }}</span>
      </div>

      <!-- Parked / Held Orders Trigger -->
      <button 
        @click="showHeldOrdersModal = true"
        class="relative flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-200 transition-all shadow-sm active:scale-95"
      >
        <span>⏸</span>
        <span class="hidden sm:inline">Parked</span>
        <span 
          v-if="heldOrders.length > 0" 
          class="bg-amber-500 text-gray-950 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-black font-mono"
        >
          {{ heldOrders.length }}
        </span>
      </button>

      <!-- Cashier Avatar Badge -->
      <div class="flex items-center gap-2 text-xs font-bold bg-gray-900 border border-gray-800 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-gray-200 shadow-sm">
        <span class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-gray-950 font-black flex items-center justify-center text-[10px] sm:text-xs shadow">
          SJ
        </span>
        <span class="hidden md:inline font-sans">Sarah J.</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';
import { useCartStore } from '~/stores/cart';

const productStore = useProductStore();
const cartStore = useCartStore();

const { searchQuery } = storeToRefs(productStore);
const { heldOrders, showHeldOrdersModal } = storeToRefs(cartStore);

const formattedDateTime = ref('');
const shortTime = ref('');

let timer: ReturnType<typeof setInterval> | null = null;

const updateClock = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  formattedDateTime.value = `${dateStr} • ${timeStr}`;
  shortTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
