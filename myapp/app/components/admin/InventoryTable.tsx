import styles from './InventoryTable.module.css';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

export default function InventoryTable() {
  const inventory = [
    { id: 'ITM-001', name: 'Wireless Headphones', category: 'Electronics', stock: 145, status: 'In Stock', price: '$89.99' },
    { id: 'ITM-002', name: 'Mechanical Keyboard', category: 'Accessories', stock: 12, status: 'Low Stock', price: '$129.50' },
    { id: 'ITM-003', name: 'USB-C Hub', category: 'Electronics', stock: 0, status: 'Out of Stock', price: '$45.00' },
    { id: 'ITM-004', name: 'Ergonomic Mouse', category: 'Accessories', stock: 67, status: 'In Stock', price: '$59.99' },
    { id: 'ITM-005', name: 'Laptop Stand', category: 'Office', stock: 8, status: 'Low Stock', price: '$34.00' },
  ];

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'In Stock': return styles.statusInStock;
      case 'Low Stock': return styles.statusLowStock;
      case 'Out of Stock': return styles.statusOutStock;
      default: return '';
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <h3>Recent Inventory</h3>
        <button className={styles.addButton}>+ Add New Item</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className={styles.sku}>{item.id}</td>
                <td className={styles.name}>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.price}</td>
                <td>{item.stock}</td>
                <td>
                  <span className={`${styles.badge} ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn}><Edit size={16} /></button>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
