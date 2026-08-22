<template>
  <div class="bg-slate-100 dark:bg-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none select-none text-xs">
    <!-- Category Pills List -->
    <div class="flex items-center gap-1.5 shrink-0">
      <span class="font-extrabold text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
        <span>📁</span> CATEGORY:
      </span>

      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.name"
        :class="[
          'flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm',
          activeCategory === cat.name 
            ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow' 
            : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 border-slate-300 dark:border-gray-700'
        ]"
      >
        <span>{{ getCategoryIcon(cat.name) }}</span>
        <span>{{ cat.name }}</span>
        <span 
          :class="[
            'px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border',
            activeCategory === cat.name ? 'bg-black/20 text-white border-white/30' : 'bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-800'
          ]"
        >
          {{ cat.count }}
        </span>
      </button>
    </div>

    <!-- Active Store Plan Badge -->
    <div v-if="tenantPlan" class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-[11px]">
      <span>🛡️</span>
      <span>STORE PLAN: {{ tenantPlan.toUpperCase() }} TIER</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';

const productStore = useProductStore();
const { categories, activeCategory } = storeToRefs(productStore);
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
