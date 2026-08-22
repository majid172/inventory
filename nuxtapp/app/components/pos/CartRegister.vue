<template>
  <div class="w-full lg:w-96 bg-white dark:bg-gray-950 border-t lg:border-t-0 lg:border-l border-slate-300 dark:border-gray-800 flex flex-col justify-between select-none h-auto lg:h-full transition-colors duration-200 shrink-0 shadow-lg">
    <!-- Header & Order Types -->
    <div class="p-2.5 border-b border-slate-300 dark:border-gray-800 space-y-2.5 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 font-black text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wide">
          <span>🧾</span> POS CASH REGISTER
          <span class="text-[10px] bg-slate-300 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-400 dark:border-gray-700 px-1.5 py-0.2 rounded font-mono">
            {{ cartItems.length }} items
          </span>
        </div>
        <button 
          v-if="cartItems.length > 0"
          @click="clearCart" 
          class="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold cursor-pointer"
        >
          ✕ Clear Register
        </button>
      </div>

      <!-- Dispense Type Selector Tabs -->
      <div class="grid grid-cols-3 gap-1 bg-slate-200/80 dark:bg-gray-950 p-0.5 rounded border border-slate-300 dark:border-gray-800 text-[11px] font-bold">
        <button 
          v-for="type in (['OTC Dispense', 'Prescription (Rx)', 'Home Delivery'] as const)" 
          :key="type"
          @click="orderType = type"
          :class="[
            'py-1 px-1 rounded transition-all text-center truncate cursor-pointer shadow-sm',
            orderType === type 
              ? 'bg-gradient-to-b from-sky-500 to-blue-600 text-white font-black border border-sky-400' 
              : 'text-slate-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
          ]"
        >
          {{ type === 'Prescription (Rx)' ? 'Rx Order' : type === 'OTC Dispense' ? 'OTC' : 'Delivery' }}
        </button>
      </div>

      <!-- Patient & Doctor Information -->
      <div class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 p-2 rounded space-y-1.5 text-xs">
        <div class="flex items-center justify-between text-[10px] text-slate-600 dark:text-gray-400 font-extrabold uppercase tracking-wider">
          <span>Patient / Customer Details</span>
          <span v-if="hasRxItems" class="text-rose-700 bg-rose-100 border border-rose-300 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-900 px-1 py-0.2 rounded font-bold">Rx Required</span>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <input 
            type="text" 
            v-model="patientName"
            placeholder="Patient Name [F2]" 
            class="bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 font-medium"
          />
          <input 
            type="text" 
            v-model="doctorName"
            placeholder="Doctor Name (Rx)" 
            class="bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>
    </div>

    <!-- Cart Items Scrollable List with 1px Gridlines -->
    <div class="flex-1 overflow-y-auto p-2 space-y-2">
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 dark:text-gray-500 text-xs py-12">
        <span class="text-3xl mb-2 opacity-40">💊</span>
        <p class="font-bold text-slate-700 dark:text-gray-300">Dispense cart is empty</p>
        <p class="text-[11px] text-slate-400 dark:text-gray-500 mt-1 text-center font-mono">Select items from the catalog to add to billing register.</p>
      </div>

      <div 
        v-for="item in cartItems" 
        :key="item.cartId" 
        class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded p-2 space-y-1.5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-1.5">
          <div>
            <div class="flex items-center gap-1">
              <span class="font-extrabold text-xs text-slate-900 dark:text-gray-100">{{ item.product.name }}</span>
              <span 
                v-if="item.product.rxRequired" 
                class="text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800 px-1 rounded"
              >
                Rx
              </span>
            </div>
            <div class="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
              🧪 {{ item.product.genericName }} • {{ item.product.strength }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 font-mono">
              Lot: {{ item.product.batchNumber }} (Exp: {{ item.product.expiryDate }})
            </div>
          </div>
          <div class="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">${{ item.itemTotal.toFixed(2) }}</div>
        </div>

        <!-- Dosage Instructions Note Input -->
        <div class="bg-slate-50 dark:bg-gray-950 p-1.5 rounded border border-slate-300 dark:border-gray-800 space-y-0.5">
          <div class="text-[10px] text-slate-600 dark:text-gray-400 font-bold">Dosage Note:</div>
          <input 
            type="text"
            v-model="item.dosageInstructions"
            placeholder="e.g. 1 tablet twice daily after meals"
            class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-0.5 text-[11px] text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Qty & Delete Controls -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded p-0.5">
            <button @click="updateQuantity(item.cartId, -1)" class="w-5 h-5 flex items-center justify-center font-bold text-xs bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700 rounded cursor-pointer">-</button>
            <span class="w-6 text-center text-xs font-mono font-bold text-slate-800 dark:text-gray-100">{{ item.quantity }}</span>
            <button @click="updateQuantity(item.cartId, 1)" class="w-5 h-5 flex items-center justify-center font-bold text-xs bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700 rounded cursor-pointer">+</button>
          </div>

          <button 
            @click="removeFromCart(item.cartId)" 
            class="text-[10px] text-rose-700 hover:text-rose-800 dark:text-rose-400 font-bold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 rounded border border-rose-300 dark:border-rose-900 cursor-pointer"
          >
            ✕ Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Totals Summary & Actions -->
    <div class="p-3 border-t border-slate-300 dark:border-gray-800 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 space-y-2">
      <!-- Rx Required Warning Notice -->
      <div v-if="hasRxItems" class="bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300 p-1.5 rounded text-[10px] font-bold flex items-center gap-1.5">
        <span>⚠️</span>
        <span>Cart contains prescription drugs. Verify doctor's Rx before checkout.</span>
      </div>

      <div class="flex justify-between text-xs text-slate-600 dark:text-gray-400 font-bold">
        <span>Subtotal</span>
        <span class="font-mono text-slate-800 dark:text-gray-200">${{ subtotal.toFixed(2) }}</span>
      </div>

      <div v-if="computedDiscount > 0" class="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
        <span>Discount</span>
        <span class="font-mono">-${{ computedDiscount.toFixed(2) }}</span>
      </div>

      <!-- LCD Digital Total Box -->
      <div class="bg-slate-900 text-emerald-400 border border-slate-700 p-2 rounded flex justify-between items-center shadow-inner">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">TOTAL DUE:</span>
        <span class="text-xl font-mono font-black tracking-tight">${{ total.toFixed(2) }}</span>
      </div>

      <!-- Action Buttons Grid -->
      <div class="grid grid-cols-2 gap-1.5 pt-1">
        <button 
          @click="holdOrder" 
          :disabled="cartItems.length === 0"
          class="bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 hover:bg-slate-100 disabled:opacity-40 border border-slate-300 dark:border-gray-700 text-amber-700 dark:text-amber-400 font-extrabold py-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
        >
          <span>⏸</span> Park Rx (F8)
        </button>

        <button 
          @click="showDiscountModal = true"
          :disabled="cartItems.length === 0"
          class="bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 hover:bg-slate-100 disabled:opacity-40 border border-slate-300 dark:border-gray-700 text-emerald-700 dark:text-emerald-400 font-extrabold py-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
        >
          <span>🏷️</span> Discount
        </button>
      </div>

      <button 
        @click="showPaymentModal = true"
        :disabled="cartItems.length === 0"
        class="w-full bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-40 text-white dark:text-gray-950 font-black py-2.5 rounded text-xs tracking-wider border border-emerald-600 shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer uppercase font-sans"
      >
        <span>💊 PAY & DISPENSE (F4) — ${{ total.toFixed(2) }}</span>
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
