<template>
  <div class="flex flex-col items-center justify-center p-8 space-y-5">
    <!-- Animated Capsule -->
    <div class="relative w-16 h-16 flex items-center justify-center">
      <!-- Shadow underneath -->
      <div class="absolute -bottom-4 w-10 h-2 bg-slate-300 dark:bg-gray-800 rounded-[50%] animate-pulse mx-auto"></div>
      
      <!-- Bouncing Capsule SVG -->
      <div class="relative z-10 animate-bounce flex items-center justify-center">
        <!-- We use a custom keyframes animation to rotate and bounce a bit, or just standard animate-bounce -->
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="transform -rotate-45 drop-shadow-md">
          <!-- Top Half (Colored) -->
          <path fill="#10b981" d="M18.364 5.636a7 7 0 0 0-9.9 0l-1.414 1.414 9.9 9.9 1.414-1.414a7 7 0 0 0 0-9.9z" />
          <!-- Bottom Half (White/Light Gray) -->
          <path fill="#f8fafc" class="dark:fill-gray-300" d="M5.636 18.364a7 7 0 0 0 9.9 0l1.414-1.414-9.9-9.9-1.414 1.414a7 7 0 0 0 0 9.9z" />
          <!-- Shine on Top Half -->
          <path fill="rgba(255,255,255,0.4)" d="M16.243 6.343a4.978 4.978 0 0 0-6.364-.707l7.071 7.071a4.978 4.978 0 0 0-.707-6.364z"/>
        </svg>
      </div>
    </div>
    
    <!-- Text -->
    <div class="text-slate-500 dark:text-gray-400 text-xs font-sans tracking-widest uppercase animate-pulse flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
      {{ text || 'Loading Data...' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: 'Loading Data...'
  }
});
</script>
