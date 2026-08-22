<template>
  <header class="select-none flex flex-col shrink-0 transition-colors duration-200 z-30 shadow-md">
    <!-- Desktop Application Ribbon & Action Header Bar -->
    <div class="min-h-12 bg-slate-100 dark:bg-gray-950 border-b border-slate-300 dark:border-gray-800 px-2 sm:px-4 py-1.5 sm:py-0 flex flex-wrap items-center justify-between gap-y-2 text-slate-800 dark:text-gray-100 transition-colors duration-200 shadow-inner">
      <!-- Left: Logo Branding & Ribbon Navigation Tabs -->
      <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <NuxtLink to="/" class="flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-base mr-0.5 sm:mr-1 shrink-0 hover:opacity-90 transition-opacity">
          <span class="text-sm sm:text-lg">💊</span>
          <span class="text-emerald-600 dark:text-emerald-400 tracking-wider font-extrabold text-base">
            PHARMACARE
          </span>
        </NuxtLink>

        <!-- Windows Start Ribbon Dropdown & Navigation Tabs (Only Visible When Logged In) -->
        <template v-if="isLoggedIn">
          <!-- File Menu Dropdown -->
          <div class="relative group">
            <button class="px-2 sm:px-2.5 py-1 rounded border border-slate-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-gray-200 transition-all flex items-center gap-1 shadow-sm">
              <span class="text-emerald-600 dark:text-emerald-400">File</span>
              <span class="text-[9px] text-slate-400">▼</span>
            </button>
            <div class="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-lg shadow-2xl py-1 text-xs hidden group-hover:block z-50">
              <NuxtLink to="/pos" class="block px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold border-l-2 border-transparent hover:border-emerald-500">💻 POS Cash Register (F10)</NuxtLink>
              <NuxtLink to="/admin" class="block px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold border-l-2 border-transparent hover:border-emerald-500">📊 Admin ERP Management (F11)</NuxtLink>
              <NuxtLink to="/" class="block px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold border-l-2 border-transparent hover:border-emerald-500">🚀 Subscribe & Onboard Store</NuxtLink>
              <!-- Super Admin Link (Only Visible for True Platform Super Admin) -->
              <NuxtLink v-if="isSuperAdmin" to="/super-admin" class="block px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-emerald-700 dark:text-emerald-300 font-black border-l-2 border-transparent hover:border-emerald-500">👑 SaaS Super Admin (F12)</NuxtLink>
              <div class="my-1 border-t border-slate-200 dark:border-gray-800"></div>
              <button @click="reloadApp" class="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">🔄 Sync Database & Refresh</button>
            </div>
          </div>

          <!-- View Menu Dropdown -->
          <div class="relative group">
            <button class="px-2 sm:px-2.5 py-1 rounded border border-slate-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-gray-200 transition-all flex items-center gap-1 shadow-sm">
              <span>View</span>
              <span class="text-[9px] text-slate-400">▼</span>
            </button>
            <div class="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-lg shadow-2xl py-1 text-xs hidden group-hover:block z-50">
              <NuxtLink to="/admin/products" class="block px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">💊 Medicine Catalog</NuxtLink>
              <NuxtLink to="/admin/inventory" class="block px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">📦 Batch & Expiry Stock</NuxtLink>
              <NuxtLink to="/admin/orders" class="block px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium">🛍️ Dispense Logs</NuxtLink>
            </div>
          </div>

          <div class="h-4 w-[1px] bg-slate-300 dark:bg-gray-800 mx-0.5 hidden sm:block"></div>

          <!-- Mode Switcher Tabs (POS F10 / Admin F11) -->
          <div class="flex items-center gap-1 bg-slate-200/80 dark:bg-gray-950 p-0.5 rounded-lg border border-slate-300 dark:border-gray-800 text-[11px] sm:text-xs font-bold shadow-inner">
            <NuxtLink 
              to="/pos" 
              :class="[
                'px-2 sm:px-2.5 py-1 rounded transition-all flex items-center gap-1 shadow-sm',
                route.path.startsWith('/pos') 
                  ? 'bg-emerald-600 text-white font-black shadow border border-emerald-500' 
                  : 'text-slate-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-900'
              ]"
            >
              <span>💻 POS</span>
              <span class="text-[9px] font-mono opacity-90 bg-black/20 px-1 rounded hidden md:inline">F10</span>
            </NuxtLink>

            <NuxtLink 
              to="/admin" 
              :class="[
                'px-2 sm:px-2.5 py-1 rounded transition-all flex items-center gap-1 shadow-sm',
                route.path.startsWith('/admin') && !route.path.startsWith('/super-admin')
                  ? 'bg-emerald-600 text-white font-black shadow border border-emerald-500' 
                  : 'text-slate-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-900'
              ]"
            >
              <span>📊 Admin</span>
              <span class="text-[9px] font-mono opacity-90 bg-black/20 px-1 rounded hidden md:inline">F11</span>
            </NuxtLink>

            <!-- Super Admin Tab (ONLY Visible for Platform Super Admins) -->
            <NuxtLink 
              v-if="isSuperAdmin"
              to="/super-admin" 
              :class="[
                'px-2 sm:px-2.5 py-1 rounded transition-all flex items-center gap-1 shadow-sm',
                route.path.startsWith('/super-admin') 
                  ? 'bg-emerald-600 text-white font-black shadow border border-emerald-500' 
                  : 'text-slate-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-900'
              ]"
            >
              <span>👑 Super Admin</span>
              <span class="text-[9px] font-mono opacity-90 bg-black/20 px-1 rounded hidden md:inline">F12</span>
            </NuxtLink>
          </div>
        </template>
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

        <!-- Active Tenant Free Trial Badge -->
        <div v-if="isLoggedIn && !isSuperAdmin && activeTenantStatus === 'trial'" class="hidden sm:flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span>🎁</span>
          <span>14-Day Free Trial</span>
        </div>

        <!-- Store Plan Tier Badge (For Regular Pharmacy Subscribers) -->
        <div v-if="isLoggedIn && !isSuperAdmin && activeTenantPlan" class="hidden md:flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
          <span>🏷️</span>
          <span>{{ activeTenantPlan }} PLAN</span>
        </div>

        <!-- User / Store Profile Badge -->
        <div v-if="isLoggedIn" class="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 px-2 py-1 rounded-lg text-slate-700 dark:text-gray-200 shadow-sm">
          <span class="w-5 h-5 rounded bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">
            {{ isSuperAdmin ? '👑' : 'Rx' }}
          </span>
          <span class="hidden xl:inline font-sans">
            {{ isSuperAdmin ? 'Platform Super Admin' : (activeTenantStoreName || 'Dr. S. Jenkins') }}
          </span>
        </div>

        <!-- Public / Guest Sign In Action Button (Shown When Not Logged In) -->
        <NuxtLink v-else to="/login" class="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition-all shadow-sm flex items-center gap-1">
          <span>🔐</span> Sign In
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ThemeToggle from '~/components/ThemeToggle.vue';

const route = useRoute();
const formattedTime = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

const isLoggedIn = computed(() => {
  if (route.path.startsWith('/pos') || route.path.startsWith('/admin') || route.path.startsWith('/super-admin')) {
    return true;
  }
  if (process.client) {
    const activeTenant = localStorage.getItem('active_tenant_store');
    const authState = localStorage.getItem('auth_token') || localStorage.getItem('is_logged_in');
    return !!(activeTenant || authState);
  }
  return false;
});

// Strict Super Admin Check: True ONLY if authenticated as platform owner
const isSuperAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem('is_super_admin') === 'true';
  }
  return false;
});

const activeTenantStatus = computed(() => {
  if (process.client) {
    const saved = localStorage.getItem('active_tenant_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.status || 'trial';
      } catch (e) {}
    }
  }
  return 'trial';
});

const activeTenantPlan = computed(() => {
  if (process.client) {
    const saved = localStorage.getItem('active_tenant_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.planTier || 'pro';
      } catch (e) {}
    }
  }
  return '';
});

const activeTenantStoreName = computed(() => {
  if (process.client) {
    const saved = localStorage.getItem('active_tenant_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.storeName || parsed.ownerName;
      } catch (e) {}
    }
  }
  return '';
});

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
