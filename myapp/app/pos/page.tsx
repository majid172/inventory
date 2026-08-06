'use client';
import { useState } from 'react';
import POSLayout from '../components/pos/POSLayout';
import ProductGrid from '../components/pos/ProductGrid';
import CartRegister from '../components/pos/CartRegister';

export default function POSScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <POSLayout 
      cartArea={<CartRegister />}
      searchTerm={searchTerm}
      onSearch={setSearchTerm}
    >
      <ProductGrid searchTerm={searchTerm} />
    </POSLayout>
  );
}
