'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type Modifier = {
  name: string;
  price: number;
};

export type CartItem = {
  id: string; // unique id per cart entry
  productId: number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  modifiers: Modifier[];
};

export type Discount = {
  type: 'percentage' | 'fixed';
  value: number;
} | null;

export type HeldOrder = {
  id: string;
  items: CartItem[];
  discount: Discount;
  time: Date;
  customerName?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  incrementQty: (id: string) => void;
  decrementQty: (id: string) => void;
  clearCart: () => void;
  
  discount: Discount;
  setDiscount: (discount: Discount) => void;
  
  heldOrders: HeldOrder[];
  holdCurrentOrder: () => void;
  resumeOrder: (id: string) => void;
  
  // Modals state
  isPaymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  isDiscountModalOpen: boolean;
  setDiscountModalOpen: (open: boolean) => void;
  isHeldOrdersModalOpen: boolean;
  setHeldOrdersModalOpen: (open: boolean) => void;
  isReceiptModalOpen: boolean;
  setReceiptModalOpen: (open: boolean) => void;
  
  selectedProductForModifiers: any | null;
  setSelectedProductForModifiers: (product: any | null) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<Discount>(null);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [isHeldOrdersModalOpen, setHeldOrdersModalOpen] = useState(false);
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  
  const [selectedProductForModifiers, setSelectedProductForModifiers] = useState<any | null>(null);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    // Check if identical item (same productId and exact same modifiers) exists to stack qty
    const existingIndex = items.findIndex(i => 
      i.productId === item.productId && 
      JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers)
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].qty += item.qty;
      setItems(newItems);
    } else {
      setItems([...items, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const incrementQty = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  };

  const decrementQty = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id && item.qty > 1) {
        return { ...item, qty: item.qty - 1 };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(null);
  };

  const holdCurrentOrder = () => {
    if (items.length === 0) return;
    
    const newOrder: HeldOrder = {
      id: Math.random().toString(36).substr(2, 9),
      items: [...items],
      discount: discount,
      time: new Date(),
    };
    
    setHeldOrders([...heldOrders, newOrder]);
    clearCart();
  };

  const resumeOrder = (id: string) => {
    const order = heldOrders.find(o => o.id === id);
    if (order) {
      setItems(order.items);
      setDiscount(order.discount);
      setHeldOrders(heldOrders.filter(o => o.id !== id));
      setHeldOrdersModalOpen(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, incrementQty, decrementQty, clearCart,
      discount, setDiscount,
      heldOrders, holdCurrentOrder, resumeOrder,
      isPaymentModalOpen, setPaymentModalOpen,
      isDiscountModalOpen, setDiscountModalOpen,
      isHeldOrdersModalOpen, setHeldOrdersModalOpen,
      isReceiptModalOpen, setReceiptModalOpen,
      selectedProductForModifiers, setSelectedProductForModifiers
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
