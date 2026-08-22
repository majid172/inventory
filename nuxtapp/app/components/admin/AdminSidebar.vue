<template>
  <div>
    <!-- Mobile Backdrop overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-slate-900/60 dark:bg-gray-950/80 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'w-64 bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-gray-800 flex flex-col justify-between select-none h-screen z-50 transition-all duration-300 ease-in-out',
        'fixed lg:static top-0 left-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div>
        <!-- Brand Logo & Mobile Close Button -->
        <div class="h-16 border-b border-slate-200 dark:border-gray-800 px-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">💊</span>
            <div>
              <h1 class="font-black text-emerald-600 dark:text-emerald-400 text-lg tracking-wider font-sans leading-none">PHARMACY</h1>
              <span class="text-[10px] text-slate-400 dark:text-gray-400 font-bold uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <button @click="closeSidebar" class="lg:hidden text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold text-lg">
            ✕
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="p-3 space-y-1">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path"
            @click="closeSidebar"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all"
            :class="[
              route.path === link.path 
                ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20 font-black' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900'
            ]"
          >
            <span class="text-base">{{ link.icon }}</span>
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Quick Back to POS Button -->
      <div class="p-4 border-t border-slate-200 dark:border-gray-800">
        <NuxtLink 
          to="/" 
          @click="closeSidebar"
          class="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 text-emerald-600 dark:text-emerald-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors"
        >
          <span>💻 Open Pharmacy POS</span>
        </NuxtLink>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAdminNav } from '~/composables/useAdminNav';

const route = useRoute();
const { isSidebarOpen, closeSidebar } = useAdminNav();

const navLinks = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Medicine Categories', path: '/admin/categories', icon: '📁' },
  { label: 'Medicines Catalog', path: '/admin/products', icon: '💊' },
  { label: 'Active Compounds / API', path: '/admin/ingredients', icon: '🧪' },
  { label: 'Pharma Suppliers', path: '/admin/suppliers', icon: '🚚' },
  { label: 'Batch & Expiry Balance', path: '/admin/inventory', icon: '📦' },
  { label: 'Dispensed Rx Sales', path: '/admin/orders', icon: '🛍️' }
];
</script>

