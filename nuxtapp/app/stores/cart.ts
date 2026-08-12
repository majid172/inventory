import { defineStore } from 'pinia';
import type { ProductItem } from './products';

export interface CartItem {
  cartId: string;
  product: ProductItem;
  quantity: number;
  selectedSize: 'Small' | 'Medium' | 'Large';
  modifiers: string[];
  notes: string;
  unitPrice: number;
  itemTotal: number;
}

export interface HeldOrder {
  id: string;
  heldAt: string;
  customerName: string;
  orderType: 'Dine In' | 'Takeaway' | 'Delivery';
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface CompletedReceipt {
  orderId: string;
  date: string;
  customerName: string;
  orderType: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE';
  amountPaid: number;
  changeGiven: number;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [] as CartItem[],
    customerName: 'Walk-in Customer',
    orderType: 'Dine In' as 'Dine In' | 'Takeaway' | 'Delivery',
    discountPercentage: 0,
    discountAmount: 0,
    heldOrders: [] as HeldOrder[],

    // Active Modals
    showPaymentModal: false,
    showReceiptModal: false,
    showHeldOrdersModal: false,
    showModifierModal: false,
    showDiscountModal: false,

    activeEditingItem: null as CartItem | null,
    completedReceipt: null as CompletedReceipt | null
  }),

  getters: {
    subtotal: (state) => {
      return state.cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
    },

    tax(): number {
      return this.subtotal * 0.08; // 8% sales tax
    },

    computedDiscount(): number {
      if (this.discountPercentage > 0) {
        return (this.subtotal * this.discountPercentage) / 100;
      }
      return this.discountAmount;
    },

    total(): number {
      const finalTotal = this.subtotal + this.tax - this.computedDiscount;
      return finalTotal > 0 ? finalTotal : 0;
    }
  },

  actions: {
    addToCart(product: ProductItem) {
      const existingIndex = this.cartItems.findIndex(item => 
        item.product.id === product.id && 
        item.selectedSize === 'Medium' && 
        item.modifiers.length === 0
      );

      if (existingIndex > -1) {
        this.cartItems[existingIndex].quantity += 1;
        this.cartItems[existingIndex].itemTotal = this.cartItems[existingIndex].quantity * this.cartItems[existingIndex].unitPrice;
      } else {
        const newItem: CartItem = {
          cartId: `ITEM_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          product,
          quantity: 1,
          selectedSize: 'Medium',
          modifiers: [],
          notes: '',
          unitPrice: product.price,
          itemTotal: product.price
        };
        this.cartItems.push(newItem);
      }
    },

    updateQuantity(cartId: string, delta: number) {
      const item = this.cartItems.find(i => i.cartId === cartId);
      if (!item) return;

      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(cartId);
      } else {
        item.itemTotal = item.quantity * item.unitPrice;
      }
    },

    removeFromCart(cartId: string) {
      this.cartItems = this.cartItems.filter(i => i.cartId !== cartId);
    },

    clearCart() {
      this.cartItems = [];
      this.discountPercentage = 0;
      this.discountAmount = 0;
      this.customerName = 'Walk-in Customer';
    },

    holdOrder() {
      if (this.cartItems.length === 0) return;
      const newHeld: HeldOrder = {
        id: `HOLD_${Date.now().toString().slice(-4)}`,
        heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customerName: this.customerName,
        orderType: this.orderType,
        items: JSON.parse(JSON.stringify(this.cartItems)),
        subtotal: this.subtotal,
        total: this.total
      };
      this.heldOrders.push(newHeld);
      this.clearCart();
    },

    restoreHeldOrder(holdId: string) {
      const orderIndex = this.heldOrders.findIndex(h => h.id === holdId);
      if (orderIndex === -1) return;
      
      const target = this.heldOrders[orderIndex];
      this.cartItems = JSON.parse(JSON.stringify(target.items));
      this.customerName = target.customerName;
      this.orderType = target.orderType;
      
      this.heldOrders.splice(orderIndex, 1);
      this.showHeldOrdersModal = false;
    },

    completePayment(paymentMethod: 'CASH' | 'CARD' | 'MOBILE', amountPaid: number) {
      const orderId = `ORD_${1000 + Math.floor(Math.random() * 9000)}`;
      const changeGiven = amountPaid - this.total > 0 ? amountPaid - this.total : 0;

      this.completedReceipt = {
        orderId,
        date: new Date().toLocaleString(),
        customerName: this.customerName,
        orderType: this.orderType,
        items: JSON.parse(JSON.stringify(this.cartItems)),
        subtotal: this.subtotal,
        discount: this.computedDiscount,
        tax: this.tax,
        total: this.total,
        paymentMethod,
        amountPaid,
        changeGiven
      };

      this.clearCart();
      this.showPaymentModal = false;
      this.showReceiptModal = true;
    }
  }
});
