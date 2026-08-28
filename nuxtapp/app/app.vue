<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- Show Maintenance Screen if active -->
    <div v-if="settingsStore.systemSettings.maintenanceMode && !isSuperAdmin"
      class="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Under Maintenance</h1>
      <p class="text-gray-600 dark:text-gray-400 text-lg max-w-md">
        {{ settingsStore.systemSettings.maintenanceMessage }}
      </p>
    </div>

    <!-- Global Loader Overlay (Solid background to hide initial flash) -->
    <div v-if="isGlobalLoading" class="fixed inset-0 z-[99999] bg-[#f2f5f8] dark:bg-gray-950 flex flex-col items-center justify-center">
      <PharmacyLoader text="Loading System Data..." />
    </div>

    <!-- Otherwise show the app -->
    <div v-show="!isGlobalLoading">
      <NuxtPage v-if="!(settingsStore.systemSettings.maintenanceMode && !isSuperAdmin)" />
    </div>

    <!-- Dynamic Theme Overrides -->
    <component :is="'style'">
      :root {
      --theme-main: {{ settingsStore.tenantSettings?.themeColor || '#107c41' }};
      }

      .bg-\[\#107c41\], .bg-emerald-600, .bg-\[\#0e6b37\] { background-color: var(--theme-main) !important; }
      .text-\[\#107c41\], .text-emerald-600, .text-emerald-700 { color: var(--theme-main) !important; }
      .border-\[\#107c41\], .border-emerald-600, .border-\[\#0e6b37\] { border-color: var(--theme-main) !important; }

      .hover\:bg-\[\#107c41\]:hover, .hover\:bg-emerald-700:hover, .bg-emerald-700 {
      background-color: var(--theme-main) !important;
      filter: brightness(0.85);
      }
      .hover\:text-\[\#107c41\]:hover, .hover\:text-emerald-600:hover { color: var(--theme-main) !important; filter:
      brightness(0.85); }
    </component>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useTheme } from '~/composables/useTheme';
import { useSettingsStore } from '~/stores/settings';
import { useGlobalLoader } from '~/composables/useGlobalLoader';

const { isGlobalLoading } = useGlobalLoader();

const { initTheme } = useTheme();
const settingsStore = useSettingsStore();

// Basic check if user is super admin so they aren't locked out
const isSuperAdmin = computed(() => {
  if (process.client) {
    const role = localStorage.getItem('user_role');
    return role === 'SUPER_ADMIN' || role === 'SUPERADMIN';
  }
  return false;
});

onMounted(async () => {
  initTheme();
  await settingsStore.fetchSystemSettings();
  if (process.client && localStorage.getItem('auth_token')) {
    await settingsStore.fetchTenantSettings();
  }
  
  // Now that settings are fetched, the dynamic colors will be applied
  const { finishInitialLoad } = useGlobalLoader();
  finishInitialLoad();
});
</script>
