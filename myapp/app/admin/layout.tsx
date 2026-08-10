import Sidebar from '../components/admin/Sidebar';
import styles from './layout.module.css';
import { Search, Bell, Settings, MonitorSmartphone } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.searchContainer}>
              <Search size={20} className={styles.searchIcon} />
              <input type="text" placeholder="Search inventory..." className={styles.searchInput} />
            </div>
          </div>
          <div className={styles.headerRight}>
            <Link href="/pos" className={styles.posBtn}>
              <MonitorSmartphone size={16} />
              Go to POS
            </Link>
            <button className={styles.iconBtn}><Bell size={20} /></button>
            <button className={styles.iconBtn}><Settings size={20} /></button>
            <div className={styles.avatar}>
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Avatar" />
            </div>
          </div>
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
