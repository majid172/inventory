<template>
  <div v-if="showModifierModal && activeEditingItem" class="modal-backdrop select-none">
    <div class="modal-content">
      <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
        <h2 class="text-base font-bold text-amber-500">Customize Item: {{ activeEditingItem.product.name }}</h2>
        <button @click="showModifierModal = false" class="text-slate-400 hover:text-slate-200 font-bold">✕</button>
      </div>

      <!-- Size Option -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-300 mb-2">SIZE</label>
        <div class="grid grid-cols-3 gap-2">
          <button 
            v-for="size in (['Small', 'Medium', 'Large'] as const)"
            :key="size"
            @click="tempSize = size"
            :class="[
              'py-2 text-xs font-bold rounded-lg border transition-all',
              tempSize === size ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
            ]"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <!-- Add-on Modifiers -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-300 mb-2">ADD-ONS / MODIFIERS</label>
        <div class="space-y-2">
          <label 
            v-for="mod in availableModifiers"
            :key="mod"
            class="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs cursor-pointer text-slate-200"
          >
            <input 
              type="checkbox" 
              :value="mod" 
              v-model="tempModifiers"
              class="accent-amber-500 rounded"
            />
            <span>{{ mod }}</span>
          </label>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="showModifierModal = false" class="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs">
          Cancel
        </button>
        <button @click="saveModifiers" class="flex-1 bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs">
          Save Options
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCart } from '~/composables/useCart';

const { showModifierModal, activeEditingItem } = useCart();

const tempSize = ref<'Small' | 'Medium' | 'Large'>('Medium');
const tempModifiers = ref<string[]>([]);
const availableModifiers = ['Extra Shot (+ $0.75)', 'Oat Milk (+ $0.60)', 'Sugar Free Syrup', 'Less Ice', 'Extra Whip'];

watch(activeEditingItem, (item) => {
  if (item) {
    tempSize.value = item.selectedSize;
    tempModifiers.value = [...item.modifiers];
  }
});

const saveModifiers = () => {
  if (activeEditingItem.value) {
    activeEditingItem.value.selectedSize = tempSize.value;
    activeEditingItem.value.modifiers = [...tempModifiers.value];
  }
  showModifierModal.value = false;
};
</script>
