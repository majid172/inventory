<template>
  <div v-if="showReceiptModal && completedReceipt" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
    <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden font-sans max-h-[92vh] flex flex-col">
      <!-- Titlebar -->
      <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between shrink-0">
        <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
          <span>🧾</span> Prescription Dispense Invoice (#{{ completedReceipt.orderId }})
        </h3>
        <button @click="showReceiptModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
      </div>

      <!-- Printable Pharmacy Receipt / Invoice Area -->
      <div class="p-3.5 space-y-3 overflow-y-auto flex-1 text-xs">
        <div class="bg-white text-gray-900 p-4 font-mono text-xs border border-slate-300 space-y-2.5">
          <!-- Header -->
          <div class="text-center border-b border-dashed border-gray-300 pb-2.5">
            <div class="text-sm font-bold tracking-wide text-slate-900 flex items-center justify-center gap-1">
              <span>💊 {{ storeName }}</span>
            </div>
            <p v-if="storeAddress" class="text-[10px] text-gray-500 font-sans">{{ storeAddress }}</p>
            <p class="text-[10px] text-gray-400">
              <span v-if="storePhone">Phone: {{ storePhone }} • </span>Reg #PH-884920
            </p>
            
            <div class="mt-2 text-[10px] text-gray-700 bg-slate-50 p-2 text-left space-y-0.5 border border-slate-200">
              <div>INVOICE REF: <strong class="font-normal">{{ completedReceipt.orderId }}</strong></div>
              <div>DATE & TIME: {{ completedReceipt.date }}</div>
              <div>CUSTOMER / PHONE: <strong class="font-normal">{{ completedReceipt.patientPhone || completedReceipt.patientName || 'Walk-in Customer' }}</strong></div>
              <div v-if="completedReceipt.doctorName && completedReceipt.doctorName !== 'N/A (OTC)'">PRESCRIBER: {{ completedReceipt.doctorName }}</div>
            </div>
          </div>

          <!-- Dispensed Items Table -->
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-gray-300 text-[10px] text-gray-500 font-normal uppercase">
                <th class="pb-1">ITEM</th>
                <th class="pb-1 text-center">QTY</th>
                <th class="pb-1 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in completedReceipt.items" :key="item.cartId">
                <td class="py-1">
                  <div class="font-normal text-gray-900">{{ item.product.name }}</div>
                  <div class="text-[9px] text-gray-500">{{ item.product.genericName }} ({{ item.product.dosageForm || 'Tablet' }})</div>
                  <div v-if="item.dosageInstructions" class="text-[9px] text-gray-600 bg-amber-50 px-1 py-0.2 mt-0.5 border border-amber-200">
                    Dir: {{ item.dosageInstructions }}
                  </div>
                </td>
                <td class="py-1 text-center font-mono">{{ item.quantity }}</td>
                <td class="py-1 text-right font-mono text-gray-900">{{ settingsStore.currencySymbol }}{{ item.itemTotal.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals Breakdown -->
          <div class="border-t border-dashed border-gray-300 pt-2 space-y-1 text-xs">
            <div class="flex justify-between text-gray-600">
              <span>SUBTOTAL:</span>
              <span class="font-mono">{{ settingsStore.currencySymbol }}{{ completedReceipt.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-emerald-700" v-if="completedReceipt.discount > 0">
              <span>DISCOUNT:</span>
              <span class="font-mono">-{{ settingsStore.currencySymbol }}{{ completedReceipt.discount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs border-t border-gray-900 pt-1 mt-1 text-gray-900 font-normal">
              <span>TOTAL DUE:</span>
              <span class="font-mono">{{ settingsStore.currencySymbol }}{{ completedReceipt.total.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-[11px] text-gray-600 pt-0.5">
              <span>METHOD:</span>
              <span class="uppercase font-mono font-medium">{{ completedReceipt.paymentMethod }}</span>
            </div>
            <div v-if="completedReceipt.transactionNo" class="flex justify-between text-[11px] text-slate-900 bg-amber-50 dark:bg-amber-950/40 p-1 border border-amber-300 dark:border-amber-800 mt-1">
              <span class="font-mono text-slate-600 dark:text-gray-400">TRX ID:</span>
              <span class="font-mono font-bold tracking-wider">{{ completedReceipt.transactionNo }}</span>
            </div>
            <div class="flex justify-between text-[11px] text-gray-600" v-if="completedReceipt.paymentMethod === 'CASH'">
              <span>CHANGE RETURNED:</span>
              <span class="font-mono font-normal">{{ settingsStore.currencySymbol }}{{ completedReceipt.changeGiven.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
          <button 
            @click="windowPrint" 
            class="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs flex items-center gap-1 cursor-pointer"
          >
            🖨️ Print Receipt
          </button>
          <button 
            @click="closeReceipt" 
            class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal text-xs border border-[#0e6b37] cursor-pointer"
          >
            New Dispense [Esc]
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';
import { useSettingsStore } from '~/stores/settings';
import { useProductStore } from '~/stores/products';

const emit = defineEmits(['close']);
const cartStore = useCartStore();
const settingsStore = useSettingsStore();
const productStore = useProductStore();

const { showReceiptModal, completedReceipt } = storeToRefs(cartStore);

const closeReceipt = () => {
  showReceiptModal.value = false;
  productStore.fetchProducts();
};

const storeName = computed(() => {
  return settingsStore.tenantSettings?.name || 
         settingsStore.tenantSettings?.store_name || 
         settingsStore.tenantSettings?.storeName || 
         (process.client && JSON.parse(localStorage.getItem('active_tenant_store') || '{}')?.name) ||
         'My Pharmacy Store';
});

const storeAddress = computed(() => {
  return settingsStore.tenantSettings?.address || 
         (process.client && JSON.parse(localStorage.getItem('active_tenant_store') || '{}')?.address) || 
         '';
});

const storePhone = computed(() => {
  return settingsStore.tenantSettings?.phone || 
         (process.client && JSON.parse(localStorage.getItem('active_tenant_store') || '{}')?.phone) || 
         '';
});

const windowPrint = () => {
  if (process.client) {
    window.print();
  }
};
</script>
