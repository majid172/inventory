<template>
  <div class="bg-[#f0f3f6] dark:bg-gray-950 border-b border-slate-300 dark:border-gray-800 px-2.5 py-1.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 select-none text-xs font-sans">
    <!-- Left: Category Pills List -->
    <div class="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none max-w-full">
      <span class="font-normal text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
        <span>📁</span> CATEGORY:
      </span>

      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.name"
        :class="[
          'flex items-center gap-1 px-2 py-0.5 text-xs font-normal transition-all whitespace-nowrap shrink-0 cursor-pointer border',
          activeCategory === cat.name 
            ? 'bg-[#107c41] text-white border-[#0e6b37]' 
            : 'bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 border-slate-300 dark:border-gray-700'
        ]"
      >
        <span>{{ getCategoryIcon(cat.name) }}</span>
        <span>{{ cat.name }}</span>
        <span 
          :class="[
            'px-1 py-0 text-[10px] font-mono border',
            activeCategory === cat.name ? 'bg-black/20 text-white border-white/30' : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-700'
          ]"
        >
          {{ cat.count }}
        </span>
      </button>
    </div>

    <!-- Center: Search Input Bar -->
    <div class="w-full md:w-auto flex-1 max-w-md my-1 md:my-0 order-3 md:order-2">
      <div class="relative w-full">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Scan barcode, brand name, generic chemical, or batch #..."
          class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 pl-7 pr-7 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#107c41] font-sans font-normal shadow-xs" 
        />
        <span class="absolute left-2 top-1.5 text-slate-400 text-xs">🔍</span>
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''"
          class="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-normal cursor-pointer"
          title="Clear search filter"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Right: Parked Orders & Store Plan Badge -->
    <div class="shrink-0 flex items-center gap-2 order-2 md:order-3">
      <button 
        @click="showHeldOrdersModal = true"
        class="flex items-center gap-1 bg-white dark:bg-gray-900 hover:bg-slate-100 border border-slate-300 dark:border-gray-700 px-2 py-0.5 text-xs font-normal text-amber-700 dark:text-amber-400 transition-all cursor-pointer shadow-xs"
        title="View Parked Rx Orders"
      >
        <span>⏸</span>
        <span class="hidden sm:inline">Parked</span>
        <span v-if="heldOrders.length > 0" class="bg-amber-600 text-white px-1 py-0 text-[10px] font-mono ml-0.5">
          {{ heldOrders.length }}
        </span>
      </button>

      <div v-if="tenantPlan" class="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono font-normal text-[11px]">
        <span>🛡️</span>
        <span>STORE PLAN: {{ tenantPlan.toUpperCase() }} TIER</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';
import { useCartStore } from '~/stores/cart';

const productStore = useProductStore();
const cartStore = useCartStore();

const { categories, activeCategory, searchQuery } = storeToRefs(productStore);
const { heldOrders, showHeldOrdersModal } = storeToRefs(cartStore);

const tenantPlan = ref('pro');

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('active_tenant_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        tenantPlan.value = parsed.planTier || 'pro';
      } catch (e) {}
    }
  }
});

const getCategoryIcon = (name: string) => {
  switch (name) {
    case 'Antibiotics': return '🧪';
    case 'Pain Relief & Analgesics': return '💊';
    case 'Cardiovascular': return '🫀';
    case 'Gastrointestinal': return '💊';
    case 'Respiratory & Allergy': return '🌬️';
    case 'Vitamins & Supplements': return '🌿';
    case 'Skincare & First Aid': return '🩹';
    case 'Medical Supplies': return '🩺';
    default: return '📁';
  }
};
</script>
