<template>
  <div class="category-pills-container select-none flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-4 pt-3">
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="activeCategory = cat.name"
      :class="[
        'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 cursor-pointer',
        activeCategory === cat.name 
          ? 'bg-emerald-500 text-gray-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]' 
          : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100'
      ]"
    >
      <span>{{ getCategoryIcon(cat.name) }}</span>
      <span>{{ cat.name }}</span>
      <span 
        :class="[
          'px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black',
          activeCategory === cat.name ? 'bg-gray-950/20 text-gray-950' : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
        ]"
      >
        {{ cat.count }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';

const productStore = useProductStore();
const { categories, activeCategory } = storeToRefs(productStore);

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
    default: return '💊';
  }
};
</script>
