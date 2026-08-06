'use client';
import { useState } from 'react';
import styles from './CartRegister.module.css';
import { Trash2, UserPlus, CreditCard } from 'lucide-react';

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
};

export default function CartRegister() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: 'Vanilla Latte', price: 4.50, qty: 1, emoji: '☕' },
    { id: 2, name: 'Butter Croissant', price: 3.75, qty: 1, emoji: '🥐' }
  ]);

  const incrementQty = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  };

  const decrementQty = (id: number) => {
    setItems(items.map(item => {
      if (item.id === id && item.qty > 1) {
        return { ...item, qty: item.qty - 1 };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  return (
    <div className={styles.cartContainer}>
      {/* Header */}
      <div className={styles.cartHeader}>
        <h3>Order #0492</h3>
        <button className={styles.clearBtn} onClick={clearCart} title="Clear Cart">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Customer Add */}
      <div className={styles.customerSection}>
        <button className={styles.addCustomerBtn}>
          <div className={styles.addCustomerLeft}>
            <UserPlus size={16} />
            <span>Add Customer</span>
          </div>
          <span className={styles.arrow}>&gt;</span>
        </button>
      </div>

      {/* Cart Items */}
      <div className={styles.cartItems}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
            Cart is empty
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className={styles.cartItemCard}>
              <div className={styles.itemImage}>
                <span className={styles.itemEmoji}>{item.emoji}</span>
              </div>
              <div className={styles.itemDetails}>
                <div className={styles.itemRow}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className={styles.qtyPill}>
                    <button className={styles.qtyBtn} onClick={() => decrementQty(item.id)}>-</button>
                    <span className={styles.qtyValue}>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => incrementQty(item.id)}>+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals & Payment */}
      <div className={styles.bottomSection}>
        <div className={styles.totalsList}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.grandTotalRow}>
          <span>Total</span>
          <span className={styles.grandTotalValue}>${total.toFixed(2)}</span>
        </div>

        <div className={styles.paymentButtons}>
          <button className={styles.payNowBtn} disabled={items.length === 0}>
            <CreditCard size={14} />
            Pay Now
          </button>
          <div className={styles.secondaryPayments}>
            <button className={styles.secondaryBtn} disabled={items.length === 0}>Cash</button>
            <button className={styles.secondaryBtn} disabled={items.length === 0}>More</button>
          </div>
        </div>
      </div>
    </div>
  );
}
