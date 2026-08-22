<template>
  <div class="flex-1 overflow-y-auto p-3 select-none bg-slate-50/80 dark:bg-gray-900/60">
    <div v-if="displayProducts.length === 0"
      class="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-gray-500 font-sans text-xs">
      <span class="text-3xl mb-2">🔍</span>
      <p class="font-bold text-slate-700 dark:text-gray-300">No medicines match your search or plan tier filter.</p>
      <p class="text-[11px] text-slate-400 dark:text-gray-500 mt-1 font-mono">Current Store Plan: <b
          class="uppercase text-emerald-600 dark:text-emerald-400">{{ activeTenantPlan }} Tier</b></p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      <div v-for="product in displayProducts" :key="product.id" @click="handleProductClick(product)" :class="[
        'bg-white dark:bg-gray-950 border rounded-lg p-3 flex flex-col justify-between transition-all duration-150 shadow-sm relative overflow-hidden',
        isPlanAllowed(product.planTierAccess)
          ? 'border-slate-300 dark:border-gray-800 hover:border-emerald-500 hover:shadow-md cursor-pointer group'
          : 'border-slate-200 dark:border-gray-900 opacity-60 bg-slate-100/50 dark:bg-gray-900/40 cursor-not-allowed'
      ]">
        <!-- Top Banner Header: Plan Tier Badge & Rx/OTC Status -->
        <div>
          <div
            class="flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-slate-200 dark:border-gray-800">
            <!-- Plan Tier Badge -->
            <span :class="[
              'text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono border flex items-center gap-1',
              product.planTierAccess === 'enterprise'
                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                : product.planTierAccess === 'pro'
                  ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            ]">
              <span>{{ product.planTierAccess === 'enterprise' ? '🟧' : product.planTierAccess === 'pro' ? '🟦' : '🟢'
              }}</span>
              <span>{{ (product.planTierAccess || 'starter').toUpperCase() }} TIER</span>
            </span>

            <div class="flex items-center gap-1">
              <span :class="[
                'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono border',
                product.rxRequired
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                  : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800'
              ]">
                {{ product.rxRequired ? 'Rx Required' : 'OTC' }}
              </span>

              <span
                class="text-[9px] text-slate-500 dark:text-gray-400 font-mono font-bold bg-slate-100 dark:bg-gray-900 px-1 py-0.5 rounded border border-slate-200 dark:border-gray-800">
                📍 {{ product.rackLocation || 'Rack A' }}
              </span>
            </div>
          </div>

          <!-- Title & Generic Chemical Compound Name -->
          <div class="flex items-start gap-2">
            <div
              class="w-9 h-9 rounded bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <span>{{ product.icon || '💊' }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <h3
                class="font-extrabold text-xs text-slate-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate"
                :title="product.name">
                {{ product.name }}
              </h3>
              <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate"
                :title="product.genericName">
                🧪 {{ product.genericName || product.name }}
              </p>
            </div>
          </div>

          <!-- Dosage Form, Strength & Stock Quantity Tags -->
          <div class="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
            <span
              class="bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-800 px-1.5 py-0.5 rounded font-bold">
              {{ product.dosageForm || '-' }}
            </span>
            <span
              class="bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-800 px-1.5 py-0.5 rounded font-mono font-bold">
              {{ product.strength || 'Standard' }}
            </span>
            <span
              :class="[
                'px-1.5 py-0.5 rounded font-mono font-bold border',
                (product.stockQuantity !== undefined && product.stockQuantity <= 0)
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              ]">
              📦 Stock: {{ product.stockQuantity !== undefined ? product.stockQuantity : 100 }}
            </span>
          </div>

          <!-- Batch # & Expiry Indicator -->
          <div
            class="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 mt-2 bg-slate-100/80 dark:bg-gray-900/80 px-2 py-1 rounded border border-slate-200 dark:border-gray-800">
            <span>Lot: {{ product.batchNumber || 'N/A' }}</span>
            <span class="text-amber-600 dark:text-amber-400 font-bold">Exp: {{ product.expiryDate || 'N/A' }}</span>
          </div>
        </div>

        <!-- Footer: Price & Dispense Button -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800 mt-2.5">
          <div>
            <span class="text-[10px] text-slate-500 dark:text-gray-500 font-semibold">Retail Price</span>
            <div class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ${{ (product.price || 0).toFixed(2) }}
            </div>
          </div>

          <button v-if="isPlanAllowed(product.planTierAccess) && (product.stockQuantity === undefined || product.stockQuantity > 0)"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs border border-emerald-500 flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Add to Dispense Cart">
            <span>+ Dispense</span>
          </button>
          <span v-else-if="product.stockQuantity !== undefined && product.stockQuantity <= 0"
            class="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded">
            Out of Stock
          </span>
          <span v-else
            class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
            🔒 Upgrade Required
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore, type ProductItem } from '~/stores/products';
import { useCartStore } from '~/stores/cart';

const productStore = useProductStore();
const cartStore = useCartStore();

const { filteredProducts } = storeToRefs(productStore);
const { addToCart } = cartStore;

const activeTenantPlan = ref('pro');

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('active_tenant_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        activeTenantPlan.value = parsed.planTier || 'pro';
      } catch (e) { }
    }
  }
});

const isPlanAllowed = (itemTier?: string) => {
  const storeTier = activeTenantPlan.value || 'pro';
  if (storeTier === 'enterprise') return true;
  if (storeTier === 'pro') return itemTier !== 'enterprise';
  // Starter tier store
  return itemTier === 'starter';
};

const displayProducts = computed(() => {
  return filteredProducts.value;
});

const handleProductClick = (product: ProductItem) => {
  if (isPlanAllowed(product.planTierAccess)) {
    addToCart(product);
  } else {
    alert(`This drug item requires ${product.planTierAccess?.toUpperCase()} subscription plan. Upgrade store plan to access this catalog item.`);
  }
};
</script>
