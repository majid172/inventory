<template>
  <header class="select-none flex flex-col shrink-0 transition-colors duration-200 z-30 shadow-md">
    <!-- Desktop Application Ribbon & Action Header Bar -->
    <div class="min-h-12 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-2 sm:px-4 py-1.5 sm:py-0 flex flex-wrap items-center justify-between gap-y-2 text-slate-800 dark:text-gray-100 transition-colors duration-200 shadow-inner">
      <!-- Left: Logo Branding & Ribbon Navigation Tabs -->
      <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <div class="flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-base mr-0.5 sm:mr-1 shrink-0">
          <span class="text-sm sm:text-lg">💊</span>
          <span class="bg-gradient-to-r from-blue-700 via-sky-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent tracking-wider font-extrabold">
            PHARMACARE
          </span>
        </div>

        <!-- Windows Start Ribbon Dropdown -->
        <div class="relative group">
          <button class="px-2 sm:px-2.5 py-1 rounded border border-slate-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-gray-200 transition-all flex items-center gap-1 shadow-sm">
            <span class="text-blue-600 dark:text-blue-400">File</span>
            <span class="text-[9px] text-slate-400">▼</span>
          </button>
          <div class="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-lg shadow-2xl py-1 text-xs hidden group-hover:block z-50">
            <NuxtLink to="/" class="block px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold border-l-2 border-transparent hover:border-sky-500">💻 POS Cash Register (F10)</NuxtLink>
            <NuxtLink to="/admin" class="block px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold border-l-2 border-transparent hover:border-sky-500">📊 Admin ERP Management (F11)</NuxtLink>
            <div class="my-1 border-t border-slate-200 dark:border-gray-800"></div>
            <button @click="reloadApp" class="w-full text-left px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">🔄 Sync Database & Refresh</button>
          </div>
        </div>

        <div class="relative group">
          <button class="px-2 sm:px-2.5 py-1 rounded border border-slate-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-gray-200 transition-all flex items-center gap-1 shadow-sm">
            <span>View</span>
            <span class="text-[9px] text-slate-400">▼</span>
          </button>
          <div class="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-lg shadow-2xl py-1 text-xs hidden group-hover:block z-50">
            <NuxtLink to="/admin/products" class="block px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">💊 Medicine Catalog</NuxtLink>
            <NuxtLink to="/admin/inventory" class="block px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">📦 Batch & Expiry Stock</NuxtLink>
            <NuxtLink to="/admin/orders" class="block px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">🛍️ Dispense Logs</NuxtLink>
          </div>
        </div>

        <div class="h-4 w-[1px] bg-slate-300 dark:bg-gray-800 mx-0.5 hidden sm:block"></div>

        <!-- Mode Switcher Tabs (POS F10 / Admin F11) -->
        <div class="flex items-center gap-1 bg-slate-200/80 dark:bg-gray-950 p-0.5 rounded-lg border border-slate-300 dark:border-gray-800 text-[11px] sm:text-xs font-bold shadow-inner">
          <NuxtLink 
            to="/" 
            :class="[
              'px-2 sm:px-3 py-1 rounded transition-all flex items-center gap-1 shadow-sm',
              route.path === '/' 
                ? 'bg-gradient-to-b from-sky-500 to-blue-600 text-white font-black shadow border border-sky-400' 
                : 'text-slate-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-900'
            ]"
          >
            <span>💻 POS</span>
            <span class="text-[9px] font-mono opacity-90 bg-black/20 px-1 rounded hidden md:inline">F10</span>
          </NuxtLink>

          <NuxtLink 
            to="/admin" 
            :class="[
              'px-2 sm:px-3 py-1 rounded transition-all flex items-center gap-1 shadow-sm',
              route.path.startsWith('/admin') 
                ? 'bg-gradient-to-b from-sky-500 to-blue-600 text-white font-black shadow border border-sky-400' 
                : 'text-slate-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-900'
            ]"
          >
            <span>📊 Admin</span>
            <span class="text-[9px] font-mono opacity-90 bg-black/20 px-1 rounded hidden md:inline">F11</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Right Header Actions (Live Time, Theme Switcher & User Profile) -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- Live Clock Display -->
        <div class="hidden lg:flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold shadow-sm">
          <span>🕒</span>
          <span>{{ formattedTime }}</span>
        </div>

        <!-- Theme Toggle Switcher -->
        <ThemeToggle />

        <!-- User Profile Badge -->
        <div class="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 px-2 py-1 rounded-lg text-slate-700 dark:text-gray-200 shadow-sm">
          <span class="w-5 h-5 rounded bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black flex items-center justify-center text-[10px]">
            Rx
          </span>
          <span class="hidden xl:inline font-sans">Dr. S. Jenkins</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ThemeToggle from '~/components/ThemeToggle.vue';

const route = useRoute();
const formattedTime = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

const updateClock = () => {
  const now = new Date();
  formattedTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const reloadApp = () => {
  if (process.client) {
    window.location.reload();
  }
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
