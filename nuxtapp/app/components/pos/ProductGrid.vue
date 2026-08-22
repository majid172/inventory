<template>
  <div class="flex-1 overflow-y-auto p-3 select-none bg-slate-50/80 dark:bg-gray-900/60">
    <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-gray-500 font-sans text-xs">
      <span class="text-3xl mb-2">🔍</span>
      <p class="font-bold text-slate-700 dark:text-gray-300">No medicines match your search or category filter.</p>
      <p class="text-[11px] text-slate-400 dark:text-gray-500 mt-1 font-mono">Try searching by Generic Name, Brand Name, or Batch Number</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        @click="addToCart(product)"
        class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 hover:border-blue-500 rounded-lg p-3 flex flex-col justify-between transition-all duration-150 hover:shadow-md group cursor-pointer"
      >
        <!-- Header: Rx Badge & Rack Location -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200 dark:border-gray-800">
            <span 
              :class="[
                'text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono border',
                product.rxRequired 
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
              ]"
            >
              {{ product.rxRequired ? 'Rx Required' : 'OTC Medicine' }}
            </span>
            
            <span class="text-[10px] text-slate-600 dark:text-gray-400 font-mono font-bold bg-slate-100 dark:bg-gray-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-gray-800">
              📍 {{ product.rackLocation || 'Shelf A-01' }}
            </span>
          </div>

          <!-- Title & Generic Chemical Compound Name -->
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 rounded bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <span>{{ product.icon || '💊' }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="font-extrabold text-xs text-slate-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-sky-400 transition-colors truncate" :title="product.name">
                {{ product.name }}
              </h3>
              <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate" :title="product.genericName">
                🧪 {{ product.genericName || product.name }}
              </p>
            </div>
          </div>

          <!-- Dosage Form & Strength Tags -->
          <div class="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
            <span class="bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-800 px-1.5 py-0.5 rounded font-bold">
              {{ product.dosageForm || 'Tablet' }}
            </span>
            <span class="bg-slate-100 dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-gray-800 px-1.5 py-0.5 rounded font-mono font-bold">
              {{ product.strength || 'Standard' }}
            </span>
          </div>

          <!-- Batch # & Expiry Indicator -->
          <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 mt-2 bg-slate-100/80 dark:bg-gray-900/80 px-2 py-1 rounded border border-slate-200 dark:border-gray-800">
            <span>Lot: {{ product.batchNumber || 'N/A' }}</span>
            <span class="text-amber-600 dark:text-amber-400 font-bold">Exp: {{ product.expiryDate || 'N/A' }}</span>
          </div>
        </div>

        <!-- Footer: Price & Dispense Button -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800 mt-2.5">
          <div>
            <span class="text-[10px] text-slate-500 dark:text-gray-500 font-semibold">Unit Price</span>
            <div class="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">${{ product.price.toFixed(2) }}</div>
          </div>

          <button 
            class="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white dark:text-gray-950 font-bold px-3 py-1 rounded text-xs border border-emerald-600 flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
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
