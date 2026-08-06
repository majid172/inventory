'use client';
import { useCart } from '../../../context/CartContext';
import { ModalOverlay } from './ModalOverlay';
import { X, Clock, Play } from 'lucide-react';
import styles from './Modals.module.css';

export function HeldOrdersModal() {
  const { isHeldOrdersModalOpen, setHeldOrdersModalOpen, heldOrders, resumeOrder } = useCart();
  
  if (!isHeldOrdersModalOpen) return null;

  return (
    <ModalOverlay onClose={() => setHeldOrdersModalOpen(false)}>
      <div className={styles.modalHeader}>
        <h2>Held Orders</h2>
        <button className={styles.closeBtn} onClick={() => setHeldOrdersModalOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px' }}>
        {heldOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '40px' }}>
            No orders are currently on hold.
          </div>
        ) : (
          heldOrders.map((order, idx) => (
            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>Order #{idx + 1}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Clock size={12} />
                  {order.time.toLocaleTimeString()} - {order.items.length} items
                </div>
              </div>
              <button 
                className={styles.btnPrimary} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                onClick={() => resumeOrder(order.id)}
              >
                <Play size={14} /> Resume
              </button>
            </div>
          ))
        )}
      </div>
    </ModalOverlay>
  );
}
