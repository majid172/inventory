import { defineStore } from 'pinia';
import axios from 'axios';
import { useProductStore, type ProductItem } from './products';

export interface CartItem {
  cartId: string;
  product: ProductItem;
  quantity: number;
  dosageInstructions: string;
  notes: string;
  unitPrice: number;
  itemTotal: number;
}

export interface HeldOrder {
  id: string;
  heldAt: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  prescriptionRef: string;
  orderType: 'OTC Dispense' | 'Prescription (Rx)' | 'Home Delivery';
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface CompletedReceipt {
  orderId: string;
  date: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  prescriptionRef: string;
  rxVerified: boolean;
  orderType: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE' | 'INSURANCE';
  amountPaid: number;
  changeGiven: number;
  pharmacistLicense: string;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [] as CartItem[],
    patientName: 'Walk-in Patient',
    patientPhone: '',
    doctorName: '',
    prescriptionRef: '',
    rxVerified: false,
    orderType: 'OTC Dispense' as 'OTC Dispense' | 'Prescription (Rx)' | 'Home Delivery',
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
      // Medicines may have zero or specific medical tax rate
      return this.subtotal * 0.00;
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
    },

    hasRxItems: (state) => {
      return state.cartItems.some(i => i.product.rxRequired);
    }
  },

  actions: {
    addToCart(product: ProductItem) {
      const maxStock = product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity : 100;
      
      if (maxStock <= 0) {
        alert(`Cannot add '${product.name}': Item is currently OUT OF STOCK!`);
        return;
      }

      const existingIndex = this.cartItems.findIndex(item => 
        item.product.id === product.id
      );

      if (existingIndex > -1) {
        const currentQty = this.cartItems[existingIndex].quantity;
        if (currentQty + 1 > maxStock) {
          alert(`Cannot order over available stock! Only ${maxStock} units available in stock for '${product.name}'.`);
          return;
        }
        this.cartItems[existingIndex].quantity += 1;
        this.cartItems[existingIndex].itemTotal = this.cartItems[existingIndex].quantity * this.cartItems[existingIndex].unitPrice;
      } else {
        const defaultDosage = product.dosageForm === 'Tablet' || product.dosageForm === 'Capsule'
          ? 'Take 1 tablet/capsule twice daily after meals'
          : product.dosageForm === 'Syrup'
          ? 'Take 10ml 3 times daily after food'
          : product.dosageForm === 'Inhaler'
          ? '2 puffs as needed for shortness of breath'
          : 'Use as directed by physician';

        const newItem: CartItem = {
          cartId: `MED_CART_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          product,
          quantity: 1,
          dosageInstructions: defaultDosage,
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

      const maxStock = item.product.stockQuantity !== undefined && item.product.stockQuantity !== null ? item.product.stockQuantity : 100;

      if (delta > 0 && item.quantity + delta > maxStock) {
        alert(`Cannot order over available stock! Maximum stock limit is ${maxStock} units for '${item.product.name}'.`);
        return;
      }

      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(cartId);
      } else {
        item.itemTotal = item.quantity * item.unitPrice;
      }
    },

    setQuantity(cartId: string, newQty: number | string) {
      const item = this.cartItems.find(i => i.cartId === cartId);
      if (!item) return;

      const maxStock = item.product.stockQuantity !== undefined && item.product.stockQuantity !== null ? item.product.stockQuantity : 100;
      let parsed = parseInt(String(newQty), 10);

      if (isNaN(parsed) || parsed < 1) {
        parsed = 1;
      }

      if (parsed > maxStock) {
        alert(`Cannot order over available stock! Maximum stock limit is ${maxStock} units for '${item.product.name}'.`);
        parsed = maxStock;
      }

      item.quantity = parsed;
      item.itemTotal = item.quantity * item.unitPrice;
    },

    updateDosage(cartId: string, dosage: string) {
      const item = this.cartItems.find(i => i.cartId === cartId);
      if (item) {
        item.dosageInstructions = dosage;
      }
    },

    removeFromCart(cartId: string) {
      this.cartItems = this.cartItems.filter(i => i.cartId !== cartId);
    },

    clearCart() {
      this.cartItems = [];
      this.discountPercentage = 0;
      this.discountAmount = 0;
      this.patientName = 'Walk-in Patient';
      this.patientPhone = '';
      this.doctorName = '';
      this.prescriptionRef = '';
      this.rxVerified = false;
    },

    holdOrder() {
      if (this.cartItems.length === 0) return;
      const newHeld: HeldOrder = {
        id: `HOLD_${Date.now().toString().slice(-4)}`,
        heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientName: this.patientName,
        patientPhone: this.patientPhone,
        doctorName: this.doctorName,
        prescriptionRef: this.prescriptionRef,
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
      this.patientName = target.patientName;
      this.patientPhone = target.patientPhone || '';
      this.doctorName = target.doctorName || '';
      this.prescriptionRef = target.prescriptionRef || '';
      this.orderType = target.orderType;
      
      this.heldOrders.splice(orderIndex, 1);
      this.showHeldOrdersModal = false;
    },

    async completePayment(
      paymentMethod: 'CASH' | 'CARD' | 'MOBILE' | 'INSURANCE', 
      amountPaid: number, 
      transactionNo?: string, 
      customMethodLabel?: string
    ) {
      let orderId = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
      const changeGiven = amountPaid - this.total > 0 ? amountPaid - this.total : 0;
      const currentItems = JSON.parse(JSON.stringify(this.cartItems));
      const subtotalVal = this.subtotal;
      const discountVal = this.computedDiscount;
      const taxVal = this.tax;
      const totalVal = this.total;
      const patientNameVal = this.patientName || 'Walk-in Patient';
      const patientPhoneVal = this.patientPhone || '';
      const doctorNameVal = this.doctorName || 'N/A (OTC)';
      const prescriptionRefVal = this.prescriptionRef || 'OTC-DIRECT';
      const finalMethodName = customMethodLabel || paymentMethod;

      // Instantly deduct stock in product store without needing reload
      try {
        const productStore = useProductStore();
        productStore.deductProductStock(
          currentItems.map((item: any) => ({
            id: item.product.id,
            quantity: item.quantity
          }))
        );
      } catch (e) {}

      // Send to backend API
      try {
        const payload = {
          customer_phone: patientPhoneVal || 'Walk-in Patient',
          subtotal: subtotalVal,
          discount: discountVal,
          tax: taxVal,
          total: totalVal,
          paid_amount: amountPaid,
          due_amount: 0,
          payment_method: finalMethodName.toLowerCase(),
          transaction_no: transactionNo || null,
          notes: null,
          items: currentItems.map((item: any) => ({
            product_id: item.product.id,
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: 0
          }))
        };

        const res = await axios.post('/sales', payload);
        if (res.data && res.data.invoice_no) {
          orderId = res.data.invoice_no;
        } else if (res.data && res.data.sale && res.data.sale.invoice_no) {
          orderId = res.data.sale.invoice_no;
        }

        // Re-fetch products from backend to ensure batch inventory counts match MySQL
        try {
          const productStore = useProductStore();
          productStore.fetchProducts();
        } catch (e) {}
      } catch (err) {
        console.warn('POS backend sale sync fallback:', err);
      }

      this.completedReceipt = {
        orderId,
        date: new Date().toLocaleString(),
        patientName: patientNameVal,
        patientPhone: patientPhoneVal,
        doctorName: doctorNameVal,
        prescriptionRef: prescriptionRefVal,
        rxVerified: this.rxVerified || !this.hasRxItems,
        orderType: this.orderType,
        items: currentItems,
        subtotal: subtotalVal,
        discount: discountVal,
        tax: taxVal,
        total: totalVal,
        paymentMethod: finalMethodName,
        transactionNo: transactionNo || '',
        amountPaid,
        changeGiven,
        pharmacistLicense: 'PH-884920-REG'
      };

      this.clearCart();
      this.showPaymentModal = false;
      this.showReceiptModal = true;
    }
  }
});
