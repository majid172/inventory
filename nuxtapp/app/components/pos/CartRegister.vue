<template>
  <div class="pos-cart-panel select-none">
    <!-- Header & Order Types -->
    <div class="cart-header">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-amber-500 font-bold text-lg">🛒 Order Register</span>
          <span class="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
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

      <!-- Order Type Tabs -->
      <div class="cart-order-types">
        <button 
          v-for="type in (['Dine In', 'Takeaway', 'Delivery'] as const)" 
          :key="type"
          @click="orderType = type"
          :class="['cart-order-type-btn', { active: orderType === type }]"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <!-- Cart Items Scrollable List -->
    <div class="cart-items-wrapper">
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center flex-1 text-slate-500 text-sm py-12">
        <span class="text-4xl mb-2 opacity-50">🛒</span>
        <p class="font-medium">Cart is currently empty.</p>
        <p class="text-xs text-slate-600 mt-1">Click products on the left to add items.</p>
      </div>

      <div 
        v-for="item in cartItems" 
        :key="item.cartId" 
        class="cart-item-card"
      >
        <div class="cart-item-header">
          <div>
            <div class="cart-item-title">{{ item.product.name }}</div>
            <div class="cart-item-details">
              <span>{{ item.selectedSize }}</span>
              <span v-if="item.modifiers.length > 0"> • {{ item.modifiers.join(', ') }}</span>
            </div>
          </div>
          <div class="cart-item-price">${{ item.itemTotal.toFixed(2) }}</div>
        </div>

        <div class="cart-item-controls">
          <div class="cart-qty-group">
            <button @click="updateQuantity(item.cartId, -1)" class="cart-qty-btn">-</button>
            <span class="cart-qty-val">{{ item.quantity }}</span>
            <button @click="updateQuantity(item.cartId, 1)" class="cart-qty-btn">+</button>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="removeFromCart(item.cartId)" 
              class="text-xs text-slate-400 hover:text-rose-400 p-1"
              title="Remove item"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Totals Summary & Actions -->
    <div class="cart-footer">
      <div class="summary-row">
        <span>Subtotal</span>
        <span class="font-mono">${{ subtotal.toFixed(2) }}</span>
      </div>
      <div class="summary-row">
        <span>Tax (8%)</span>
        <span class="font-mono">${{ tax.toFixed(2) }}</span>
      </div>
      <div v-if="computedDiscount > 0" class="summary-row text-amber-400 font-semibold">
        <span>Discount Applied</span>
        <span class="font-mono">-${{ computedDiscount.toFixed(2) }}</span>
      </div>

      <div class="summary-row total">
        <span>Total Payable</span>
        <span class="total-amount">${{ total.toFixed(2) }}</span>
      </div>

      <!-- Action Buttons Grid -->
      <div class="grid grid-cols-2 gap-2 mt-4">
        <button 
          @click="holdOrder" 
          :disabled="cartItems.length === 0"
          class="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-slate-200 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
        >
          <span>⏸</span> Park Order
        </button>

        <button 
          @click="showDiscountModal = true"
          :disabled="cartItems.length === 0"
          class="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-amber-400 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
        >
          <span>🏷️</span> Apply Discount
        </button>
      </div>

      <button 
        @click="showPaymentModal = true"
        :disabled="cartItems.length === 0"
        class="w-full mt-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-3.5 rounded-xl text-base tracking-wide transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
      >
        <span>💳 PAY NOW (${{ total.toFixed(2) }})</span>
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
  subtotal, 
  tax, 
  computedDiscount, 
  total, 
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
