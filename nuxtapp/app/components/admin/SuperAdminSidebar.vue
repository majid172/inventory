<template>
  <div>
    <!-- Mobile Backdrop overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-slate-900/60 dark:bg-gray-950/80 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- Windows 7 File Explorer Style Sidebar Container (Matching Admin Design) -->
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
          <span>Super Admin & Multi-Tenant</span>
          <span class="font-mono text-[9px] bg-slate-300 dark:bg-gray-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-gray-300 font-bold">Tree</span>
        </div>

        <!-- Navigation Links (Explorer Tree View Items) -->
        <nav class="p-2 space-y-1">
          <NuxtLink 
            v-for="link in superAdminNavLinks" 
            :key="link.path"
            :to="link.path"
            @click="closeSidebar"
            class="flex items-center justify-between px-3 py-2 rounded-md font-bold text-xs transition-all border"
            :class="[
              route.path === link.path 
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow font-black' 
                : 'bg-white/60 dark:bg-gray-900/60 border-slate-200/80 dark:border-gray-800/80 text-slate-700 hover:bg-white dark:hover:bg-gray-800 dark:text-gray-300 hover:border-slate-300'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-slate-500 group-hover:text-sky-500 transition-colors" v-html="link.icon"></span>
              <span class="truncate">{{ link.label }}</span>
            </div>
            <span v-if="link.badge" class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold">
              {{ link.badge }}
            </span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Context Navigation Actions -->
      <div class="p-3 border-t border-slate-300 dark:border-gray-800 bg-slate-200/50 dark:bg-gray-900 space-y-2">
        <NuxtLink 
          to="/admin" 
          @click="closeSidebar"
          class="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 border border-slate-300 dark:border-gray-700 text-blue-700 dark:text-sky-400 font-black py-2 px-3 rounded-lg text-xs hover:border-blue-500 shadow-sm transition-all"
        >
          <span>📊 Store ERP Admin (F11)</span>
        </NuxtLink>

        <NuxtLink 
          to="/" 
          @click="closeSidebar"
          class="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 border border-slate-300 dark:border-gray-700 text-emerald-700 dark:text-emerald-400 font-black py-2 px-3 rounded-lg text-xs hover:border-emerald-500 shadow-sm transition-all"
        >
          <span>💻 Open POS Cashier (F10)</span>
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

const superAdminNavLinks = [
  { label: 'Executive Dashboard', path: '/super-admin', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' },
  { label: 'Public Subscribe Portal', path: '/subscribe', badge: 'Onboarding', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>' },
  { label: 'Subscriber Directory', path: '/super-admin/tenants', badge: '38 Stores', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>' },
  { label: 'Subscription Tiers', path: '/super-admin/plans', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>' },
  { label: 'Plan-Wise Drug Catalog', path: '/super-admin/master-catalog', badge: '50k+ Tier', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
  { label: 'Security Audit & RLS Logs', path: '/super-admin/logs', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>' }
];
</script>
