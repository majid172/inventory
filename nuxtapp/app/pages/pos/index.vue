<template>
  <NuxtLayout name="pos">
    <div class="flex-1 flex flex-col h-full w-full overflow-hidden relative">
      <!-- Mobile Segmented View Switcher (Only visible on screens < lg) -->
      <div class="lg:hidden bg-[#2e4358] text-white px-2.5 py-1.5 flex items-center justify-between border-b border-slate-700 shrink-0 text-xs shadow-xs">
        <div class="flex items-center gap-1 bg-slate-900/60 p-0.5 border border-slate-700 w-full">
          <button
            @click="activeMobileTab = 'catalog'"
            :class="[
              'flex-1 py-1 px-2 text-center text-xs font-normal transition-colors cursor-pointer flex items-center justify-center gap-1.5',
              activeMobileTab === 'catalog' ? 'bg-[#107c41] text-white shadow-2xs' : 'text-slate-300 hover:bg-slate-800'
            ]"
          >
            <span>💊</span>
            <span>Medicine Catalog</span>
          </button>

          <button
            @click="activeMobileTab = 'cart'"
            :class="[
              'flex-1 py-1 px-2 text-center text-xs font-normal transition-colors cursor-pointer flex items-center justify-center gap-1.5 relative',
              activeMobileTab === 'cart' ? 'bg-[#107c41] text-white shadow-2xs' : 'text-slate-300 hover:bg-slate-800'
            ]"
          >
            <span>🧾</span>
            <span>Cash Register</span>
            <span
              v-if="cartItems.length > 0"
              class="bg-amber-500 text-slate-900 text-[10px] font-mono font-bold px-1.5 rounded-full"
            >
              {{ cartItems.length }}
            </span>
          </button>
        </div>
      </div>

      <!-- Main POS Content Area -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <!-- Left Workspace: Category Navigation & Product Grid -->
        <div
          :class="[
            'pos-products-panel flex-1 flex flex-col h-full overflow-hidden',
            activeMobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
          ]"
        >
          <!-- Category Filter Pills -->
          <CategoryPills />

          <!-- Interactive Product Grid -->
          <ProductGrid />
        </div>

        <!-- Right Sidebar: Live Cart Register -->
        <div
          :class="[
            'w-full lg:w-96 h-full flex flex-col overflow-hidden',
            activeMobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
          ]"
        >
          <CartRegister />
        </div>

        <!-- Floating Quick Cart Bar on Mobile (when browsing 500+ items catalog with cart items) -->
        <div
          v-if="activeMobileTab === 'catalog' && cartItems.length > 0"
          class="lg:hidden absolute bottom-3 left-3 right-3 bg-slate-900 text-white p-2.5 shadow-2xl border border-emerald-500/50 flex items-center justify-between z-40 animate-fadeIn"
        >
          <div class="flex items-center gap-2">
            <span class="bg-[#107c41] text-white w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs">
              {{ cartItems.length }}
            </span>
            <div class="text-xs">
              <div class="text-[10px] text-slate-400 uppercase font-mono">Current Cart Total:</div>
              <div class="font-mono font-bold text-emerald-400 text-sm">
                {{ settingsStore.currencySymbol }}{{ total.toFixed(2) }}
              </div>
            </div>
          </div>

          <button
            @click="activeMobileTab = 'cart'"
            class="bg-[#107c41] hover:bg-[#0e6b37] text-white text-xs font-normal px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View Register & Pay</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Global Interactive Modals -->
    <PaymentModal />
    <ReceiptModal />
    <HeldOrdersModal />
    <ModifierModal />
    <DiscountModal />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import CategoryPills from '~/components/pos/CategoryPills.vue';
import ProductGrid from '~/components/pos/ProductGrid.vue';
import CartRegister from '~/components/pos/CartRegister.vue';
import PaymentModal from '~/components/pos/PaymentModal.vue';
import ReceiptModal from '~/components/pos/ReceiptModal.vue';
import HeldOrdersModal from '~/components/pos/HeldOrdersModal.vue';
import ModifierModal from '~/components/pos/ModifierModal.vue';
import DiscountModal from '~/components/pos/DiscountModal.vue';
import { usePOSProducts } from '~/composables/usePOSProducts';
import { useCartStore } from '~/stores/cart';
import { useSettingsStore } from '~/stores/settings';

const { fetchProducts } = usePOSProducts();
const cartStore = useCartStore();
const settingsStore = useSettingsStore();

const { cartItems, total } = storeToRefs(cartStore);

const activeMobileTab = ref<'catalog' | 'cart'>('catalog');

onMounted(() => {
  fetchProducts();
});
</script>
