<template>
  <div class="pos-layout">
    <!-- Navbar Top Bar -->
    <POSNavbar />

    <!-- Main Workspace Body -->
    <div class="pos-main-container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import POSNavbar from '~/components/pos/POSNavbar.vue';
</script>
