<template>
  <div class="flex flex-col h-screen w-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-200 select-none">
    <!-- Top Desktop Application Titlebar & Window Rail -->
    <DesktopAppHeader />

    <!-- Main Workspace Area (Sidebar + Page Content) -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Super Admin Sidebar -->
      <SuperAdminSidebar />

      <!-- Main Content Area Viewport -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/80 dark:bg-gray-900/60 transition-colors duration-200">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import DesktopAppHeader from '~/components/DesktopAppHeader.vue';
import SuperAdminSidebar from '~/components/admin/SuperAdminSidebar.vue';

const router = useRouter();

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'F10') {
    e.preventDefault();
    router.push('/pos');
  } else if (e.key === 'F11') {
    e.preventDefault();
    router.push('/admin');
  } else if (e.key === 'F12') {
    e.preventDefault();
    if (process.client && localStorage.getItem('is_super_admin') === 'true') {
      router.push('/super-admin');
    } else {
      alert("Access Denied: Super Admin privileges required.");
    }
  }
};

onMounted(() => {
  // Security Guard: Restrict Super Admin layout strictly to authenticated Platform Owners
  if (process.client) {
    const isLoggedIn = !!(localStorage.getItem('auth_token') || localStorage.getItem('is_logged_in'));
    const isSA = localStorage.getItem('is_super_admin') === 'true';
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!isSA) {
      alert("Access Denied: Super Admin privileges required.");
      router.push('/pos');
      return;
    }
  }
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
