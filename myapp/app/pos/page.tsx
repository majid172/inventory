'use client';
import { useState } from 'react';
import POSLayout from '../components/pos/POSLayout';
import ProductGrid from '../components/pos/ProductGrid';
import CartRegister from '../components/pos/CartRegister';

import { CartProvider } from '../context/CartContext';
import { ModifierModal } from '../components/pos/modals/ModifierModal';
import { DiscountModal } from '../components/pos/modals/DiscountModal';
import { PaymentModal } from '../components/pos/modals/PaymentModal';
import { ReceiptModal } from '../components/pos/modals/ReceiptModal';
import { HeldOrdersModal } from '../components/pos/modals/HeldOrdersModal';

export default function POSScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <CartProvider>
      <POSLayout 
        cartArea={<CartRegister />}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      >
        <ProductGrid searchTerm={searchTerm} />
      </POSLayout>
      
      {/* Global Modals */}
      <ModifierModal />
      <DiscountModal />
      <PaymentModal />
      <ReceiptModal />
      <HeldOrdersModal />
    </CartProvider>
  );
}
