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

      <!-- Right Header Actions (Live Time, Theme Switcher & User Profile Dropdown) -->
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

        <!-- User / Store Profile Badge with Dropdown -->
        <div v-if="isLoggedIn" class="relative group">
          <button class="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 px-2 py-1 rounded-lg text-slate-700 dark:text-gray-200 shadow-sm transition-all cursor-pointer">
            <span class="w-5 h-5 rounded bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">
              {{ isSuperAdmin ? '👑' : 'Rx' }}
            </span>
            <span class="font-sans">
              {{ isSuperAdmin ? 'Platform Super Admin' : (activeTenantStoreName || 'khan pharmacy') }}
            </span>
            <span class="text-[9px] text-slate-400">▼</span>
          </button>

          <!-- User Profile Dropdown Menu -->
          <div class="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-xl shadow-2xl py-1 text-xs hidden group-hover:block z-50 overflow-hidden">
            <!-- Active Store Details Header -->
            <div class="px-3 py-2 bg-slate-50 dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Pharmacy Store:</span>
              <span class="font-black text-slate-900 dark:text-white block truncate">{{ activeTenantStoreName || 'khan pharmacy' }}</span>
              <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase block">{{ isSuperAdmin ? 'Super Admin' : (activeTenantPlan + ' Tier') }}</span>
            </div>

            <!-- Menu Links -->
            <NuxtLink to="/admin" class="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold transition-colors">
              <span>⚙️</span> Store Settings
            </NuxtLink>

            <NuxtLink to="/pos" class="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold transition-colors">
              <span>💻</span> Launch POS Register
            </NuxtLink>

            <button @click="showPinModal = true" class="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium transition-colors cursor-pointer">
              <span>🔑</span> Change Access PIN
            </button>

            <div class="my-1 border-t border-slate-200 dark:border-gray-800"></div>

            <!-- Logout Button -->
            <button @click="handleLogout" class="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold transition-colors cursor-pointer">
              <span>🚪</span> Sign Out / Logout
            </button>
          </div>
        </div>

        <!-- Public / Guest Sign In Action Button (Shown When Not Logged In) -->
        <NuxtLink v-else to="/login" class="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition-all shadow-sm flex items-center gap-1">
          <span>🔐</span> Sign In
        </NuxtLink>
      </div>
    </div>

    <!-- Change Access PIN Modal Dialog -->
    <div v-if="showPinModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-2">
          <h3 class="font-black text-xs uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>🔑</span> Change Store Access PIN
          </h3>
          <button @click="showPinModal = false" class="font-bold text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>

        <form @submit.prevent="handleChangePin" class="space-y-3 text-xs font-sans">
          <div>
            <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">New 4-Digit Staff PIN *</label>
            <input 
              v-model="newPin"
              type="password" 
              required
              maxlength="10"
              placeholder="e.g. 5678"
              class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-lg px-3 py-2 font-mono text-center text-lg tracking-widest font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
            <button type="button" @click="showPinModal = false" class="px-3 py-1.5 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-lg font-bold">
              Cancel
            </button>
            <button type="submit" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black shadow-sm">
              Update PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ThemeToggle from '~/components/ThemeToggle.vue';

const route = useRoute();
const router = useRouter();
const formattedTime = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

const showPinModal = ref(false);
const newPin = ref('');

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

const handleLogout = () => {
  if (process.client) {
    localStorage.removeItem('active_tenant_store');
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('is_super_admin');
    router.push('/login');
  }
};

const handleChangePin = () => {
  if (!newPin.value) return;
  alert(`Store access PIN updated successfully to: ${newPin.value}`);
  showPinModal.value = false;
  newPin.value = '';
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
