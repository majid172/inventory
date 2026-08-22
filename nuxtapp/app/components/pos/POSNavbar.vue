<template>
  <header class="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-slate-200 dark:border-gray-800/80 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between text-slate-800 dark:text-gray-100 select-none z-20 gap-y-2 transition-colors duration-200">
    <!-- Left: Pharmacy Logo, Terminal Info & Live Clock -->
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="flex items-center gap-2 font-black text-emerald-600 dark:text-emerald-400 text-lg sm:text-xl tracking-tight font-sans">
        <span class="text-xl sm:text-2xl drop-shadow-md">💊</span> 
        <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent font-black tracking-wider">
          <span class="hidden xs:inline">PHARMA-CARE </span>POS
        </span>
      </div>

      <!-- Terminal Badge -->
      <div class="hidden lg:flex items-center gap-2 text-xs bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-slate-600 dark:text-gray-300 font-semibold shadow-inner">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Pharmacy Main • Terminal #01</span>
      </div>

      <!-- Live Date & Time Display -->
      <div class="hidden xl:flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 px-3.5 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold shadow-inner">
        <span>🕒</span>
        <span>{{ formattedDateTime }}</span>
      </div>
    </div>

    <!-- Center: Responsive Search Input for Brand / Generic / Batch -->
    <div class="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-xs md:max-w-md sm:mx-3">
      <div class="relative w-full">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search medicine, brand, generic chemical, or batch #..."
          class="w-full bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans font-medium"
        />
        <span class="absolute left-3 top-2 sm:top-2.5 text-slate-400 dark:text-gray-400 text-xs sm:text-sm">🔍</span>
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''" 
          class="absolute right-2.5 top-2 sm:top-2.5 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-200 text-[10px] font-bold bg-slate-200 dark:bg-gray-800 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Right: Controls, Theme Switcher & Pharmacist Profile -->
    <div class="order-2 sm:order-3 flex items-center gap-2 sm:gap-3">
      <!-- Mobile/Tablet Short Date-Time Badge -->
      <div class="flex xl:hidden items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 px-2 py-1 rounded-lg">
        <span>🕒</span>
        <span>{{ shortTime }}</span>
      </div>

      <!-- Theme Switcher Toggle -->
      <ThemeToggle />

      <!-- Parked / Held Orders Trigger -->
      <button 
        @click="showHeldOrdersModal = true"
        class="relative flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-200 transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <span>⏸</span>
        <span class="hidden sm:inline">Parked Rx</span>
        <span 
          v-if="heldOrders.length > 0" 
          class="bg-emerald-500 text-gray-950 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-black font-mono"
        >
          {{ heldOrders.length }}
        </span>
      </button>

      <!-- Pharmacist Avatar Badge -->
      <div class="flex items-center gap-2 text-xs font-bold bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-slate-700 dark:text-gray-200 shadow-sm">
        <span class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 text-gray-950 font-black flex items-center justify-center text-[10px] sm:text-xs shadow">
          Rx
        </span>
        <span class="hidden md:inline font-sans">Dr. S. Jenkins (RPh)</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';
import { useCartStore } from '~/stores/cart';
import ThemeToggle from '~/components/ThemeToggle.vue';

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

