<template>
  <div v-if="showDiscountModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
    <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden font-sans">
      <!-- Titlebar -->
      <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
        <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
          <span>🏷️</span> Apply Medical / Senior Discount
        </h3>
        <button @click="showDiscountModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
      </div>

      <div class="p-3.5 space-y-3 text-xs">
        <!-- Quick Preset Discounts -->
        <div class="space-y-1.5">
          <label class="block font-normal text-slate-600 dark:text-gray-400">Percentage Discount (Senior / Disability)</label>
          <div class="grid grid-cols-4 gap-1.5">
            <button 
              v-for="pct in [5, 10, 15, 20]"
              :key="pct"
              @click="applyPercent(pct)"
              :class="[
                'py-1.5 text-xs font-normal font-mono border transition-colors cursor-pointer',
                discountPercentage === pct 
                  ? 'bg-[#107c41] text-white border-[#0e6b37]' 
                  : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-700 hover:bg-slate-50'
              ]"
            >
              {{ pct }}%
            </button>
          </div>
        </div>

        <!-- Custom Fixed Amount Discount -->
        <div class="space-y-1">
          <label class="block font-normal text-slate-600 dark:text-gray-400">Or Fixed Discount Amount ($)</label>
          <input 
            type="number" 
            v-model.number="tempAmount"
            placeholder="0.00"
            step="0.50"
            class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41]"
          />
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
          <button @click="clearDiscount" class="px-3 py-1 bg-white hover:bg-rose-50 border border-slate-300 dark:border-gray-700 text-rose-600 dark:text-rose-400 font-normal text-xs cursor-pointer">
            Remove Discount
          </button>
          <button @click="saveDiscount" class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal text-xs border border-[#0e6b37] cursor-pointer">
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';

const cartStore = useCartStore();
const { showDiscountModal, discountPercentage, discountAmount } = storeToRefs(cartStore);

const tempAmount = ref<number>(discountAmount.value);

const applyPercent = (pct: number) => {
  discountPercentage.value = pct;
  discountAmount.value = 0;
  tempAmount.value = 0;
};

const saveDiscount = () => {
  if (tempAmount.value > 0) {
    discountAmount.value = tempAmount.value;
    discountPercentage.value = 0;
  }
  showDiscountModal.value = false;
};

const clearDiscount = () => {
  discountPercentage.value = 0;
  discountAmount.value = 0;
  tempAmount.value = 0;
  showDiscountModal.value = false;
};
</script>
