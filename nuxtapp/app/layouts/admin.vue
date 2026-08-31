<template>
  <div class="flex flex-col h-screen w-screen bg-[#e8ecf0] dark:bg-gray-950 text-slate-800 dark:text-gray-100 overflow-hidden font-sans select-none">
    <!-- 1. Top Desktop Application Window Titlebar, Menu Ribbon & Action Bar -->
    <DesktopAppHeader />

    <!-- 2. Subscription Status Warning Banner -->
    <SubscriptionBanner />

    <!-- 3. Main Workspace Viewport (Sidebar + Active Document View) -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Desktop Explorer Tree Sidebar -->
      <AdminSidebar />

      <!-- Main Desktop Content Viewport -->
      <main class="flex-1 overflow-y-auto p-2 sm:p-3 bg-[#f2f5f8] dark:bg-gray-900/90">
        <slot />
      </main>
    </div>

    <!-- 3. Desktop Application Status Bar Footer (22px height) -->
    <footer class="h-5 bg-[#dbe1e8] dark:bg-gray-950 border-t border-slate-300 dark:border-gray-800 px-3 flex items-center justify-between text-[10px] font-sans text-slate-600 dark:text-gray-400 shrink-0">
      <!-- Left: Status indicator -->
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
          <span>Ready</span>
        </span>
        <span class="text-slate-400">|</span>
        <span>MySQL 8.4: <strong class="text-emerald-700 dark:text-emerald-400 font-normal">pharmacy (Connected)</strong></span>
        <span class="text-slate-400 hidden md:inline">|</span>
        <span class="hidden md:inline">Shortcuts: [F10] POS Cashier, [F11] Admin Home</span>
      </div>

      <!-- Right: Virtual Keyboard Indicators -->
      <div class="flex items-center gap-2 font-mono text-[9px]">
        <span class="px-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300">NUM</span>
        <span class="px-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300">CAPS</span>
        <span class="px-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300">INS</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import DesktopAppHeader from '~/components/DesktopAppHeader.vue';
import AdminSidebar from '~/components/admin/AdminSidebar.vue';

const router = useRouter();

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'F10') {
    e.preventDefault();
    router.push('/pos');
  } else if (e.key === 'F11') {
    e.preventDefault();
    router.push('/admin');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
