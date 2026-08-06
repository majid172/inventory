'use client';
import { useCart } from '../../context/CartContext';
import styles from './CartRegister.module.css';
import { Trash2, UserPlus, CreditCard, PauseCircle, Tag, List } from 'lucide-react';

export default function CartRegister() {
  const { 
    items, removeItem, incrementQty, decrementQty, clearCart, 
    discount, holdCurrentOrder, heldOrders,
    setPaymentModalOpen, setDiscountModalOpen, setHeldOrdersModalOpen 
  } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.price + item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
    return sum + (itemTotal * item.qty);
  }, 0);
  
  let discountAmount = 0;
  if (discount) {
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
    } else {
      discountAmount = discount.value;
    }
  }
  
  const postDiscountSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = postDiscountSubtotal * 0.05; // 5% tax
  const total = postDiscountSubtotal + tax;

  return (
    <div className={styles.cartContainer}>
      {/* Header */}
      <div className={styles.cartHeader}>
        <h3>Current Order</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={styles.clearBtn} onClick={() => setHeldOrdersModalOpen(true)} title="Held Orders">
            <List size={16} />
            {heldOrders.length > 0 && <span className={styles.badge}>{heldOrders.length}</span>}
          </button>
          <button className={styles.clearBtn} onClick={holdCurrentOrder} title="Hold Order" disabled={items.length === 0}>
            <PauseCircle size={16} />
          </button>
          <button className={styles.clearBtn} onClick={clearCart} title="Clear Cart" disabled={items.length === 0}>
            <Trash2 size={16} />
          </button>
        </div>
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
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
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
                  <span className={styles.itemPrice}>
                    ${(item.price + item.modifiers.reduce((s, m) => s + m.price, 0)).toFixed(2)}
                  </span>
                </div>
                {item.modifiers.length > 0 && (
                  <div className={styles.modifiersList}>
                    {item.modifiers.map((mod, idx) => (
                      <span key={idx} className={styles.modifierText}>
                        + {mod.name} (${mod.price.toFixed(2)})
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div className={styles.qtyPill}>
                    <button className={styles.qtyBtn} onClick={() => decrementQty(item.id)}>-</button>
                    <span className={styles.qtyValue}>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => incrementQty(item.id)}>+</button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem' }}
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
          
          <div className={styles.totalRow} style={{ color: 'var(--accent)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => setDiscountModalOpen(true)}>
              <Tag size={12} /> 
              {discount ? `Discount (${discount.type === 'percentage' ? discount.value + '%' : '$' + discount.value})` : 'Add Discount'}
            </span>
            <span>{discountAmount > 0 ? `-$${discountAmount.toFixed(2)}` : '$0.00'}</span>
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
          <button className={styles.payNowBtn} disabled={items.length === 0} onClick={() => setPaymentModalOpen(true)}>
            <CreditCard size={14} />
            Pay Now
          </button>
          <div className={styles.secondaryPayments}>
            <button className={styles.secondaryBtn} disabled={items.length === 0} onClick={() => setPaymentModalOpen(true)}>Cash</button>
            <button className={styles.secondaryBtn} disabled={items.length === 0}>More</button>
          </div>
        </div>
      </div>
    </div>
  );
}
