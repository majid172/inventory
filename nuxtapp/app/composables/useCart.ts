import { ref, computed } from 'vue';
import type { POSProduct } from './usePOSProducts';

export interface CartItem {
  cartId: string;
  product: POSProduct;
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

// Global reactive states
const cartItems = ref<CartItem[]>([]);
const customerName = ref<string>('Walk-in Customer');
const orderType = ref<'Dine In' | 'Takeaway' | 'Delivery'>('Dine In');
const discountPercentage = ref<number>(0);
const discountAmount = ref<number>(0);
const heldOrders = ref<HeldOrder[]>([]);

// Active Modals
const showPaymentModal = ref<boolean>(false);
const showReceiptModal = ref<boolean>(false);
const showHeldOrdersModal = ref<boolean>(false);
const showModifierModal = ref<boolean>(false);
const showDiscountModal = ref<boolean>(false);

const activeEditingItem = ref<CartItem | null>(null);
const completedReceipt = ref<CompletedReceipt | null>(null);

export function useCart() {
  const addToCart = (product: POSProduct) => {
    const existingIndex = cartItems.value.findIndex(item => 
      item.product.id === product.id && 
      item.selectedSize === 'Medium' && 
      item.modifiers.length === 0
    );

    if (existingIndex > -1) {
      cartItems.value[existingIndex].quantity += 1;
      cartItems.value[existingIndex].itemTotal = cartItems.value[existingIndex].quantity * cartItems.value[existingIndex].unitPrice;
    } else {
      const newItem: CartItem = {
        cartId: `ITEM_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        product: product,
        quantity: 1,
        selectedSize: 'Medium',
        modifiers: [],
        notes: '',
        unitPrice: product.price,
        itemTotal: product.price
      };
      cartItems.value.push(newItem);
    }
  };

  const updateQuantity = (cartId: string, delta: number) => {
    const item = cartItems.value.find(i => i.cartId === cartId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(cartId);
    } else {
      item.itemTotal = item.quantity * item.unitPrice;
    }
  };

  const removeFromCart = (cartId: string) => {
    cartItems.value = cartItems.value.filter(i => i.cartId !== cartId);
  };

  const clearCart = () => {
    cartItems.value = [];
    discountPercentage.value = 0;
    discountAmount.value = 0;
    customerName.value = 'Walk-in Customer';
  };

  // Calculations
  const subtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.itemTotal, 0);
  });

  const tax = computed(() => {
    return subtotal.value * 0.08; // 8% default sales tax
  });

  const computedDiscount = computed(() => {
    if (discountPercentage.value > 0) {
      return (subtotal.value * discountPercentage.value) / 100;
    }
    return discountAmount.value;
  });

  const total = computed(() => {
    const finalTotal = subtotal.value + tax.value - computedDiscount.value;
    return finalTotal > 0 ? finalTotal : 0;
  });

  // Order Holding / Parking
  const holdOrder = () => {
    if (cartItems.value.length === 0) return;
    const newHeld: HeldOrder = {
      id: `HOLD_${Date.now().toString().slice(-4)}`,
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName.value,
      orderType: orderType.value,
      items: JSON.parse(JSON.stringify(cartItems.value)),
      subtotal: subtotal.value,
      total: total.value
    };
    heldOrders.value.push(newHeld);
    clearCart();
  };

  const restoreHeldOrder = (holdId: string) => {
    const orderIndex = heldOrders.value.findIndex(h => h.id === holdId);
    if (orderIndex === -1) return;
    
    const target = heldOrders.value[orderIndex];
    cartItems.value = JSON.parse(JSON.stringify(target.items));
    customerName.value = target.customerName;
    orderType.value = target.orderType;
    
    heldOrders.value.splice(orderIndex, 1);
    showHeldOrdersModal.value = false;
  };

  // Complete Checkout
  const completePayment = (paymentMethod: 'CASH' | 'CARD' | 'MOBILE', amountPaid: number) => {
    const orderId = `ORD_${1000 + Math.floor(Math.random() * 9000)}`;
    const changeGiven = amountPaid - total.value > 0 ? amountPaid - total.value : 0;

    completedReceipt.value = {
      orderId,
      date: new Date().toLocaleString(),
      customerName: customerName.value,
      orderType: orderType.value,
      items: JSON.parse(JSON.stringify(cartItems.value)),
      subtotal: subtotal.value,
      discount: computedDiscount.value,
      tax: tax.value,
      total: total.value,
      paymentMethod,
      amountPaid,
      changeGiven
    };

    clearCart();
    showPaymentModal.value = false;
    showReceiptModal.value = true;
  };

  return {
    cartItems,
    customerName,
    orderType,
    discountPercentage,
    discountAmount,
    heldOrders,
    showPaymentModal,
    showReceiptModal,
    showHeldOrdersModal,
    showModifierModal,
    showDiscountModal,
    activeEditingItem,
    completedReceipt,
    subtotal,
    tax,
    computedDiscount,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    holdOrder,
    restoreHeldOrder,
    completePayment
  };
}
