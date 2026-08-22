<template>
  <div v-if="showDiscountModal" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-gray-800 pb-3">
        <h2 class="text-base font-black text-emerald-400">🏷️ Apply Medical / Senior Discount</h2>
        <button @click="showDiscountModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
      </div>

      <!-- Quick Preset Discounts -->
      <div class="space-y-2 text-xs">
        <label class="block font-bold text-gray-300">PERCENTAGE DISCOUNT (SENIOR / DISABILITY)</label>
        <div class="grid grid-cols-4 gap-2">
          <button 
            v-for="pct in [5, 10, 15, 20]"
            :key="pct"
            @click="applyPercent(pct)"
            :class="[
              'py-2.5 text-xs font-black font-mono rounded-xl border transition-all',
              discountPercentage === pct ? 'bg-emerald-500 text-gray-950 border-emerald-400 shadow-md' : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800'
            ]"
          >
            {{ pct }}%
          </button>
        </div>
      </div>

      <!-- Custom Fixed Amount Discount -->
      <div class="space-y-2 text-xs">
        <label class="block font-bold text-gray-300">OR FIXED DISCOUNT AMOUNT ($)</label>
        <input 
          type="number" 
          v-model.number="tempAmount"
          placeholder="0.00"
          step="0.50"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div class="flex gap-2 pt-2">
        <button @click="clearDiscount" class="flex-1 bg-gray-950 border border-gray-800 text-rose-400 font-bold py-2.5 rounded-xl text-xs hover:bg-rose-950/40">
          Remove Discount
        </button>
        <button @click="saveDiscount" class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40">
          Apply Discount
        </button>
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
