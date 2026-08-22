<template>
  <header
    class="h-11 bg-slate-100 dark:bg-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 sm:px-4 flex items-center justify-between select-none transition-colors duration-200 shadow-sm">
    <div class="flex items-center gap-2 flex-1 max-w-xl">
      <!-- Mobile Sidebar Toggle -->
      <button @click="toggleSidebar"
        class="lg:hidden p-1.5 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded text-slate-700 dark:text-gray-300 font-bold text-xs"
        title="Toggle Navigation Tree">
        ☰
      </button>

      <!-- Windows 7 Explorer Address Bar -->
      <div
        class="flex items-center gap-1 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded px-2 py-1 text-xs w-full text-slate-700 dark:text-gray-200 font-sans shadow-inner">
        <span class="text-blue-600 dark:text-blue-400 font-bold text-sm">📁</span>
        <span class="text-slate-400 dark:text-gray-500 font-bold">Computer</span>
        <span class="text-slate-400 dark:text-gray-500">▶</span>
        <span class="text-slate-400 dark:text-gray-500 font-bold">PharmaCare ERP</span>
        <span class="text-slate-400 dark:text-gray-500">▶</span>
        <h2 class="font-extrabold text-blue-700 dark:text-sky-400 truncate">{{ currentTitle }}</h2>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Live Clock Badge -->
      <div
        class="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 px-3 py-1 rounded text-blue-700 dark:text-sky-400 font-bold shadow-sm">
        <span>🕒</span>
        <span>{{ formattedTime }}</span>
      </div>

      <!-- Administrator Badge -->
      <div
        class="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 px-2.5 py-1 rounded text-xs font-bold text-slate-700 dark:text-gray-200 shadow-sm">
        <span class="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
          AD
        </span>
        <span class="hidden md:inline">Administrator</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminNav } from '~/composables/useAdminNav';

const route = useRoute();
const { toggleSidebar } = useAdminNav();

const formattedTime = ref('');
let timer: any = null;

const updateClock = () => {
  formattedTime.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const currentTitle = computed(() => {
  const path = route.path;
  if (path.includes('/categories')) return 'Medicine Categories';
  if (path.includes('/products')) return 'Products Catalog';
  if (path.includes('/ingredients')) return 'Ingredients Stock';
  if (path.includes('/suppliers')) return 'Suppliers Directory';
  if (path.includes('/inventory')) return 'Inventory Balance';
  if (path.includes('/orders')) return 'Dispensed Rx Sales';
  return 'Executive Dashboard';
});
</script>
