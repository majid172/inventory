<template>
  <div v-if="showPaymentModal"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
    <!-- Desktop Application Payment Terminal Window Frame (Sharp 1px border, Regular Font) -->
    <div
      class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-lg shadow-lg overflow-hidden font-sans">

      <!-- Desktop Window Titlebar (Clean, Regular Font) -->
      <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
        <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
          <span>💳</span> POS Payment (Checkout Window)
        </h3>

        <!-- Titlebar Close Control -->
        <button @click="showPaymentModal = false"
          class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer"
          title="Close [Esc]">✕</button>
      </div>

      <!-- Main Desktop Window Content Viewport -->
      <div class="p-3.5 space-y-3 text-xs">
        <!-- Payment Method Tabs -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-slate-600 dark:text-gray-400 font-normal text-xs">
              Select Payment Method:
            </span>
          </div>
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="method in (['CASH', 'CARD', 'MOBILE', 'INSURANCE'] as const)" :key="method"
              @click="selectedMethod = method" :class="[
                'py-1.5 px-2 border font-normal text-xs transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer',
                selectedMethod === method
                  ? 'bg-[#107c41] text-white border-[#0e6b37]'
                  : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800'
              ]">
              <span class="text-xs">{{ method === 'CASH' ? '💵' : method === 'CARD' ? '💳' : method === 'MOBILE' ? '📱' : '🏥' }}</span>
              <span class="text-[11px] font-mono">{{ method }}</span>
            </button>
          </div>
        </div>

        <!-- Total Due Summary Display (Sharp Desktop Box) -->
        <div class="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2.5 flex items-center justify-between">
          <span class="text-slate-600 dark:text-gray-400 font-normal text-xs uppercase tracking-wide">
            Total Dispense Amount Due:
          </span>
          <span class="text-xl font-normal font-mono text-slate-900 dark:text-gray-100">
            {{ settingsStore.currencySymbol }}{{ total.toFixed(2) }}
          </span>
        </div>

        <!-- Cash Calculation Desktop Controls -->
        <div v-if="selectedMethod === 'CASH'"
          class="space-y-2.5 bg-slate-50 dark:bg-gray-900/60 p-2.5 border border-slate-200 dark:border-gray-800">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-normal text-slate-700 dark:text-gray-300 text-xs">Cash Tendered ($) *</label>
              <button @click="amountPaid = total"
                class="text-[10px] text-[#107c41] dark:text-emerald-400 font-normal hover:underline font-mono cursor-pointer">
                [ Exact Change: {{ settingsStore.currencySymbol }}{{ total.toFixed(2) }} ]
              </button>
            </div>
            <input type="number" v-model.number="amountPaid" step="0.01"
              class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-base font-mono text-slate-900 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41]" />
          </div>

          <!-- Quick Cash Keypad Presets -->
          <div>
            <span class="text-[11px] font-normal text-slate-500 dark:text-gray-400 block mb-1">
              Quick Tender Presets:
            </span>
            <div class="grid grid-cols-5 gap-1.5">
              <button v-for="preset in cashPresets" :key="preset" @click="amountPaid = preset"
                class="bg-white dark:bg-gray-950 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-mono font-normal text-xs py-1 cursor-pointer transition-colors">
                {{ settingsStore.currencySymbol }}{{ preset }}
              </button>
              <button @click="amountPaid = Math.ceil(total)"
                class="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono font-normal text-xs py-1 cursor-pointer transition-colors">
                {{ settingsStore.currencySymbol }}{{ Math.ceil(total) }}
              </button>
            </div>
          </div>

          <!-- Change Return Display Bar -->
          <div
            class="flex justify-between items-center bg-white dark:bg-gray-950 px-2.5 py-1.5 border border-slate-300 dark:border-gray-800 text-xs">
            <span class="text-slate-600 dark:text-gray-400 font-normal">Change Due to Patient:</span>
            <span class="font-mono font-normal text-[#107c41] dark:text-emerald-400 text-base">
              {{ settingsStore.currencySymbol }}{{ (amountPaid - total > 0 ? amountPaid - total : 0).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Insurance Claim Notice -->
        <div v-if="selectedMethod === 'INSURANCE'"
          class="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 space-y-0.5">
          <div class="font-normal flex items-center gap-1.5">
            <span>🏥</span> Health Insurance Co-pay Claim Verification
          </div>
          <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal">
            Insurance authorization code token auto-generated upon invoice confirmation.
          </p>
        </div>

        <!-- Desktop Application Action Buttons Bar -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
          <button @click="showPaymentModal = false"
            class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
            Cancel (Esc)
          </button>
          <button @click="handlePay" :disabled="selectedMethod === 'CASH' && amountPaid < total"
            class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal text-xs border border-[#0e6b37] transition-all cursor-pointer flex items-center gap-1">
            <span>💳</span> Confirm Dispense & Print Receipt
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
import { useSettingsStore } from '~/stores/settings';

const cartStore = useCartStore();
const settingsStore = useSettingsStore();
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
