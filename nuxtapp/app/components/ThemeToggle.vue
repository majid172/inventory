<template>
  <button 
    @click="toggleTheme" 
    type="button"
    class="relative inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-normal transition-colors cursor-pointer select-none"
    :class="[
      isDark 
        ? 'bg-transparent text-slate-200 hover:bg-slate-500/30' 
        : 'bg-transparent text-slate-200 hover:bg-slate-500/30'
    ]"
    :title="isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
  >
    <span class="text-xs transition-transform duration-300 transform" :class="isDark ? 'rotate-0' : 'rotate-180'">
      {{ isDark ? '🌙' : '☀️' }}
    </span>
    <span class="font-sans tracking-wide opacity-80">
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
