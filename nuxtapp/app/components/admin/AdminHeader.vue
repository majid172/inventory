<template>
  <header class="h-16 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800 px-4 sm:px-6 flex items-center justify-between select-none transition-colors duration-200">
    <div class="flex items-center gap-3">
      <!-- Mobile Sidebar Hamburger Toggle Button -->
      <button 
        @click="toggleSidebar"
        class="lg:hidden p-2 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white font-bold text-sm"
        title="Toggle Menu"
      >
        ☰
      </button>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <span class="hidden sm:inline text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Admin /</span>
        <h2 class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-gray-100 uppercase tracking-wider">{{ currentTitle }}</h2>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Live Clock Badge -->
      <div class="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 px-3.5 py-1.5 rounded-xl text-amber-600 dark:text-amber-400 font-bold">
        <span>🕒</span>
        <span>{{ formattedTime }}</span>
      </div>

      <!-- Theme Switcher Toggle -->
      <ThemeToggle />

      <!-- Administrator Profile -->
      <div class="flex items-center gap-2 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-200">
        <span class="w-6 h-6 rounded-lg bg-amber-500 text-gray-950 flex items-center justify-center font-black">
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
import ThemeToggle from '~/components/ThemeToggle.vue';

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
  if (path.includes('/categories')) return 'Categories';
  if (path.includes('/products')) return 'Products Catalog';
  if (path.includes('/ingredients')) return 'Ingredients Stock';
  if (path.includes('/suppliers')) return 'Suppliers Directory';
  if (path.includes('/inventory')) return 'Inventory Balance';
  if (path.includes('/orders')) return 'Sales Orders Log';
  return 'Executive Dashboard';
});
</script>

