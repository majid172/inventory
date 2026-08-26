<template>
  <div class="w-full lg:w-96 bg-white dark:bg-gray-950 border-t lg:border-t-0 lg:border-l border-slate-300 dark:border-gray-800 flex flex-col justify-between select-none h-auto lg:h-full shrink-0 font-sans">
    <!-- Header & Order Types (Sharp Desktop Window Style) -->
    <div class="p-2 border-b border-slate-300 dark:border-gray-800 space-y-2 bg-[#f0f3f6] dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wide">
          <span>🧾</span> POS CASH REGISTER
          <span class="text-[10px] bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-700 px-1.5 py-0.2 font-mono font-normal">
            {{ cartItems.length }} items
          </span>
        </div>
        <button 
          v-if="cartItems.length > 0"
          @click="clearCart" 
          class="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-normal cursor-pointer"
        >
          ✕ Clear
        </button>
      </div>

      <!-- Dispense Type Selector Tabs (Solid Green, No Gradients) -->
      <div class="grid grid-cols-3 gap-1 bg-slate-200/80 dark:bg-gray-950 p-0.5 border border-slate-300 dark:border-gray-800 text-[11px] font-normal">
        <button 
          v-for="type in (['OTC Dispense', 'Prescription (Rx)', 'Home Delivery'] as const)" 
          :key="type"
          @click="orderType = type"
          :class="[
            'py-1 px-1 transition-colors text-center truncate cursor-pointer',
            orderType === type 
              ? 'bg-[#107c41] text-white' 
              : 'text-slate-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
          ]"
        >
          {{ type === 'Prescription (Rx)' ? 'Rx Order' : type === 'OTC Dispense' ? 'OTC' : 'Delivery' }}
        </button>
      </div>

      <!-- Patient & Doctor Information -->
      <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 p-2 space-y-1.5 text-xs">
        <div class="flex items-center justify-between text-[10px] text-slate-600 dark:text-gray-400 font-normal uppercase tracking-wider">
          <span>Patient / Customer Details</span>
          <span v-if="hasRxItems" class="text-rose-700 bg-rose-50 border border-rose-300 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-900 px-1 py-0.2 font-normal">Rx Required</span>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <input 
            type="text" 
            v-model="patientName"
            placeholder="Patient Name [F2]" 
            class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-[#107c41] font-normal"
          />
          <input 
            type="text" 
            v-model="doctorName"
            placeholder="Doctor Name (Rx)" 
            class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-[#107c41] font-normal"
          />
        </div>
      </div>
    </div>

    <!-- Cart Items Scrollable List (Desktop 1px Gridlines) -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1.5">
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 dark:text-gray-500 text-xs py-12">
        <span class="text-2xl mb-1 opacity-50">💊</span>
        <p class="font-normal text-slate-700 dark:text-gray-300">Dispense register is empty</p>
        <p class="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 text-center">Click products from catalog to add to bill.</p>
      </div>

      <div 
        v-for="item in cartItems" 
        :key="item.cartId" 
        class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 p-2 space-y-1 text-xs"
      >
        <div class="flex items-start justify-between gap-1.5">
          <div>
            <div class="flex items-center gap-1">
              <span class="font-normal text-xs text-slate-900 dark:text-gray-100">{{ item.product.name }}</span>
              <span 
                v-if="item.product.rxRequired" 
                class="text-[9px] font-normal bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800 px-1"
              >
                Rx
              </span>
            </div>
            <div class="text-[10px] text-slate-500 dark:text-gray-400 font-mono">
              {{ item.product.genericName }} • {{ item.product.dosageForm || 'Tablet' }}
            </div>
            <div class="text-[10px] text-slate-400 font-mono">
              Lot: {{ item.product.batchNumber || '-' }} (Exp: {{ item.product.expiryDate || '-' }})
            </div>
          </div>
          <div class="text-xs font-normal font-mono text-slate-900 dark:text-gray-100">{{ settingsStore.currencySymbol }}{{ item.itemTotal.toFixed(2) }}</div>
        </div>

        <!-- Dosage Instructions Note Input -->
        <div class="bg-slate-50 dark:bg-gray-950 p-1 border border-slate-200 dark:border-gray-800">
          <input 
            type="text"
            v-model="item.dosageInstructions"
            placeholder="Dosage instruction (e.g. 1 tab after meals)"
            class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-1.5 py-0.5 text-[11px] text-slate-800 dark:text-gray-200 placeholder-slate-400 focus:outline-none focus:border-[#107c41]"
          />
        </div>

        <!-- Qty & Delete Controls -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 p-0.5">
            <button @click="updateQuantity(item.cartId, -1)" class="w-5 h-5 flex items-center justify-center font-normal text-xs bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700 cursor-pointer">-</button>
            <span class="w-6 text-center text-xs font-mono font-normal text-slate-800 dark:text-gray-100">{{ item.quantity }}</span>
            <button @click="updateQuantity(item.cartId, 1)" class="w-5 h-5 flex items-center justify-center font-normal text-xs bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700 cursor-pointer">+</button>
          </div>

          <button 
            @click="removeFromCart(item.cartId)" 
            class="text-[10px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-normal px-2 py-0.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 cursor-pointer"
          >
            ✕ Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Totals Summary & Actions (Sharp Desktop Finish) -->
    <div class="p-2.5 border-t border-slate-300 dark:border-gray-800 bg-[#f0f3f6] dark:bg-gray-900 space-y-1.5 text-xs">
      <div v-if="hasRxItems" class="bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300 p-1 text-[10px] font-normal flex items-center gap-1">
        <span>⚠️</span>
        <span>Prescription item detected. Please verify Rx.</span>
      </div>

      <div class="flex justify-between text-xs text-slate-600 dark:text-gray-400 font-normal">
        <span>Subtotal:</span>
        <span class="font-mono text-slate-800 dark:text-gray-200">{{ settingsStore.currencySymbol }}{{ subtotal.toFixed(2) }}</span>
      </div>

      <div v-if="computedDiscount > 0" class="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 font-normal">
        <span>Discount:</span>
        <span class="font-mono">-{{ settingsStore.currencySymbol }}{{ computedDiscount.toFixed(2) }}</span>
      </div>

      <!-- Desktop Total Box -->
      <div class="bg-slate-900 text-emerald-400 border border-slate-700 p-1.5 flex justify-between items-center">
        <span class="text-xs font-mono uppercase tracking-wider text-slate-300">TOTAL DUE:</span>
        <span class="text-lg font-mono font-normal tracking-tight">{{ settingsStore.currencySymbol }}{{ total.toFixed(2) }}</span>
      </div>

      <!-- Action Buttons Grid -->
      <div class="grid grid-cols-2 gap-1 pt-1">
        <button 
          @click="holdOrder" 
          :disabled="cartItems.length === 0"
          class="bg-white dark:bg-gray-800 hover:bg-slate-100 disabled:opacity-40 border border-slate-300 dark:border-gray-700 text-amber-700 dark:text-amber-400 font-normal py-1 text-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>⏸</span> Hold [F8]
        </button>

        <button 
          @click="showDiscountModal = true"
          :disabled="cartItems.length === 0"
          class="bg-white dark:bg-gray-800 hover:bg-slate-100 disabled:opacity-40 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal py-1 text-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🏷️</span> Discount
        </button>
      </div>

      <button 
        @click="showPaymentModal = true"
        :disabled="cartItems.length === 0"
        class="w-full bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-40 text-white font-normal py-2 text-xs border border-[#0e6b37] flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
      >
        <span>💊 PAY & DISPENSE (F4) — {{ settingsStore.currencySymbol }}{{ total.toFixed(2) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';
import { useSettingsStore } from '~/stores/settings';

const cartStore = useCartStore();
const settingsStore = useSettingsStore();

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
