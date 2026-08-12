<template>
  <div v-if="showPaymentModal" class="modal-backdrop select-none">
    <div class="modal-content">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
        <h2 class="text-lg font-extrabold text-amber-500 flex items-center gap-2">
          <span>💳 Complete Payment</span>
        </h2>
        <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-200 font-bold text-lg">✕</button>
      </div>

      <!-- Payment Method Selection -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <button 
          v-for="method in (['CASH', 'CARD', 'MOBILE'] as const)" 
          :key="method"
          @click="selectedMethod = method"
          :class="[
            'py-2.5 rounded-lg font-bold text-xs border transition-all flex flex-col items-center gap-1',
            selectedMethod === method 
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-950/40' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          ]"
        >
          <span class="text-base">{{ method === 'CASH' ? '💵' : method === 'CARD' ? '💳' : '📱' }}</span>
          <span>{{ method }}</span>
        </button>
      </div>

      <!-- Amount Total Display -->
      <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4 text-center">
        <div class="text-xs text-slate-400 font-medium">TOTAL DUE</div>
        <div class="text-3xl font-black text-emerald-400 font-mono mt-1">${{ total.toFixed(2) }}</div>
      </div>

      <!-- Cash Calculation Controls -->
      <div v-if="selectedMethod === 'CASH'" class="mb-4">
        <label class="block text-xs font-bold text-slate-300 mb-2">CASH TENDERED ($)</label>
        <input 
          type="number" 
          v-model.number="amountPaid" 
          step="0.01" 
          class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-lg font-mono text-emerald-400 focus:outline-none focus:border-amber-500 mb-3"
        />

        <!-- Quick Cash Presets -->
        <div class="grid grid-cols-4 gap-2 mb-3">
          <button 
            v-for="preset in cashPresets" 
            :key="preset"
            @click="amountPaid = preset"
            class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono font-bold text-xs py-2 rounded-lg"
          >
            ${{ preset }}
          </button>
        </div>

        <div class="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/60 text-xs">
          <span class="text-slate-400">CHANGE RETURN:</span>
          <span class="font-mono font-extrabold text-amber-400 text-sm">
            ${{ (amountPaid - total > 0 ? amountPaid - total : 0).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Submit Payment Action -->
      <div class="flex gap-2">
        <button 
          @click="showPaymentModal = false"
          class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-sm"
        >
          Cancel
        </button>
        <button 
          @click="handlePay"
          :disabled="selectedMethod === 'CASH' && amountPaid < total"
          class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-sm shadow-lg shadow-emerald-950/40"
        >
          CONFIRM SALE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCart } from '~/composables/useCart';

const { showPaymentModal, total, completePayment } = useCart();
const selectedMethod = ref<'CASH' | 'CARD' | 'MOBILE'>('CASH');
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
