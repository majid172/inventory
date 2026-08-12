<template>
  <div v-if="showReceiptModal && completedReceipt" class="modal-backdrop select-none">
    <div class="modal-content max-w-md bg-slate-900 border-slate-700 text-slate-100">
      <!-- Printable Receipt Area -->
      <div class="bg-white text-slate-900 p-6 rounded-xl font-mono text-xs shadow-2xl mb-4">
        <!-- Header -->
        <div class="text-center mb-4 border-b border-dashed border-slate-300 pb-3">
          <h2 class="text-base font-black tracking-wider">COFFEE INVENTORY POS</h2>
          <p class="text-[10px] text-slate-500">123 Espresso Blvd, Suite 100</p>
          <p class="text-[10px] text-slate-500">Tel: +1 (555) 019-2831</p>
          <div class="mt-2 text-[10px] text-slate-600">
            <div>ORDER: <strong>{{ completedReceipt.orderId }}</strong></div>
            <div>DATE: {{ completedReceipt.date }}</div>
            <div>TYPE: {{ completedReceipt.orderType }}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="w-full mb-3">
          <thead>
            <tr class="border-b border-slate-300 text-left text-[10px] text-slate-500">
              <th class="pb-1">QTY ITEM</th>
              <th class="pb-1 text-right">PRICE</th>
              <th class="pb-1 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in completedReceipt.items" :key="item.cartId" class="border-b border-slate-100">
              <td class="py-1">
                {{ item.quantity }}x {{ item.product.name }}
                <div class="text-[9px] text-slate-500" v-if="item.selectedSize !== 'Medium'">Size: {{ item.selectedSize }}</div>
              </td>
              <td class="py-1 text-right">${{ item.unitPrice.toFixed(2) }}</td>
              <td class="py-1 text-right font-bold">${{ item.itemTotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div class="border-t border-dashed border-slate-300 pt-2 space-y-1">
          <div class="flex justify-between">
            <span>SUBTOTAL</span>
            <span>${{ completedReceipt.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between" v-if="completedReceipt.discount > 0">
            <span>DISCOUNT</span>
            <span>-${{ completedReceipt.discount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>TAX (8%)</span>
            <span>${{ completedReceipt.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between font-black text-sm border-t border-slate-900 pt-1 mt-1">
            <span>TOTAL PAID</span>
            <span>${{ completedReceipt.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Payment Method Details -->
        <div class="mt-3 bg-slate-100 p-2 rounded text-[10px] space-y-1">
          <div class="flex justify-between">
            <span>METHOD:</span>
            <span class="font-bold">{{ completedReceipt.paymentMethod }}</span>
          </div>
          <div class="flex justify-between" v-if="completedReceipt.paymentMethod === 'CASH'">
            <span>TENDERED:</span>
            <span>${{ completedReceipt.amountPaid.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between" v-if="completedReceipt.paymentMethod === 'CASH'">
            <span>CHANGE:</span>
            <span class="font-bold">${{ completedReceipt.changeGiven.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Barcode Graphic Placeholder -->
        <div class="mt-4 text-center">
          <div class="inline-block bg-slate-900 text-white px-6 py-1 tracking-widest text-[10px]">
            *{{ completedReceipt.orderId }}*
          </div>
          <p class="text-[9px] text-slate-400 mt-1">Thank you for visiting! Have a great day.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button 
          @click="windowPrint" 
          class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
        >
          🖨️ Print Receipt
        </button>
        <button 
          @click="showReceiptModal = false" 
          class="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs"
        >
          NEW SALE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart';

const { showReceiptModal, completedReceipt } = useCart();

const windowPrint = () => {
  if (process.client) {
    window.print();
  }
};
</script>
