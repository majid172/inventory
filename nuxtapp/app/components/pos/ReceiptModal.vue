<template>
  <div v-if="showReceiptModal && completedReceipt" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
      <!-- Printable Pharmacy Receipt / Invoice Area -->
      <div class="bg-white text-gray-900 p-6 rounded-xl font-mono text-xs shadow-2xl space-y-3">
        <!-- Header -->
        <div class="text-center border-b border-dashed border-gray-300 pb-3">
          <div class="text-lg font-black tracking-wider text-emerald-900 flex items-center justify-center gap-1">
            <span>💊 PHARMA-CARE MEDICAL</span>
          </div>
          <p class="text-[10px] text-gray-600 font-sans">Licensed Community Pharmacy • Reg #PH-884920</p>
          <p class="text-[10px] text-gray-500">742 Medical Center Blvd, Suite 101</p>
          <p class="text-[10px] text-gray-500">Emergency Line: +1 (800) 555-PHARMA</p>
          
          <div class="mt-3 text-[10px] text-gray-700 bg-gray-50 p-2 rounded text-left space-y-0.5 border border-gray-200">
            <div>DISPENSE REF: <strong class="text-emerald-900">{{ completedReceipt.orderId }}</strong></div>
            <div>DATE & TIME: {{ completedReceipt.date }}</div>
            <div>DISPENSE TYPE: {{ completedReceipt.orderType }}</div>
            <div>PATIENT: <strong>{{ completedReceipt.patientName }}</strong></div>
            <div>PRESCRIBER: {{ completedReceipt.doctorName }}</div>
            <div>Rx REF #: {{ completedReceipt.prescriptionRef }}</div>
          </div>
        </div>

        <!-- Dispensed Items Table -->
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-300 text-[10px] text-gray-500 font-bold uppercase">
              <th class="pb-1">MEDICINE / DOSAGE</th>
              <th class="pb-1 text-center">QTY</th>
              <th class="pb-1 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in completedReceipt.items" :key="item.cartId">
              <td class="py-1.5">
                <div class="font-bold text-gray-900">{{ item.product.name }}</div>
                <div class="text-[9px] text-emerald-700">🧪 {{ item.product.genericName }} ({{ item.product.strength }})</div>
                <div class="text-[9px] text-gray-500">Lot: {{ item.product.batchNumber }} | Exp: {{ item.product.expiryDate }}</div>
                <div class="text-[9px] font-semibold text-gray-800 bg-amber-50 p-1 rounded mt-0.5 border border-amber-200">
                  📋 Direction: {{ item.dosageInstructions }}
                </div>
              </td>
              <td class="py-1.5 text-center font-bold font-mono">{{ item.quantity }}</td>
              <td class="py-1.5 text-right font-bold font-mono text-gray-900">${{ item.itemTotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div class="border-t border-dashed border-gray-300 pt-2 space-y-1 text-xs">
          <div class="flex justify-between text-gray-600">
            <span>SUBTOTAL</span>
            <span class="font-mono">${{ completedReceipt.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-emerald-700" v-if="completedReceipt.discount > 0">
            <span>DISCOUNT APPLIED</span>
            <span class="font-mono">-${{ completedReceipt.discount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between font-black text-sm border-t border-gray-900 pt-1 mt-1 text-gray-900">
            <span>TOTAL AMOUNT PAID</span>
            <span class="font-mono text-emerald-800">${{ completedReceipt.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Payment Method Details -->
        <div class="bg-gray-100 p-2 rounded text-[10px] space-y-1 border border-gray-200">
          <div class="flex justify-between">
            <span>PAYMENT METHOD:</span>
            <span class="font-bold">{{ completedReceipt.paymentMethod }}</span>
          </div>
          <div class="flex justify-between" v-if="completedReceipt.paymentMethod === 'CASH'">
            <span>TENDERED:</span>
            <span>${{ completedReceipt.amountPaid.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between" v-if="completedReceipt.paymentMethod === 'CASH'">
            <span>CHANGE RETURNED:</span>
            <span class="font-bold">${{ completedReceipt.changeGiven.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Pharmacist Signature Disclaimer -->
        <div class="pt-2 text-center border-t border-gray-200 space-y-1">
          <div class="text-[9px] text-gray-500 font-sans italic">
            "Dispensed by Registered Pharmacist • Check instructions before consumption"
          </div>
          <div class="text-[9px] font-bold text-gray-800 font-mono">
            Lic #: {{ completedReceipt.pharmacistLicense }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button 
          @click="windowPrint" 
          class="flex-1 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
        >
          🖨️ Print Prescription Invoice
        </button>
        <button 
          @click="showReceiptModal = false" 
          class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black py-2.5 rounded-xl text-xs"
        >
          NEW DISPENSE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';

const cartStore = useCartStore();
const { showReceiptModal, completedReceipt } = storeToRefs(cartStore);

const windowPrint = () => {
  if (process.client) {
    window.print();
  }
};
</script>
