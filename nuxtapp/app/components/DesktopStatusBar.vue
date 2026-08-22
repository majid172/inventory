<template>
  <footer class="h-8 bg-gradient-to-b from-slate-800 to-slate-950 dark:from-slate-900 dark:to-slate-950 text-slate-200 border-t border-slate-700 text-[11px] font-sans px-2 flex items-center justify-between select-none shrink-0 z-30 transition-colors duration-200 shadow-md">
    <!-- Left: Windows 7 Start Orb Icon & Hotkeys -->
    <div class="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
      <!-- Windows 7 Start Orb Button Simulation -->
      <div 
        class="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-sky-400 hover:scale-105 transition-transform shadow cursor-pointer border border-sky-300/40"
        title="Windows 7 PharmaCare Start Menu"
      >
        <span class="text-xs">🪟</span>
      </div>

      <div class="h-3 w-[1px] bg-slate-700"></div>

      <!-- Hotkeys Bar -->
      <div class="flex items-center gap-2 font-mono whitespace-nowrap">
        <div class="flex items-center gap-1">
          <span class="bg-blue-900/80 text-sky-300 border border-blue-600/60 px-1.5 py-0.2 rounded font-bold text-[10px]">F1</span>
          <span class="text-slate-300 font-sans">Search</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-blue-900/80 text-sky-300 border border-blue-600/60 px-1.5 py-0.2 rounded font-bold text-[10px]">F2</span>
          <span class="text-slate-300 font-sans">Patient</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-emerald-950 text-emerald-400 border border-emerald-700 px-1.5 py-0.2 rounded font-bold text-[10px]">F4</span>
          <span class="text-slate-300 font-sans">Pay</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-amber-950 text-amber-400 border border-amber-700 px-1.5 py-0.2 rounded font-bold text-[10px]">F8</span>
          <span class="text-slate-300 font-sans">Park</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-sky-950 text-sky-400 border border-sky-700 px-1.5 py-0.2 rounded font-bold text-[10px]">F10</span>
          <span class="text-slate-300 font-sans">POS</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-sky-950 text-sky-400 border border-sky-700 px-1.5 py-0.2 rounded font-bold text-[10px]">F11</span>
          <span class="text-slate-300 font-sans">Admin</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-rose-950 text-rose-400 border border-rose-700 px-1.5 py-0.2 rounded font-bold text-[10px]">ESC</span>
          <span class="text-slate-300 font-sans">Reset</span>
        </div>
      </div>
    </div>

    <!-- Right: Windows 7 System Tray Area -->
    <div class="hidden md:flex items-center gap-3 shrink-0 text-[10px] font-mono">
      <div class="flex items-center gap-1 text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Postgres DB: <strong class="text-emerald-400">READY</strong></span>
      </div>

      <div class="h-3 w-[1px] bg-slate-700"></div>

      <div class="text-slate-300">
        <span>Terminal: <strong>#01</strong></span>
      </div>

      <div class="h-3 w-[1px] bg-slate-700"></div>

      <!-- Windows 7 System Tray Clock Indicator -->
      <div class="bg-slate-900/90 border border-slate-700 px-2.5 py-0.5 rounded text-sky-300 font-bold flex items-center gap-1.5 shadow-inner">
        <span>📶</span>
        <span>{{ formattedTime }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const formattedTime = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

const updateClock = () => {
  const now = new Date();
  formattedTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
