'use client';
import { useState } from 'react';
import styles from './ProductGrid.module.css';
import { useCart } from '../../context/CartContext';

export default function ProductGrid({ searchTerm = '' }: { searchTerm?: string }) {
  const { setSelectedProductForModifiers } = useCart();
  const categories = ['ALL ITEMS', 'COFFEE', 'ESPRESSO', 'PASTRIES', 'MERCHANDISE', 'SEASONAL'];
  const [activeCategory, setActiveCategory] = useState('ALL ITEMS');

  const products = [
    { id: 1, name: 'Vanilla Latte', subtitle: 'Oat Milk, Extra Hot', price: 4.50, qty: 50, stock: 'IN', image: '☕', category: 'COFFEE' },
    { id: 2, name: 'Butter Croissant', subtitle: 'Freshly Baked', price: 3.75, qty: 15, stock: 'IN', image: '🥐', category: 'PASTRIES' },
    { id: 3, name: 'Americano', subtitle: 'Double Shot', price: 3.00, qty: 100, stock: 'IN', image: '☕', category: 'ESPRESSO' },
    { id: 4, name: 'Travel Tumbler', subtitle: 'Matte Black 16oz', price: 24.00, qty: 8, stock: 'LOW', image: '🥤', category: 'MERCHANDISE' },
    { id: 5, name: 'Iced Macchiato', subtitle: 'Caramel Drizzle', price: 5.25, qty: 40, stock: 'IN', image: '🧋', category: 'SEASONAL' },
    { id: 6, name: 'Blueberry Muffin', subtitle: 'Vegan', price: 3.50, qty: 12, stock: 'IN', image: '🧁', category: 'PASTRIES' },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'ALL ITEMS' || p.category === activeCategory;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchLower) || p.subtitle.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.container}>
      {/* Categories Bar */}
      <div className={styles.categoriesBar}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`${styles.categoryBtn} ${activeCategory === cat ? styles.activeCategory : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className={styles.grid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
          <div key={p.id} className={styles.card} onClick={() => setSelectedProductForModifiers(p)} style={{ cursor: 'pointer' }}>
            <div className={styles.imageBox}>
              <span className={styles.emoji}>{p.image}</span>
            </div>
            
            <div className={styles.details}>
              <div className={styles.headerRow}>
                <div className={styles.titleStack}>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.subtitle}>{p.subtitle}</span>
                </div>
                
                {p.stock === 'IN' ? (
                  <span className={styles.dotIn}></span>
                ) : (
                  <span className={styles.badgeLow}>LOW</span>
                )}
              </div>
              <div className={styles.bottomRow}>
                <span className={styles.qtyText}>{p.qty} in stock</span>
                <span className={styles.price}>${p.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))
        ) : (
          <div style={{ padding: '2rem', color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
            No products found matching "{searchTerm}" in {activeCategory}.
          </div>
        )}
      </div>
    </div>
  );
}
