import Link from 'next/link';
import { Package, LayoutDashboard, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Inventory', icon: Package, href: '/admin/inventory' },
    { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    { label: 'Suppliers', icon: Users, href: '/admin/suppliers' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Package size={28} />
        </div>
        <span className={styles.logoText}>Nexus<span className={styles.highlight}>POS</span></span>
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={styles.navItem}>
                <item.icon size={20} className={styles.icon} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <Link href="/" className={`${styles.navItem} ${styles.logout}`}>
          <LogOut size={20} className={styles.icon} />
          <span>Exit to Portal</span>
        </Link>
      </div>
    </aside>
  );
}
