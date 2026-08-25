<template>
  <div class="flex-1 overflow-y-auto p-2.5 select-none bg-[#f4f7f9] dark:bg-gray-900/70 font-sans">
    <!-- Empty State -->
    <div v-if="displayProducts.length === 0"
      class="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-gray-400 text-xs border border-slate-300 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <span class="text-2xl mb-1">🔍</span>
      <p class="font-normal text-slate-700 dark:text-gray-200">No products match your search or category filter.</p>
      <p class="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">Try searching by brand name, generic name, barcode or batch #.</p>
    </div>

    <!-- Desktop POS Product Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
      <div 
        v-for="product in displayProducts" 
        :key="product.id" 
        @click="handleProductClick(product)" 
        :class="[
          'bg-white dark:bg-gray-950 border p-2 flex flex-col justify-between transition-colors shadow-xs relative text-xs cursor-pointer',
          (product.stockQuantity !== undefined && product.stockQuantity <= 0)
            ? 'border-slate-200 dark:border-gray-800 opacity-60 bg-slate-50 dark:bg-gray-900/40'
            : 'border-slate-300 dark:border-gray-700 hover:border-[#107c41] hover:bg-[#e8f4fd] dark:hover:bg-sky-950/30'
        ]"
      >
        <div>
          <!-- Top Header: Item ID / Barcode & Status -->
          <div class="flex items-center justify-between gap-1 pb-1 border-b border-slate-200 dark:border-gray-800 text-[10px] text-slate-500 dark:text-gray-400 font-normal">
            <span class="font-mono">#{{ product.id }} | {{ product.barcode || `MED-${product.id}` }}</span>
            <div class="flex items-center gap-1">
              <span :class="product.rxRequired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'">
                {{ product.rxRequired ? 'Rx Req' : 'OTC' }}
              </span>
              <span v-if="product.rackLocation" class="text-slate-400">
                • {{ product.rackLocation }}
              </span>
            </div>
          </div>

          <!-- Product Title & Generic Compound Name -->
          <div class="mt-1.5">
            <h3 class="font-normal text-xs text-slate-900 dark:text-gray-100 truncate" :title="product.name">
              {{ product.name }}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-gray-400 truncate mt-0.5" :title="product.genericName">
              {{ product.genericName || product.name }}
            </p>
          </div>

          <!-- Details Row: Form, Strength & Batch -->
          <div class="grid grid-cols-2 gap-1 mt-2 text-[10px] text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-gray-900 px-1.5 py-1 border border-slate-200 dark:border-gray-800">
            <div>
              <span class="text-slate-400">Form:</span> {{ product.dosageForm || 'Tablet' }}
            </div>
            <div class="text-right">
              <span class="text-slate-400">Stock:</span> 
              <strong :class="[
                'font-normal',
                (product.stockQuantity !== undefined && product.stockQuantity <= 0) ? 'text-rose-600 font-normal' : 'text-slate-800 dark:text-gray-200'
              ]">
                {{ product.stockQuantity !== undefined ? product.stockQuantity : 100 }}
              </strong>
            </div>
            <div class="truncate">
              <span class="text-slate-400">Batch:</span> {{ product.batchNumber || '-' }}
            </div>
            <div class="text-right truncate text-slate-500">
              Exp: {{ product.expiryDate || '-' }}
            </div>
          </div>
        </div>

        <!-- Footer: Price & Add Button -->
        <div class="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-gray-800 mt-2">
          <div>
            <span class="text-[10px] text-slate-400 font-normal">Price:</span>
            <span class="text-xs font-normal text-slate-900 dark:text-gray-100 ml-1">
              ${{ Number(product.price || 0).toFixed(2) }}
            </span>
          </div>

          <button 
            v-if="product.stockQuantity === undefined || product.stockQuantity > 0"
            @click.stop="handleProductClick(product)"
            class="bg-white hover:bg-emerald-50 dark:bg-gray-800 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-gray-700 hover:border-emerald-500 px-2 py-0.5 text-[11px] font-normal cursor-pointer shadow-xs transition-colors"
            title="Add to Dispense Cart"
          >
            + Add
          </button>
          <span v-else class="text-[10px] text-rose-600 font-normal">
            Out of Stock
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore, type ProductItem } from '~/stores/products';
import { useCartStore } from '~/stores/cart';

const productStore = useProductStore();
const cartStore = useCartStore();

const { filteredProducts } = storeToRefs(productStore);
const { addToCart } = cartStore;

onMounted(async () => {
  await productStore.fetchProducts();
});

const displayProducts = computed(() => {
  return filteredProducts.value;
});

const handleProductClick = (product: ProductItem) => {
  if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
    alert(`"${product.name}" is currently out of stock.`);
    return;
  }
  addToCart(product);
};
</script>
