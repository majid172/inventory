<template>
  <header class="select-none flex flex-col shrink-0 border-b border-slate-300 dark:border-gray-800 bg-[#e4e8ec] dark:bg-gray-950 shadow-xs z-30">
    <!-- 1. Ultra-Authentic Desktop Window Titlebar (28px height) -->
    <div class="h-7 bg-[#2e4358] dark:bg-gray-900 px-2 flex items-center justify-between text-white text-[11px] font-sans">
      <!-- Left: Application Icon & Title -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs">💊</span>
        <span class="font-normal tracking-wide text-slate-100">
          {{ settingsStore.systemSettings.platformName }} ERP — {{ isSuperAdmin ? 'Platform Management Console' : (activeTenantStoreName || 'Pharmacy Management System') }}
        </span>
        <span class="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-1.5 py-0.2">
          v2.6 Enterprise [MySQL 8.4]
        </span>
      </div>

      <!-- Right: User Session & Time (Moved from Toolbar) -->
      <div class="flex items-center gap-1.5">
        <div class="text-[10px] font-mono text-slate-300 bg-transparent px-2 py-0.5 border border-transparent rounded cursor-default flex items-center gap-1">
          <span>🕒</span>
          <span>{{ formattedTime }}</span>
        </div>
        <ThemeToggle />
        <button 
          v-if="isLoggedIn"
          @click="handleLogout"
          class="bg-transparent hover:bg-slate-500/30 text-slate-200 px-2.5 py-0.5 text-[10px] font-normal cursor-pointer rounded transition-colors flex items-center gap-1"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
        <NuxtLink
          v-else
          to="/login"
          class="bg-transparent hover:bg-slate-500/30 text-slate-200 px-2.5 py-0.5 text-[10px] font-normal cursor-pointer rounded transition-colors flex items-center gap-1"
        >
          <span>🔑</span>
          <span>Sign In</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 2. Classic Desktop Menu Bar (File, Edit, View, Operations, Tools, Help) -->
    <div v-if="isLoggedIn" class="h-6 bg-[#f0f3f6] dark:bg-gray-950 border-b border-slate-300 dark:border-gray-800 px-1 flex items-center gap-1 text-[11px] font-sans text-slate-700 dark:text-gray-300">
      <!-- File Menu -->
      <div class="relative group">
        <button class="px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white cursor-pointer font-normal">
          <span class="underline">F</span>ile
        </button>
        <div class="absolute left-0 top-full mt-0 w-52 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 shadow-md py-1 hidden group-hover:block z-50 text-xs">
          <NuxtLink to="/pos" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200">💻 Open POS Cashier (F10)</NuxtLink>
          <NuxtLink to="/admin" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200">📊 Admin ERP Home (F11)</NuxtLink>
          <NuxtLink v-if="isSuperAdmin" to="/super-admin" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-emerald-700 dark:text-emerald-300">👑 Super Admin Console</NuxtLink>
          <div class="my-1 border-t border-slate-200 dark:border-gray-800"></div>
          <button @click="reloadApp" class="w-full text-left px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200 cursor-pointer">🔄 Refresh / Re-sync DB</button>
          <button @click="handleLogout" class="w-full text-left px-3 py-1.5 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 cursor-pointer">🚪 Exit / Log Out</button>
        </div>
      </div>

      <!-- Modules Menu -->
      <div class="relative group">
        <button class="px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white cursor-pointer font-normal">
          <span class="underline">M</span>odules
        </button>
        <div class="absolute left-0 top-full mt-0 w-48 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 shadow-md py-1 hidden group-hover:block z-50 text-xs">
          <NuxtLink to="/admin/categories" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200">📁 Medical Categories</NuxtLink>
          <NuxtLink to="/admin/products" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200">💊 Products Catalog</NuxtLink>
          <NuxtLink to="/admin/inventory" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200">📦 Batches & Stock</NuxtLink>
          <NuxtLink to="/admin/suppliers" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200">🏭 Suppliers / Distributors</NuxtLink>
          <NuxtLink v-if="isSuperAdmin" to="/super-admin/users" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-purple-700 dark:text-purple-400 font-normal">👥 User Management</NuxtLink>
        </div>
      </div>

      <!-- Tools Menu -->
      <div class="relative group">
        <button class="px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white cursor-pointer font-normal">
          <span class="underline">T</span>ools
        </button>
        <div class="absolute left-0 top-full mt-0 w-48 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 shadow-md py-1 hidden group-hover:block z-50 text-xs">
          <button @click="showPinModal = true" class="w-full text-left px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200 cursor-pointer">🔑 Change Access PIN</button>
          <NuxtLink v-if="isSuperAdmin" to="/super-admin/settings" class="block px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200">⚙️ Maintenance & Settings</NuxtLink>
          <button @click="reloadApp" class="w-full text-left px-3 py-1.5 hover:bg-[#107c41] hover:text-white text-slate-800 dark:text-gray-200 cursor-pointer">🔍 System Diagnostic</button>
        </div>
      </div>

      <!-- Help Menu -->
      <button class="px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white cursor-pointer font-normal">
        <span class="underline">H</span>elp
      </button>
    </div>

    <!-- 3. Desktop Application Toolbar Ribbon with Quick Action Buttons -->
    <div class="px-2 py-1 bg-[#f8fafc] dark:bg-gray-900/90 border-b border-slate-300 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
      <!-- Left: Fast Navigation Buttons -->
      <div v-if="isLoggedIn" class="flex items-center gap-1">
        <NuxtLink 
          to="/pos"
          class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 px-2.5 py-1 text-slate-800 dark:text-gray-200 flex items-center gap-1.5 shadow-xs font-normal text-[11px] cursor-pointer"
        >
          <span>💻</span>
          <span>POS Register (F10)</span>
        </NuxtLink>

        <NuxtLink 
          to="/admin"
          class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 px-2.5 py-1 text-slate-800 dark:text-gray-200 flex items-center gap-1.5 shadow-xs font-normal text-[11px] cursor-pointer"
        >
          <span>📊</span>
          <span>Admin Home (F11)</span>
        </NuxtLink>

        <div class="h-4 w-[1px] bg-slate-300 dark:bg-gray-700 mx-1"></div>

        <NuxtLink 
          to="/admin/categories"
          :class="[
            'px-2 py-1 border text-[11px] font-normal cursor-pointer flex items-center gap-1',
            route.path === '/admin/categories'
              ? 'bg-[#107c41] text-white border-[#107c41]'
              : 'bg-white dark:bg-gray-800 hover:bg-slate-100 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300'
          ]"
        >
          <span>📁 Categories</span>
        </NuxtLink>

        <NuxtLink 
          to="/admin/products"
          :class="[
            'px-2 py-1 border text-[11px] font-normal cursor-pointer flex items-center gap-1',
            route.path === '/admin/products'
              ? 'bg-[#107c41] text-white border-[#107c41]'
              : 'bg-white dark:bg-gray-800 hover:bg-slate-100 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300'
          ]"
        >
          <span>💊 Products</span>
        </NuxtLink>
      </div>


    </div>

    <!-- PIN Modal -->
    <div v-if="showPinModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 max-w-sm w-full shadow-lg p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-2">
          <h3 class="font-normal text-xs text-slate-900 dark:text-white">🔑 Change Store Access PIN</h3>
          <button @click="showPinModal = false" class="font-normal text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>
        <form @submit.prevent="handleChangePin" class="space-y-3 text-xs font-sans">
          <div>
            <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">New 4-Digit Staff PIN *</label>
            <input v-model="newPin" type="password" maxLength="4" placeholder="••••" required 
              class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-3 py-1.5 font-mono text-center text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
            <button type="button" @click="showPinModal = false" class="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 font-normal text-xs">Cancel</button>
            <button type="submit" class="px-3 py-1 bg-emerald-600 text-white font-normal text-xs">Update PIN</button>
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
import { useAuth } from '~/composables/useAuth';
import { useSettingsStore } from '~/stores/settings';

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();
const { user, isLoggedIn: authIsLoggedIn, isSuperAdmin: authIsSuperAdmin, changePin, logout, initAuthFromStorage, fetchCurrentUser } = useAuth();

const formattedTime = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

const showPinModal = ref(false);
const newPin = ref('');

const isLoggedIn = computed(() => authIsLoggedIn.value);
const isSuperAdmin = computed(() => authIsSuperAdmin.value);

const activeTenantStoreName = computed(() => {
  if (process.client) {
    const saved = localStorage.getItem('active_tenant_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.storeName || parsed.name;
      } catch (e) {}
    }
  }
  return '';
});

const currentTenantLabel = computed(() => {
  if (process.client) {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.tenantId) return `#${u.tenantId}`;
      } catch (e) {}
    }
  }
  return '#1';
});

const updateClock = () => {
  const now = new Date();
  try {
    formattedTime.value = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: settingsStore.timezone || undefined
    });
  } catch (e) {
    formattedTime.value = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
};

const reloadApp = () => {
  if (process.client) window.location.reload();
};

const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const handleChangePin = async () => {
  if (!newPin.value) return;
  const res = await changePin(newPin.value);
  alert(res.message || 'Store access PIN updated successfully');
  showPinModal.value = false;
  newPin.value = '';
};

onMounted(async () => {
  initAuthFromStorage();
  await fetchCurrentUser();
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
