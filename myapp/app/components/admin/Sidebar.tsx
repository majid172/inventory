'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt,
  Package, 
  List, 
  Box, 
  FolderOpen,
  ArrowRightLeft, 
  TrendingDown,
  Trash2,
  Users, 
  FileText,
  BookOpen,
  Bell,
  BarChart2,
  Settings 
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Sales History', icon: Receipt, href: '/admin/orders' },
    { label: 'Inventory', icon: Package, href: '/admin/inventory' },
    { label: 'Ingredients', icon: List, href: '/admin/ingredients' },
    { label: 'Products', icon: Box, href: '/admin/products' },
    { label: 'Categories', icon: FolderOpen, href: '/admin/categories' },
    { label: 'Stock In', icon: ArrowRightLeft, href: '/admin/stock-in' },
    { label: 'Stock Out', icon: TrendingDown, href: '/admin/stock-out' },
    { label: 'Wastage', icon: Trash2, href: '/admin/wastage' },
    { label: 'Suppliers', icon: Users, href: '/admin/suppliers' },
    { label: 'Purchase Orders', icon: FileText, href: '/admin/purchase-orders' },
    { label: 'Recipes', icon: BookOpen, href: '/admin/recipes' },
    { label: 'Alerts', icon: Bell, href: '/admin/alerts' },
    { label: 'Reports', icon: BarChart2, href: '/admin/reports' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoImage}>
          <img src="https://ui-avatars.com/api/?name=AB&background=f3f2ef&color=333" alt="Logo" />
        </div>
        <div className={styles.logoTextContainer}>
          <span className={styles.logoText}>Artisanal Brew</span>
          <span className={styles.logoSubtext}>Management</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin');
            return (
              <li key={item.label}>
                <Link href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                  <item.icon size={18} className={styles.icon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" 
            alt="Sarah Jenkins" 
            className={styles.userAvatar} 
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>Sarah Jenkins</span>
            <span className={styles.userRole}>Store Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
