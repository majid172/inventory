'use client';
import { Search, Bell, HelpCircle, User, LayoutDashboard, Package, BarChart2, Users, Settings } from 'lucide-react';
import styles from './POSLayout.module.css';

export default function POSLayout({ 
  children, 
  cartArea,
  searchTerm,
  onSearch
}: { 
  children: React.ReactNode; 
  cartArea: React.ReactNode;
  searchTerm?: string;
  onSearch?: (value: string) => void;
}) {
  return (
    <div className={styles.posContainer}>

      {/* Left Thin Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarNav}>
          <div className={`${styles.navItem} ${styles.active}`}>
            <LayoutDashboard size={24} />
            <span>SALES</span>
          </div>
          <div className={styles.navItem}>
            <Package size={24} />
            <span>INVENTORY</span>
          </div>
          <div className={styles.navItem}>
            <BarChart2 size={24} />
            <span>REPORTS</span>
          </div>
          <div className={styles.navItem}>
            <Users size={24} />
            <span>CUSTOMERS</span>
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.navItem}>
            <Settings size={24} />
            <span>SETTINGS</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Right of Sidebar) */}
      <div className={styles.mainWrapper}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              BlackCoffee
            </div>
          </div>

          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search products (SKU, Name)..." 
              className={styles.searchInput} 
              value={searchTerm || ''}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>

          <div className={styles.headerRight}>
            <button className={styles.iconBtn}><Bell size={18} /></button>
            <button className={styles.iconBtn}><HelpCircle size={18} /></button>
            <button className={styles.iconBtn}><User size={18} /></button>
            <div className={styles.cashierAvatar}>
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Cashier" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.mainContent}>
          {/* Left Side: Products Grid */}
          <div className={styles.productsArea}>
            {children}
          </div>

          {/* Right Side: Cart / Register */}
          <div className={styles.cartArea}>
            {cartArea}
          </div>
        </div>
      </div>
    </div>
  );
}
