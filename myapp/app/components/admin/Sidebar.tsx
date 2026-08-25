'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, FolderOpen,
  ArrowDownToLine, ArrowUpFromLine, Users, FileText,
  BarChart2, Settings, LogOut, Truck, CreditCard,
  MonitorSmartphone, Bell
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuthStore } from '../../store/authStore';

interface NavSection {
  title: string;
  items: { label: string; icon: React.ElementType; href: string; roles?: string[] }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const role = user?.role || 'CASHIER';

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ]
    },
    {
      title: 'POS & Sales',
      items: [
        { label: 'Point of Sale', icon: MonitorSmartphone, href: '/pos' },
        { label: 'Sales History',  icon: ShoppingCart,     href: '/admin/sales' },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { label: 'Medicines',    icon: Package,         href: '/admin/products',    roles: ['STORE_ADMIN','PHARMACIST'] },
        { label: 'Categories',   icon: FolderOpen,      href: '/admin/categories',  roles: ['STORE_ADMIN'] },
        { label: 'Stock In',     icon: ArrowDownToLine, href: '/admin/stock-in',    roles: ['STORE_ADMIN','PHARMACIST'] },
        { label: 'Stock Out',    icon: ArrowUpFromLine, href: '/admin/stock-out',   roles: ['STORE_ADMIN','PHARMACIST'] },
        { label: 'Expiry Batches', icon: Bell,          href: '/admin/batches' },
      ]
    },
    {
      title: 'Procurement',
      items: [
        { label: 'Suppliers',       icon: Truck,    href: '/admin/suppliers',       roles: ['STORE_ADMIN'] },
        { label: 'Purchase Orders', icon: FileText, href: '/admin/purchase-orders', roles: ['STORE_ADMIN'] },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Staff & Roles',  icon: Users,      href: '/admin/staff',        roles: ['STORE_ADMIN'] },
        { label: 'Reports',        icon: BarChart2,  href: '/admin/reports/sales' },
        { label: 'My Subscription',icon: CreditCard, href: '/admin/subscription', roles: ['STORE_ADMIN'] },
        { label: 'Settings',       icon: Settings,   href: '/admin/settings',     roles: ['STORE_ADMIN'] },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(role);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>💊</div>
        <div className={styles.logoTextContainer}>
          <span className={styles.logoText}>Pharma<strong>Care</strong></span>
          <span className={styles.logoSubtext}>{user?.storeName || 'Pharmacy POS'}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {navSections.map(section => {
          const visibleItems = section.items.filter(item => hasAccess(item.roles));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.title}</div>
              <ul>
                {visibleItems.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}>
                      <item.icon size={17} className={styles.icon} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {user?.name?.[0] || 'U'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.userRole}>{role.replace('_',' ')}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
