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
              <span class="text-sm shrink-0">{{ link.icon }}</span>
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
  { label: 'Executive Dashboard', path: '/super-admin', icon: '📊' },
  { label: 'Public Subscribe Portal', path: '/subscribe', icon: '🚀', badge: 'Onboarding' },
  { label: 'Subscriber Directory', path: '/super-admin/tenants', icon: '🏥', badge: '38 Stores' },
  { label: 'Subscription Tiers', path: '/super-admin/plans', icon: '💳' },
  { label: 'Plan-Wise Drug Catalog', path: '/super-admin/master-catalog', icon: '💊', badge: '50k+ Tier' },
  { label: 'Security Audit & RLS Logs', path: '/super-admin/logs', icon: '🔒' }
];
</script>
