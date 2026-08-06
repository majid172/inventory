'use client';
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { ModalOverlay } from './ModalOverlay';
import { X, Percent, DollarSign } from 'lucide-react';
import styles from './Modals.module.css';

export function DiscountModal() {
  const { isDiscountModalOpen, setDiscountModalOpen, discount, setDiscount } = useCart();
  const [type, setType] = useState<'percentage' | 'fixed'>(discount?.type || 'percentage');
  const [value, setValue] = useState<string>(discount?.value.toString() || '');

  if (!isDiscountModalOpen) return null;

  const handleApply = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setDiscount(null);
    } else {
      setDiscount({ type, value: numValue });
    }
    setDiscountModalOpen(false);
  };

  const handleClear = () => {
    setDiscount(null);
    setDiscountModalOpen(false);
  };

  return (
    <ModalOverlay onClose={() => setDiscountModalOpen(false)}>
      <div className={styles.modalHeader}>
        <h2>Apply Discount</h2>
        <button className={styles.closeBtn} onClick={() => setDiscountModalOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button 
          className={`${styles.modifierBtn} ${type === 'percentage' ? styles.active : ''}`}
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}
          onClick={() => setType('percentage')}
        >
          <Percent size={16} /> Percentage %
        </button>
        <button 
          className={`${styles.modifierBtn} ${type === 'fixed' ? styles.active : ''}`}
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}
          onClick={() => setType('fixed')}
        >
          <DollarSign size={16} /> Fixed Amount $
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>
          Discount Value
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--muted)' }}>
            {type === 'fixed' ? '$' : '%'}
          </span>
          <input 
            type="number" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            style={{ 
              width: '100%', 
              padding: '10px 10px 10px 32px', 
              borderRadius: '6px', 
              border: '1px solid var(--card-border)',
              fontSize: '1.1rem'
            }}
          />
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.btnCancel} style={{ color: 'var(--danger)' }} onClick={handleClear}>Remove</button>
        <button className={styles.btnPrimary} onClick={handleApply}>Apply Discount</button>
      </div>
    </ModalOverlay>
  );
}
