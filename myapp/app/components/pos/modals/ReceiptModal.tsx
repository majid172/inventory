'use client';
import { useCart } from '../../../context/CartContext';
import { ModalOverlay } from './ModalOverlay';
import { Printer, Mail, CheckCircle2 } from 'lucide-react';
import styles from './Modals.module.css';

export function ReceiptModal() {
  const { isReceiptModalOpen, setReceiptModalOpen, clearCart } = useCart();
  
  if (!isReceiptModalOpen) return null;

  const handleClose = () => {
    setReceiptModalOpen(false);
    clearCart(); // Clear the cart for the next customer
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto', marginBottom: '16px' }} />
        <h2 style={{ color: 'var(--foreground)', marginBottom: '8px' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Order #0492 has been processed.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleClose}>
            <Printer size={18} /> Print Receipt
          </button>
          <button className={styles.btnCancel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleClose}>
            <Mail size={18} /> Email Receipt
          </button>
          <button 
            style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} 
            onClick={handleClose}
          >
            New Order &gt;
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
