<template>
  <div>
    <NuxtRouteAnnouncer />
    
    <!-- Show Maintenance Screen if active -->
    <div v-if="settingsStore.systemSettings.maintenanceMode && !isSuperAdmin" class="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Under Maintenance</h1>
      <p class="text-gray-600 dark:text-gray-400 text-lg max-w-md">
        {{ settingsStore.systemSettings.maintenanceMessage }}
      </p>
    </div>
    
    <!-- Otherwise show the app -->
    <NuxtPage v-else />

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
      .hover\:text-\[\#107c41\]:hover, .hover\:text-emerald-600:hover { color: var(--theme-main) !important; filter: brightness(0.85); }
    </component>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useTheme } from '~/composables/useTheme';
import { useSettingsStore } from '~/stores/settings';
import { useAuthStore } from '~/stores/auth'; // Assuming auth store exists, if not we will handle safely

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

onMounted(() => {
  initTheme();
  settingsStore.fetchSystemSettings();
  if (process.client && localStorage.getItem('auth_token')) {
    settingsStore.fetchTenantSettings();
  }
});
</script>

