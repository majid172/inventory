<template>
  <div class="flex flex-col h-screen w-screen bg-[#e8ecf0] dark:bg-gray-950 text-slate-800 dark:text-gray-100 overflow-hidden font-sans select-none">
    <!-- Top Desktop Application Header -->
    <DesktopAppHeader />

    <!-- Main POS Workspace Body -->
    <div class="flex-1 flex overflow-hidden relative">
      <slot />
    </div>

    <!-- POS Desktop Status Bar -->
    <footer class="h-5 bg-[#dbe1e8] dark:bg-gray-950 border-t border-slate-300 dark:border-gray-800 px-3 flex items-center justify-between text-[10px] font-sans text-slate-600 dark:text-gray-400 shrink-0">
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
          <span>POS Terminal Online</span>
        </span>
        <span class="text-slate-400">|</span>
        <span>Keyboard: [F4] Pay, [F8] Hold / Park, [Esc] Clear Search / Close Dialogs</span>
      </div>
      <div class="flex items-center gap-2 font-mono text-[9px]">
        <span class="px-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300">NUM</span>
        <span class="px-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300">CAPS</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import DesktopAppHeader from '~/components/DesktopAppHeader.vue';
import { useCartStore } from '~/stores/cart';
import { useProductStore } from '~/stores/products';

const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();

const handleKeyDown = (e: KeyboardEvent) => {
  let isCashier = false;
  if (process.client) {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const r = (u.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
        isCashier = r === 'CASHIER' || r === 'POSUSER';
      } catch (err) {}
    }
  }

  if (e.key === 'F10') {
    e.preventDefault();
    router.push('/pos');
  } else if (e.key === 'F11') {
    e.preventDefault();
    if (!isCashier) {
      router.push('/admin');
    }
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
