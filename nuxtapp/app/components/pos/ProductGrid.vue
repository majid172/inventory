<template>
  <div class="flex-1 overflow-y-auto p-4 select-none">
    <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-gray-500 font-sans text-sm">
      <span class="text-4xl mb-2">🔍</span>
      <p class="font-semibold text-slate-600 dark:text-gray-400">No medicines match your search or filter.</p>
      <p class="text-xs text-slate-400 dark:text-gray-600 mt-1">Try searching by Generic Name, Brand Name, or Batch Number</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        @click="addToCart(product)"
        class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:border-emerald-500/60 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-950/20 group cursor-pointer"
      >
        <!-- Header: Rx Badge & Category/Location -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span 
              :class="[
                'text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-mono border',
                product.rxRequired 
                  ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800'
              ]"
            >
              {{ product.rxRequired ? 'Rx Required' : 'OTC Medicine' }}
            </span>
            
            <span class="text-[10px] text-slate-500 dark:text-gray-400 font-mono bg-slate-100 dark:bg-gray-950 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-800">
              📍 {{ product.rackLocation || 'Rack A-01' }}
            </span>
          </div>

          <!-- Main Title & Generic Compound Name -->
          <div class="flex items-start gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
              <span>{{ product.icon || '💊' }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-sm text-slate-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate" :title="product.name">
                {{ product.name }}
              </h3>
              <p class="text-xs text-emerald-600 dark:text-emerald-400/90 font-medium truncate" :title="product.genericName">
                🧪 {{ product.genericName || product.name }}
              </p>
            </div>
          </div>

          <!-- Dosage Form & Strength Tags -->
          <div class="flex items-center gap-1.5 mt-2.5 flex-wrap text-[11px]">
            <span class="bg-slate-100 dark:bg-gray-950 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-800 px-2 py-0.5 rounded-md font-semibold">
              {{ product.dosageForm || 'Tablet' }}
            </span>
            <span class="bg-slate-100 dark:bg-gray-950 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-gray-800 px-2 py-0.5 rounded-md font-mono font-bold">
              {{ product.strength || 'Standard' }}
            </span>
          </div>

          <!-- Batch # & Expiry Indicator -->
          <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 mt-2 bg-slate-50 dark:bg-gray-950/60 p-1.5 rounded-lg border border-slate-200 dark:border-gray-800/60">
            <span>Lot: {{ product.batchNumber || 'N/A' }}</span>
            <span class="text-amber-600 dark:text-amber-400 font-semibold">Exp: {{ product.expiryDate || 'N/A' }}</span>
          </div>
        </div>

        <!-- Footer: Price & Dispense Button -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-gray-800/80 mt-3">
          <div>
            <span class="text-xs text-slate-400 dark:text-gray-500 font-medium">Price / Pack</span>
            <div class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">${{ product.price.toFixed(2) }}</div>
          </div>

          <button 
            class="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            title="Add to Dispense Cart"
          >
            <span>+ Dispense</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';
import { useCartStore } from '~/stores/cart';

const productStore = useProductStore();
const cartStore = useCartStore();

const { filteredProducts } = storeToRefs(productStore);
const { addToCart } = cartStore;
</script>
