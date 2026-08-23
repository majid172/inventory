<template>
  <div v-if="showPaymentModal"
    class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
    <!-- Desktop Application Payment Terminal Window Frame -->
    <div
      class="bg-white dark:bg-gray-950 border border-slate-400 dark:border-gray-800 rounded-lg w-full max-w-lg shadow-2xl overflow-hidden font-sans">

      <!-- Desktop Window Titlebar Frame -->
      <div class="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 font-mono">💳</span>
          <span class="font-extrabold text-xs tracking-wider uppercase">POS Payment (Checkout
            Window)</span>
        </div>

        <!-- Window Controls -->
        <div class="flex items-center gap-1">

          <button @click="showPaymentModal = false"
            class="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition-colors">✕</button>
        </div>
      </div>

      <!-- Main Desktop Window Content Viewport -->
      <div class="p-4 space-y-4 text-xs">
        <div>
          <label
            class="block font-extrabold text-[11px] uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1.5">
            Select Payment Method:
          </label>
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="method in (['CASH', 'CARD', 'MOBILE', 'INSURANCE'] as const)" :key="method"
              @click="selectedMethod = method" :class="[
                'py-2 px-3 rounded-md font-extrabold text-xs border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer',
                selectedMethod === method
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-black'
                  : 'bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-800 hover:bg-slate-200 dark:hover:bg-gray-800'
              ]">
              <span class="text-sm">{{ method === 'CASH' ? '💵' : method === 'CARD' ? '💳' : method === 'MOBILE' ? '📱'
                : '🏥' }}</span>
              <span class="font-mono text-[10px]">{{ method }}</span>
            </button>
          </div>
        </div>

        <!-- POS Digital LED Screen Display (Total Due) -->
        <div class="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center text-white shadow-inner font-mono">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Total Dispense Amount
            Due</span>
          <span class="text-3xl font-black text-emerald-400 tracking-tight block mt-0.5">${{ total.toFixed(2) }}</span>
        </div>

        <!-- Cash Calculation Desktop Controls -->
        <div v-if="selectedMethod === 'CASH'"
          class="space-y-3 bg-slate-50 dark:bg-gray-900/60 p-3 rounded-lg border border-slate-200 dark:border-gray-800">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-700 dark:text-gray-300 text-xs">Cash Tendered ($) *</label>
              <button @click="amountPaid = total"
                class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline font-mono">
                [ Exact Change: ${{ total.toFixed(2) }} ]
              </button>
            </div>
            <input type="number" v-model.number="amountPaid" step="0.01"
              class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded-lg p-2.5 text-xl font-mono text-emerald-600 dark:text-emerald-400 font-black focus:outline-none focus:border-emerald-500 shadow-inner" />
          </div>

          <!-- Quick Cash Keypad Presets -->
          <div>
            <span
              class="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Quick
              Tender Presets:</span>
            <div class="grid grid-cols-5 gap-1.5">
              <button v-for="preset in cashPresets" :key="preset" @click="amountPaid = preset"
                class="bg-white dark:bg-gray-950 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-mono font-bold text-xs py-1.5 rounded cursor-pointer transition-colors">
                ${{ preset }}
              </button>
              <button @click="amountPaid = Math.ceil(total)"
                class="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs py-1.5 rounded cursor-pointer transition-colors">
                ${{ Math.ceil(total) }}
              </button>
            </div>
          </div>

          <!-- Change Return Display Bar -->
          <div
            class="flex justify-between items-center bg-white dark:bg-gray-950 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-800 text-xs">
            <span class="text-slate-600 dark:text-gray-400 font-bold uppercase text-[10px]">Change Due to
              Patient:</span>
            <span class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg">
              ${{ (amountPaid - total > 0 ? amountPaid - total : 0).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Insurance Claim Notice -->
        <div v-if="selectedMethod === 'INSURANCE'"
          class="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
          <div class="font-bold flex items-center gap-1.5">
            <span>🏥 Health Insurance Co-pay Claim Verification</span>
          </div>
          <p class="text-[11px] font-mono">Insurance authorization code token auto-generated upon invoice confirmation.
          </p>
        </div>

        <!-- Desktop Application Action Buttons Bar -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
          <button @click="showPaymentModal = false"
            class="px-4 py-2 bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 font-bold rounded-lg text-xs transition-colors cursor-pointer">
            Cancel (Esc)
          </button>
          <button @click="handlePay" :disabled="selectedMethod === 'CASH' && amountPaid < total"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-lg text-xs border border-emerald-500 shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
            <span>💳</span> CONFIRM DISPENSE & PRINT RECEIPT
          </button>
        </div>

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
