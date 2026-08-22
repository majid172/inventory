<template>
  <div class="flex flex-col h-screen w-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-100 overflow-hidden font-sans select-none transition-colors duration-200">
    <!-- Top Desktop Application Titlebar & Window Rail -->
    <DesktopAppHeader />

    <!-- POS Top Toolbar & Quick Search Bar -->
    <POSNavbar />

    <!-- Main POS Workspace Body -->
    <div class="flex-1 flex overflow-hidden">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import DesktopAppHeader from '~/components/DesktopAppHeader.vue';
import POSNavbar from '~/components/pos/POSNavbar.vue';
import { useCartStore } from '~/stores/cart';
import { useProductStore } from '~/stores/products';

const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'F10') {
    e.preventDefault();
    router.push('/');
  } else if (e.key === 'F11') {
    e.preventDefault();
    router.push('/admin');
  } else if (e.key === 'F4') {
    e.preventDefault();
    if (cartStore.cartItems.length > 0) {
      cartStore.showPaymentModal = true;
    }
  } else if (e.key === 'F8') {
    e.preventDefault();
    if (cartStore.cartItems.length > 0) {
      cartStore.holdOrder();
    } else {
      cartStore.showHeldOrdersModal = true;
    }
  } else if (e.key === 'Escape') {
    productStore.searchQuery = '';
    cartStore.showPaymentModal = false;
    cartStore.showDiscountModal = false;
    cartStore.showHeldOrdersModal = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
