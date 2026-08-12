<template>
  <div class="flex-1 overflow-y-auto pr-1 select-none">
    <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500 font-sans text-sm">
      <span class="text-4xl mb-2">🔍</span>
      <p class="font-semibold">No products match your search or filter.</p>
    </div>

    <div v-else class="products-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        @click="addToCart(product)"
        class="product-card-horizontal"
      >
        <!-- Left Side: Product Image / Icon -->
        <div class="product-image-box-horizontal">
          <span>{{ product.icon || '☕' }}</span>
        </div>

        <!-- Right Side: Category, Title, Price & Action -->
        <div class="product-content-horizontal">
          <div>
            <div class="product-category-tag">{{ product.category }}</div>
            <h3 class="product-title" :title="product.name">{{ product.name }}</h3>
          </div>

          <div class="product-price-row-horizontal">
            <span class="product-price">${{ product.price.toFixed(2) }}</span>
            <button class="product-add-btn" title="Add to cart">+</button>
          </div>
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
