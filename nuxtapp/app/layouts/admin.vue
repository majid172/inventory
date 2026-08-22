<template>
  <div class="flex h-screen w-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-200">
    <!-- Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Admin Header -->
      <AdminHeader />

      <!-- Page Content Viewport -->
      <main class="flex-1 overflow-y-auto p-6 bg-slate-50/80 dark:bg-gray-900/60 transition-colors duration-200">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
</script>

