<template>
  <div>
    <!-- Mobile Backdrop overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-slate-900/60 dark:bg-gray-950/80 backdrop-blur-xs z-40 transition-opacity"
    ></div>

    <!-- 100% Authentic Desktop Application Tree Sidebar (Sharp rectangular, Solid Green selected, No gradients) -->
    <aside 
      :class="[
        'w-56 bg-[#f4f6f8] dark:bg-gray-950 border-r border-slate-300 dark:border-gray-800 flex flex-col justify-between select-none h-full z-50 transition-all duration-200 shadow-xs',
        'fixed lg:static top-0 left-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Sidebar Tree Header -->
        <div class="px-2.5 py-1.5 bg-[#e9eef2] dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 text-[11px] font-normal text-slate-700 dark:text-gray-300 flex items-center justify-between">
          <span class="flex items-center gap-1">
            <span class="text-xs">📂</span> Explorer Navigation
          </span>
          <span class="font-mono text-[9px] bg-slate-300 dark:bg-gray-800 px-1 py-0.2 text-slate-700 dark:text-gray-300 font-normal">TREE</span>
        </div>

        <!-- Desktop Navigation Items (Boxed Card Layout in Light & Dark mode) -->
        <nav class="p-2 space-y-1.5 overflow-y-auto flex-1 font-sans text-xs">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path"
            @click="closeSidebar"
            class="flex items-center gap-2 px-2.5 py-1.5 text-xs font-normal transition-colors border cursor-pointer select-none rounded-xs shadow-2xs"
            :class="[
              route.path === link.path 
                ? 'bg-[#107c41] text-white border-[#0e6b37] shadow-xs font-medium' 
                : 'bg-white dark:bg-gray-900 border-slate-200/90 dark:border-gray-800 text-slate-800 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800/80 hover:border-slate-300 dark:hover:border-gray-700'
            ]"
          >
            <span :class="route.path === link.path ? 'text-white' : 'text-slate-500 dark:text-gray-400'" v-html="link.icon"></span>
            <span class="truncate">{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Desktop Sidebar Bottom Quick Actions -->
      <div class="p-2 border-t border-slate-300 dark:border-gray-800 bg-[#eef2f5] dark:bg-gray-900 text-xs font-sans">
        <NuxtLink 
          to="/pos" 
          @click="closeSidebar"
          class="w-full flex items-center justify-center gap-1.5 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 hover:border-[#107c41] hover:bg-[#107c41]/10 text-[#107c41] dark:text-emerald-400 font-normal py-1 px-2 text-xs shadow-xs transition-all cursor-pointer"
        >
          <span>💻</span> Open Cashier [F10]
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
  { label: 'Dashboard', path: '/admin', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' },
  { label: 'Categories', path: '/admin/categories', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>' },
  { label: 'Products', path: '/admin/products', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },

  { label: 'Suppliers', path: '/admin/suppliers', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>' },
  { label: 'Inventory & Batches', path: '/admin/inventory', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>' },
  { label: 'Purchase Orders', path: '/admin/purchase-orders', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
  { label: 'Sales & Invoices', path: '/admin/orders', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>' },
  { label: 'Reports & Analytics', path: '/admin/reports', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>' },
  { label: 'Staff Management', path: '/admin/users', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>' },
  { label: 'Billing & Plan', path: '/admin/billing', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>' },
  { label: 'Store Settings', path: '/admin/settings', icon: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' }
];
</script>

