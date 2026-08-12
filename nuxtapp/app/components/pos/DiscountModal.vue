<template>
  <div v-if="showDiscountModal" class="modal-backdrop select-none">
    <div class="modal-content">
      <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
        <h2 class="text-base font-bold text-amber-500">🏷️ Apply Order Discount</h2>
        <button @click="showDiscountModal = false" class="text-slate-400 hover:text-slate-200 font-bold">✕</button>
      </div>

      <!-- Quick Preset Discounts -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-300 mb-2">PERCENTAGE DISCOUNT</label>
        <div class="grid grid-cols-4 gap-2">
          <button 
            v-for="pct in [5, 10, 15, 20]"
            :key="pct"
            @click="applyPercent(pct)"
            :class="[
              'py-2.5 text-xs font-bold font-mono rounded-lg border transition-all',
              discountPercentage === pct ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
            ]"
          >
            {{ pct }}%
          </button>
        </div>
      </div>

      <!-- Custom Fixed Amount Discount -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-300 mb-2">OR FIXED AMOUNT ($)</label>
        <input 
          type="number" 
          v-model.number="tempAmount"
          placeholder="0.00"
          step="0.50"
          class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      <div class="flex gap-2">
        <button @click="clearDiscount" class="flex-1 bg-slate-800 text-rose-400 font-bold py-2.5 rounded-xl text-xs border border-slate-700">
          Remove Discount
        </button>
        <button @click="saveDiscount" class="flex-1 bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs">
          Apply Discount
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCart } from '~/composables/useCart';

const { showDiscountModal, discountPercentage, discountAmount } = useCart();
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
