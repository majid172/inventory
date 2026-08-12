<template>
  <div class="flex h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
    <!-- Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Admin Header -->
      <AdminHeader />

      <!-- Page Content Viewport -->
      <main class="flex-1 overflow-y-auto p-6 bg-gray-900/60">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
</script>
