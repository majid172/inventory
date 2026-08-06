'use client';
import { useState } from 'react';
import { useCart, Modifier } from '../../../context/CartContext';
import { ModalOverlay } from './ModalOverlay';
import { X } from 'lucide-react';
import styles from './Modals.module.css';

const AVAILABLE_MODIFIERS = [
  { name: 'Oat Milk', price: 0.50 },
  { name: 'Almond Milk', price: 0.50 },
  { name: 'Extra Shot', price: 1.00 },
  { name: 'Vanilla Syrup', price: 0.25 },
  { name: 'No Sugar', price: 0.00 },
];

export function ModifierModal() {
  const { selectedProductForModifiers, setSelectedProductForModifiers, addItem } = useCart();
  const [selectedMods, setSelectedMods] = useState<Modifier[]>([]);

  if (!selectedProductForModifiers) return null;

  const toggleMod = (mod: Modifier) => {
    if (selectedMods.find(m => m.name === mod.name)) {
      setSelectedMods(selectedMods.filter(m => m.name !== mod.name));
    } else {
      setSelectedMods([...selectedMods, mod]);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: selectedProductForModifiers.id,
      name: selectedProductForModifiers.name,
      price: selectedProductForModifiers.price,
      qty: 1,
      emoji: selectedProductForModifiers.image,
      modifiers: selectedMods,
    });
    setSelectedProductForModifiers(null);
    setSelectedMods([]); // Reset for next time
  };

  return (
    <ModalOverlay onClose={() => setSelectedProductForModifiers(null)}>
      <div className={styles.modalHeader}>
        <h2>{selectedProductForModifiers.name}</h2>
        <button className={styles.closeBtn} onClick={() => setSelectedProductForModifiers(null)}>
          <X size={20} />
        </button>
      </div>

      <div className={styles.modifierSection}>
        <h4>Add Modifiers</h4>
        <div className={styles.modifierGrid}>
          {AVAILABLE_MODIFIERS.map(mod => {
            const isActive = selectedMods.some(m => m.name === mod.name);
            return (
              <button 
                key={mod.name} 
                className={`${styles.modifierBtn} ${isActive ? styles.active : ''}`}
                onClick={() => toggleMod(mod)}
              >
                <span>{mod.name}</span>
                <span style={{ fontSize: '0.8rem', color: isActive ? 'var(--primary)' : 'var(--muted)' }}>
                  {mod.price > 0 ? `+$${mod.price.toFixed(2)}` : 'Free'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.btnCancel} onClick={() => setSelectedProductForModifiers(null)}>Cancel</button>
        <button className={styles.btnPrimary} onClick={handleAddToCart}>
          Add to Cart - ${(selectedProductForModifiers.price + selectedMods.reduce((s, m) => s + m.price, 0)).toFixed(2)}
        </button>
      </div>
    </ModalOverlay>
  );
}
