<template>
  <div>
    <!-- Mobile Backdrop overlay -->
    <div v-if="isSidebarOpen" @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-slate-900/60 dark:bg-gray-950/80 backdrop-blur-xs z-40 transition-opacity">
    </div>

    <!-- Clean Desktop Application Style Sidebar (Solid Green, No Gradients) -->
    <aside :class="[
      'w-60 bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-gray-800 flex flex-col justify-between select-none h-full z-50 transition-all duration-300 ease-in-out shadow-xs',
      'fixed lg:static top-0 left-0',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]">
      <div>
        <!-- Navigation Header -->
        <div
          class="px-3 py-2 bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 text-[11px] font-normal text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span>Super Admin</span>
          <span
            class="font-mono text-[9px] bg-slate-200 dark:bg-gray-800 px-1.5 py-0.5 text-slate-600 dark:text-gray-400 font-normal">SaaS</span>
        </div>

        <!-- Navigation Links (Solid Green Selected, No Gradients) -->
        <nav class="p-2 space-y-1">
          <NuxtLink v-for="link in superAdminNavLinks" :key="link.path" :to="link.path" @click="closeSidebar"
            class="flex items-center justify-between px-3 py-1.5 text-xs font-normal transition-all border group"
            :class="[
              isActive(link.path)
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-gray-900 border-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:border-slate-200 dark:hover:border-gray-700'
            ]">
            <div class="flex items-center gap-2.5 truncate">
              <span :class="isActive(link.path) ? 'text-white' : 'text-slate-400 dark:text-gray-500 group-hover:text-emerald-600'" v-html="link.icon"></span>
              <span class="truncate">{{ link.label }}</span>
            </div>
            <span v-if="link.badge"
              :class="[
                'text-[9px] font-mono px-1.5 py-0.2',
                isActive(link.path) ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
              ]">
              {{ link.badge }}
            </span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Context Navigation Actions (Solid Green, No Gradients) -->
      <div class="p-2.5 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 space-y-2">
        <NuxtLink to="/admin" @click="closeSidebar"
          class="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-gray-300 font-normal py-1.5 px-3 text-xs shadow-xs transition-all cursor-pointer">
          <span>📊 Store ERP Admin (F11)</span>
        </NuxtLink>

        <NuxtLink to="/" @click="closeSidebar"
          class="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-normal py-1.5 px-3 text-xs shadow-xs transition-all cursor-pointer">
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

const isActive = (path: string) => {
  const current = (route.path || '').replace(/\/$/, '');
  const target = (path || '').replace(/\/$/, '');
  if (target === '/super-admin') {
    return current === '/super-admin';
  }
  return current === target || current.startsWith(target + '/');
};

const superAdminNavLinks = [
  { label: 'Dashboard', path: '/super-admin', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' },
  { label: 'User Management', path: '/super-admin/users', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>' },
  { label: 'Public Subscribe Portal', path: '/subscribe', badge: 'Onboarding', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>' },
  { label: 'Subscription Tiers', path: '/super-admin/plans', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>' },
  { label: 'Plan-Wise Drug Catalog', path: '/super-admin/master-catalog', badge: '50k+ Tier', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
  { label: 'Security Audit & RLS Logs', path: '/super-admin/logs', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>' },
  { label: 'Maintenance & Settings', path: '/super-admin/settings', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' }
];
</script>
