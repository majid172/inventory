'use client';
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { ModalOverlay } from './ModalOverlay';
import { X, DollarSign, CreditCard } from 'lucide-react';
import styles from './Modals.module.css';

export function PaymentModal() {
  const { 
    isPaymentModalOpen, setPaymentModalOpen, 
    items, discount, setReceiptModalOpen 
  } = useCart();
  
  const [tenderedAmount, setTenderedAmount] = useState<string>('');
  
  if (!isPaymentModalOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + ((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.qty), 0);
  let discountAmount = 0;
  if (discount) {
    discountAmount = discount.type === 'percentage' ? subtotal * (discount.value / 100) : discount.value;
  }
  const tax = Math.max(0, subtotal - discountAmount) * 0.05;
  const total = Math.max(0, subtotal - discountAmount) + tax;

  const handleQuickPay = (amount: number) => {
    setTenderedAmount(amount.toFixed(2));
  };

  const processPayment = () => {
    // In a real app, this would process the transaction
    setPaymentModalOpen(false);
    setReceiptModalOpen(true);
  };

  const numTendered = parseFloat(tenderedAmount) || 0;
  const change = Math.max(0, numTendered - total);
  const remaining = Math.max(0, total - numTendered);

  return (
    <ModalOverlay onClose={() => setPaymentModalOpen(false)}>
      <div className={styles.modalHeader}>
        <h2>Complete Payment</h2>
        <button className={styles.closeBtn} onClick={() => setPaymentModalOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className={styles.amountDue}>
        ${total.toFixed(2)}
        <div style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 'normal' }}>Amount Due</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>
          Tendered Amount
        </label>
        <input 
          type="number" 
          value={tenderedAmount}
          onChange={(e) => setTenderedAmount(e.target.value)}
          placeholder={total.toFixed(2)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid var(--card-border)',
            fontSize: '1.25rem',
            textAlign: 'right'
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {[total, 10, 20, 50, 100].map(amt => (
            <button 
              key={amt} 
              onClick={() => handleQuickPay(amt)}
              style={{ flex: 1, padding: '8px', background: '#f1f5f9', border: '1px solid var(--card-border)', borderRadius: '4px', cursor: 'pointer' }}
            >
              ${amt.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Remaining</div>
          <div style={{ fontWeight: 'bold', color: 'var(--danger)' }}>${remaining.toFixed(2)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Change</div>
          <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>${change.toFixed(2)}</div>
        </div>
      </div>

      <div className={styles.paymentMethods}>
        <button className={styles.btnPrimary} style={{ background: '#388E3C', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={processPayment}>
          <DollarSign size={18} /> Cash
        </button>
        <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={processPayment}>
          <CreditCard size={18} /> Credit Card
        </button>
      </div>
    </ModalOverlay>
  );
}
