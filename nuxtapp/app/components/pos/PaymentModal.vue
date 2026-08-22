<template>
  <div v-if="showPaymentModal" class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
    <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
        <h2 class="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <span>💳 Complete Pharmacy Payment</span>
        </h2>
        <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 font-bold text-lg cursor-pointer">✕</button>
      </div>

      <!-- Payment Method Selection -->
      <div class="grid grid-cols-4 gap-1.5">
        <button 
          v-for="method in (['CASH', 'CARD', 'MOBILE', 'INSURANCE'] as const)" 
          :key="method"
          @click="selectedMethod = method"
          :class="[
            'py-2.5 rounded-xl font-bold text-[11px] border transition-all flex flex-col items-center gap-1 cursor-pointer',
            selectedMethod === method 
              ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-gray-950 border-emerald-500 shadow-md font-black' 
              : 'bg-slate-50 dark:bg-gray-950 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800'
          ]"
        >
          <span class="text-base">{{ method === 'CASH' ? '💵' : method === 'CARD' ? '💳' : method === 'MOBILE' ? '📱' : '🏥' }}</span>
          <span>{{ method }}</span>
        </button>
      </div>

      <!-- Amount Total Display -->
      <div class="bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl p-4 text-center">
        <div class="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">TOTAL DISPENSE DUE</div>
        <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">${{ total.toFixed(2) }}</div>
      </div>

      <!-- Cash Calculation Controls -->
      <div v-if="selectedMethod === 'CASH'" class="space-y-3">
        <label class="block text-xs font-bold text-slate-700 dark:text-gray-300">CASH TENDERED ($)</label>
        <input 
          type="number" 
          v-model.number="amountPaid" 
          step="0.01" 
          class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-3 text-lg font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
        />

        <!-- Quick Cash Presets -->
        <div class="grid grid-cols-4 gap-2">
          <button 
            v-for="preset in cashPresets" 
            :key="preset"
            @click="amountPaid = preset"
            class="bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 font-mono font-bold text-xs py-2 rounded-lg cursor-pointer"
          >
            ${{ preset }}
          </button>
        </div>

        <div class="flex justify-between items-center bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 text-xs">
          <span class="text-slate-600 dark:text-gray-400 font-bold">CHANGE RETURN:</span>
          <span class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
            ${{ (amountPaid - total > 0 ? amountPaid - total : 0).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Insurance Claim Notice -->
      <div v-if="selectedMethod === 'INSURANCE'" class="bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 p-3 rounded-xl text-xs text-teal-800 dark:text-teal-300 space-y-1">
        <div class="font-bold flex items-center gap-1.5">
          <span>🏥 Health Insurance Co-pay / Claim</span>
        </div>
        <p class="text-[11px] text-teal-700 dark:text-teal-400/80">Direct insurance claim token generated upon checkout verification.</p>
      </div>

      <!-- Submit Payment Action -->
      <div class="flex gap-2 pt-2">
        <button 
          @click="showPaymentModal = false"
          class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold py-3 rounded-xl text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button 
          @click="handlePay"
          :disabled="selectedMethod === 'CASH' && amountPaid < total"
          class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-gray-950 font-black py-3 rounded-xl text-xs shadow-lg cursor-pointer"
        >
          CONFIRM DISPENSE
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
const { showPaymentModal, total } = storeToRefs(cartStore);
const { completePayment } = cartStore;

const selectedMethod = ref<'CASH' | 'CARD' | 'MOBILE' | 'INSURANCE'>('CASH');
const amountPaid = ref<number>(0);

watch(total, (newTotal) => {
  amountPaid.value = Math.ceil(newTotal / 10) * 10 || newTotal;
}, { immediate: true });

const cashPresets = [10, 20, 50, 100];

const handlePay = () => {
  const finalPaid = selectedMethod.value === 'CASH' ? amountPaid.value : total.value;
  completePayment(selectedMethod.value, finalPaid);
};
</script>
