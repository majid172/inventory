<template>
  <div class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 font-normal">
    <div>
      Displaying {{ Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) }} to 
      {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} entries
      <span class="ml-1 text-slate-400 dark:text-gray-500">(Page {{ currentPage }} of {{ totalPages }})</span>
    </div>
    <div class="flex items-center gap-1.5">
      <button 
        @click="$emit('prev')" 
        :disabled="currentPage === 1 || totalItems === 0"
        class="px-2 py-0.5 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-slate-600 dark:text-gray-300 active:scale-95 flex items-center gap-1"
      >
        <span>&larr;</span> Prev
      </button>
      <button 
        @click="$emit('next')" 
        :disabled="currentPage === totalPages || totalItems === 0"
        class="px-2 py-0.5 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-slate-600 dark:text-gray-300 active:scale-95 flex items-center gap-1"
      >
        Next <span>&rarr;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true }
});

defineEmits(['prev', 'next']);
</script>
