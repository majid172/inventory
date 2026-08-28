<template>
  <div class="flex flex-col items-center justify-center p-8 space-y-5">
    <!-- Animated Capsule -->
    <div class="relative w-24 h-24 flex items-center justify-center">
      <!-- Shadow underneath -->
      <div class="absolute -bottom-2 w-12 h-2.5 bg-slate-200 dark:bg-gray-800/80 rounded-[50%] animate-pulse mx-auto blur-[2px]"></div>
      
      <!-- Bouncing Capsule SVG -->
      <div class="relative z-10 animate-bounce flex items-center justify-center drop-shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 100 100" class="transform -rotate-45">
          <defs>
            <!-- Glossy Highlight for 3D effect -->
            <linearGradient id="capsuleGloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="white" stop-opacity="0.7" />
              <stop offset="30%" stop-color="white" stop-opacity="0.2" />
              <stop offset="100%" stop-color="white" stop-opacity="0" />
            </linearGradient>
            <!-- Inner Shadow for depth -->
            <linearGradient id="capsuleShadow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="black" stop-opacity="0.25" />
              <stop offset="100%" stop-color="black" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- Top Half (Dynamic Theme Color) -->
          <path d="M 30 50 L 30 30 A 20 20 0 0 1 70 30 L 70 50 Z" style="fill: var(--theme-main, #107c41)" />
          
          <!-- Bottom Half (White/Light Gray) -->
          <path d="M 30 50 L 30 70 A 20 20 0 0 0 70 70 L 70 50 Z" fill="#f8fafc" />
          
          <!-- Middle overlapping joint (Slightly overlapping the white to look like a real capsule) -->
          <path d="M 28 50 C 28 53, 72 53, 72 50 L 70 48 L 30 48 Z" style="fill: var(--theme-main, #107c41); filter: brightness(0.9)" />

          <!-- 3D Glossy Overlay -->
          <path d="M 30 30 A 20 20 0 0 1 70 30 L 70 70 A 20 20 0 0 1 30 70 Z" fill="url(#capsuleGloss)" />
          
          <!-- 3D Shadow Overlay -->
          <path d="M 30 30 A 20 20 0 0 1 70 30 L 70 70 A 20 20 0 0 1 30 70 Z" fill="url(#capsuleShadow)" />

          <!-- Bright edge highlight on the top left -->
          <path d="M 34 35 A 14 14 0 0 1 45 22" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.8" />
          <path d="M 34 42 L 34 65" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
        </svg>
      </div>
    </div>
    
    <!-- Text -->
    <div class="text-slate-500 dark:text-gray-400 text-xs font-sans tracking-widest uppercase animate-pulse flex items-center gap-1.5 mt-4">
      <span class="w-2 h-2 rounded-full animate-ping" style="background-color: var(--theme-main, #10b981)"></span>
      <span class="font-bold">{{ text || 'Loading Data...' }}</span>
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
