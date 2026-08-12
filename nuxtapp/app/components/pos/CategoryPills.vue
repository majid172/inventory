<template>
  <div class="category-pills-container select-none">
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="activeCategory = cat.name"
      :class="['category-pill', { active: activeCategory === cat.name }]"
    >
      <span>{{ cat.name }}</span>
      <span class="category-pill-badge">{{ cat.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/products';

const productStore = useProductStore();
const { categories, activeCategory } = storeToRefs(productStore);
</script>
