<template>
  <div>
    <!-- Mobile Backdrop overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-slate-900/60 dark:bg-gray-950/80 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- Windows 7 File Explorer Style Sidebar Container -->
    <aside 
      :class="[
        'w-64 bg-slate-100 dark:bg-gray-950 border-r border-slate-300 dark:border-gray-800 flex flex-col justify-between select-none h-full z-50 transition-all duration-300 ease-in-out shadow-sm',
        'fixed lg:static top-0 left-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div>
        <!-- Navigation Tree Header -->
        <div class="px-3 py-2 bg-slate-200/80 dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span>Favorites & Navigation</span>
          <span class="font-mono text-[9px] bg-slate-300 dark:bg-gray-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-gray-300 font-bold">Tree</span>
        </div>

        <!-- Navigation Links (Explorer Tree View Items) -->
        <nav class="p-2 space-y-1">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path"
            @click="closeSidebar"
            class="flex items-center gap-2.5 px-3 py-2 rounded-md font-bold text-xs transition-all border"
            :class="[
              route.path === link.path 
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow font-black' 
                : 'bg-white/60 dark:bg-gray-900/60 border-slate-200/80 dark:border-gray-800/80 text-slate-700 hover:bg-white dark:hover:bg-gray-800 dark:text-gray-300 hover:border-slate-300'
            ]"
          >
            <span class="text-slate-500 group-hover:text-sky-500 transition-colors" v-html="link.icon"></span>
            <span class="truncate">{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Quick Back to POS Button -->
      <div class="p-3 border-t border-slate-300 dark:border-gray-800 bg-slate-200/50 dark:bg-gray-900">
        <NuxtLink 
          to="/" 
          @click="closeSidebar"
          class="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 border border-slate-300 dark:border-gray-700 text-blue-700 dark:text-sky-400 font-black py-2 px-3 rounded-lg text-xs hover:border-blue-500 shadow-sm transition-all"
        >
          <span>💻 Open POS Cash Register (F10)</span>
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
  { label: 'Dashboard', path: '/admin', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' },
  { label: 'Categories', path: '/admin/categories', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>' },
  { label: 'Products', path: '/admin/products', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
  { label: 'Active Compounds / API', path: '/admin/ingredients', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>' },
  { label: 'Suppliers', path: '/admin/suppliers', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>' },
  { label: 'Inventory', path: '/admin/inventory', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>' },
  { label: 'Sales', path: '/admin/orders', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>' }
];
</script>
