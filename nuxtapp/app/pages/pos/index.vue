<template>
  <NuxtLayout name="pos">
    <!-- Left Workspace: Category Navigation & Product Grid -->
    <div class="pos-products-panel">
      <!-- Category Filter Pills -->
      <CategoryPills />

      <!-- Interactive Product Grid -->
      <ProductGrid />
    </div>

    <!-- Right Sidebar: Live Cart Register -->
    <CartRegister />

    <!-- Global Interactive Modals -->
    <PaymentModal />
    <ReceiptModal />
    <HeldOrdersModal />
    <ModifierModal />
    <DiscountModal />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import CategoryPills from '~/components/pos/CategoryPills.vue';
import ProductGrid from '~/components/pos/ProductGrid.vue';
import CartRegister from '~/components/pos/CartRegister.vue';
import PaymentModal from '~/components/pos/PaymentModal.vue';
import ReceiptModal from '~/components/pos/ReceiptModal.vue';
import HeldOrdersModal from '~/components/pos/HeldOrdersModal.vue';
import ModifierModal from '~/components/pos/ModifierModal.vue';
import DiscountModal from '~/components/pos/DiscountModal.vue';
import { usePOSProducts } from '~/composables/usePOSProducts';

const { fetchProducts } = usePOSProducts();

onMounted(() => {
  fetchProducts();
});
</script>
