<template>
  <div>
    <!-- Mobile Backdrop overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'w-64 bg-gray-950 border-r border-gray-800 flex flex-col justify-between select-none h-screen z-50 transition-transform duration-300 ease-in-out',
        'fixed lg:static top-0 left-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div>
        <!-- Brand Logo & Mobile Close Button -->
        <div class="h-16 border-b border-gray-800 px-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">☕</span>
            <div>
              <h1 class="font-black text-amber-500 text-lg tracking-wider font-sans leading-none">INVENTORY</h1>
              <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <button @click="closeSidebar" class="lg:hidden text-gray-400 hover:text-gray-200 font-bold text-lg">
            ✕
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="p-3 space-y-1">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path"
            @click="closeSidebar"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all"
            :class="[
              route.path === link.path 
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-950/30' 
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-900'
            ]"
          >
            <span class="text-base">{{ link.icon }}</span>
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Quick Back to POS Button -->
      <div class="p-4 border-t border-gray-800">
        <NuxtLink 
          to="/" 
          @click="closeSidebar"
          class="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-amber-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors"
        >
          <span>💻 Open POS Register</span>
        </NuxtLink>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAdminNav } from '~/composables/useAdminNav';

const route = useRoute();
const { isSidebarOpen, closeSidebar } = useAdminNav();

const navLinks = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Categories', path: '/admin/categories', icon: '📁' },
  { label: 'Products Catalog', path: '/admin/products', icon: '☕' },
  { label: 'Ingredients Stock', path: '/admin/ingredients', icon: '🥛' },
  { label: 'Suppliers', path: '/admin/suppliers', icon: '🚚' },
  { label: 'Inventory Balance', path: '/admin/inventory', icon: '📦' },
  { label: 'POS Sales Orders', path: '/admin/orders', icon: '🛍️' }
];
</script>
