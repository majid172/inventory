<template>
  <div v-if="showModifierModal && activeEditingItem" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-gray-800 pb-3">
        <h2 class="text-base font-black text-emerald-400">Dosage Instructions: {{ activeEditingItem.product.name }}</h2>
        <button @click="showModifierModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
      </div>

      <!-- Quick Preset Directions -->
      <div class="space-y-2 text-xs">
        <label class="block font-bold text-gray-300">PRESET DOSAGE DIRECTIONS</label>
        <div class="space-y-1.5">
          <button 
            v-for="preset in presetDosages" 
            :key="preset"
            @click="tempDosage = preset"
            :class="[
              'w-full text-left p-2.5 rounded-xl border text-xs transition-all font-sans',
              tempDosage === preset ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold' : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800'
            ]"
          >
            📋 {{ preset }}
          </button>
        </div>
      </div>

      <!-- Custom Dosage Input -->
      <div class="space-y-1.5 text-xs">
        <label class="block font-bold text-gray-300">CUSTOM DOSAGE DIRECTION</label>
        <input 
          type="text" 
          v-model="tempDosage" 
          placeholder="e.g. Take 1 tablet every 8 hours after meals"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div class="flex gap-2 pt-2">
        <button @click="showModifierModal = false" class="flex-1 bg-gray-950 border border-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs">
          Cancel
        </button>
        <button @click="saveModifiers" class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40">
          Save Dosage
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';

const cartStore = useCartStore();
const { showModifierModal, activeEditingItem } = storeToRefs(cartStore);

const tempDosage = ref('');
const presetDosages = [
  'Take 1 tablet twice daily after meals',
  'Take 1 capsule every 8 hours with water',
  'Take 10ml 3 times daily after food',
  'Apply a thin layer to affected area twice daily',
  '2 puffs as needed for shortness of breath',
  'Dissolve 1 tablet in water once daily in the morning'
];

watch(activeEditingItem, (item) => {
  if (item) {
    tempDosage.value = item.dosageInstructions || '';
  }
});

const saveModifiers = () => {
  if (activeEditingItem.value) {
    activeEditingItem.value.dosageInstructions = tempDosage.value;
  }
  showModifierModal.value = false;
};
</script>
