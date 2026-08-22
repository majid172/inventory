<template>
  <div class="w-80 lg:w-96 bg-gray-950 border-l border-gray-800 flex flex-col justify-between select-none h-[calc(100vh-57px)]">
    <!-- Header & Order Types -->
    <div class="p-3 border-b border-gray-800 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 font-black text-base flex items-center gap-1.5">
            <span>🛒</span> Dispense Register
          </span>
          <span class="text-xs bg-gray-900 text-emerald-400 border border-gray-800 px-2 py-0.5 rounded-full font-mono font-bold">
            {{ cartItems.length }} items
          </span>
        </div>
        <button 
          v-if="cartItems.length > 0"
          @click="clearCart" 
          class="text-xs text-rose-400 hover:text-rose-300 font-semibold"
        >
          Clear All
        </button>
      </div>

      <!-- Dispense Type Selector -->
      <div class="grid grid-cols-3 gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-[11px] font-bold">
        <button 
          v-for="type in (['OTC Dispense', 'Prescription (Rx)', 'Home Delivery'] as const)" 
          :key="type"
          @click="orderType = type"
          :class="[
            'py-1.5 px-1 rounded-lg transition-all text-center truncate',
            orderType === type 
              ? 'bg-emerald-500 text-gray-950 shadow-md font-black' 
              : 'text-gray-400 hover:text-gray-200'
          ]"
        >
          {{ type === 'Prescription (Rx)' ? 'Rx Order' : type === 'OTC Dispense' ? 'OTC' : 'Delivery' }}
        </button>
      </div>

      <!-- Patient & Doctor Information (Required / Optional for Rx) -->
      <div class="bg-gray-900/90 border border-gray-800/80 p-2.5 rounded-xl space-y-2 text-xs">
        <div class="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <span>Patient & Doctor Details</span>
          <span v-if="hasRxItems" class="text-rose-400 bg-rose-950/60 border border-rose-800 px-1.5 py-0.2 rounded">Rx Alert</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            v-model="patientName"
            placeholder="Patient Name" 
            class="bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-medium"
          />
          <input 
            type="text" 
            v-model="doctorName"
            placeholder="Dr. Name (Rx)" 
            class="bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>
    </div>

    <!-- Cart Items Scrollable List -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2.5">
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 text-xs py-12">
        <span class="text-4xl mb-2 opacity-40">💊</span>
        <p class="font-bold text-gray-400">Dispense cart is empty</p>
        <p class="text-[11px] text-gray-600 mt-1 text-center">Click medicines on the catalog grid to add to dispense cart.</p>
      </div>

      <div 
        v-for="item in cartItems" 
        :key="item.cartId" 
        class="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-xs text-gray-100">{{ item.product.name }}</span>
              <span 
                v-if="item.product.rxRequired" 
                class="text-[9px] font-black bg-rose-950 text-rose-400 border border-rose-800 px-1 rounded"
              >
                Rx
              </span>
            </div>
            <div class="text-[10px] text-emerald-400 font-mono mt-0.5">
              🧪 {{ item.product.genericName }} • {{ item.product.strength }}
            </div>
            <div class="text-[10px] text-gray-500 font-mono">
              Lot: {{ item.product.batchNumber }} (Exp: {{ item.product.expiryDate }})
            </div>
          </div>
          <div class="text-xs font-black font-mono text-emerald-400">${{ item.itemTotal.toFixed(2) }}</div>
        </div>

        <!-- Dosage Instructions Note Input -->
        <div class="bg-gray-950 p-2 rounded-lg border border-gray-800 space-y-1">
          <div class="text-[10px] text-gray-400 font-bold">Dosage Instruction:</div>
          <input 
            type="text"
            v-model="item.dosageInstructions"
            placeholder="e.g. 1 tablet twice daily after meals"
            class="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <!-- Qty and Delete Controls -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-1 bg-gray-950 border border-gray-800 rounded-lg p-0.5">
            <button @click="updateQuantity(item.cartId, -1)" class="w-6 h-6 flex items-center justify-center font-bold text-xs text-gray-300 hover:bg-gray-800 rounded">-</button>
            <span class="w-6 text-center text-xs font-mono font-bold text-gray-100">{{ item.quantity }}</span>
            <button @click="updateQuantity(item.cartId, 1)" class="w-6 h-6 flex items-center justify-center font-bold text-xs text-gray-300 hover:bg-gray-800 rounded">+</button>
          </div>

          <button 
            @click="removeFromCart(item.cartId)" 
            class="text-[11px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-950/40 rounded-lg border border-rose-900/40"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Totals Summary & Actions -->
    <div class="p-3 border-t border-gray-800 bg-gray-950 space-y-2">
      <!-- Rx Required Warning Notice -->
      <div v-if="hasRxItems" class="bg-rose-950/60 border border-rose-800 p-2 rounded-xl text-[11px] text-rose-300 flex items-center gap-2">
        <span class="text-base">⚠️</span>
        <span>Cart contains prescription medicines. Verify doctor's Rx before dispensing.</span>
      </div>

      <div class="flex justify-between text-xs text-gray-400 font-medium">
        <span>Subtotal</span>
        <span class="font-mono text-gray-200">${{ subtotal.toFixed(2) }}</span>
      </div>

      <div v-if="computedDiscount > 0" class="flex justify-between text-xs text-emerald-400 font-medium">
        <span>Discount</span>
        <span class="font-mono">-${{ computedDiscount.toFixed(2) }}</span>
      </div>

      <div class="flex justify-between items-center text-sm font-bold border-t border-gray-800/80 pt-2 text-gray-100">
        <span>Total Payable</span>
        <span class="text-lg font-mono font-black text-emerald-400">${{ total.toFixed(2) }}</span>
      </div>

      <!-- Action Buttons Grid -->
      <div class="grid grid-cols-2 gap-2 pt-1">
        <button 
          @click="holdOrder" 
          :disabled="cartItems.length === 0"
          class="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-800 text-gray-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
        >
          <span>⏸</span> Hold Rx
        </button>

        <button 
          @click="showDiscountModal = true"
          :disabled="cartItems.length === 0"
          class="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-800 text-emerald-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
        >
          <span>🏷️</span> Discount
        </button>
      </div>

      <button 
        @click="showPaymentModal = true"
        :disabled="cartItems.length === 0"
        class="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-black py-3 rounded-xl text-sm tracking-wider transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95"
      >
        <span>💊 DISPENSE (${{ total.toFixed(2) }})</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';

const cartStore = useCartStore();

const { 
  cartItems, 
  orderType, 
  patientName,
  doctorName,
  subtotal, 
  computedDiscount, 
  total, 
  hasRxItems,
  showPaymentModal,
  showDiscountModal
} = storeToRefs(cartStore);

const { 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  holdOrder 
} = cartStore;
</script>
