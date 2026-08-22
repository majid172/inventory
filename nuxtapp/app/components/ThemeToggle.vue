<template>
  <button 
    @click="toggleTheme" 
    type="button"
    class="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer select-none"
    :class="[
      isDark 
        ? 'bg-gray-900 border-gray-800 text-amber-400 hover:bg-gray-800 hover:border-gray-700' 
        : 'bg-white border-slate-200 text-amber-600 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200'
    ]"
    :title="isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
  >
    <span class="text-sm transition-transform duration-300 transform" :class="isDark ? 'rotate-0' : 'rotate-180'">
      {{ isDark ? '🌙' : '☀️' }}
    </span>
    <span class="font-sans tracking-wide">
      {{ isDark ? 'Dark' : 'Light' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTheme } from '~/composables/useTheme';

const { isDark, toggleTheme, initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>
