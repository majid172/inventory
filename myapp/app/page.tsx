import Link from 'next/link';
import styles from './page.module.css';
import { LayoutDashboard, MonitorSmartphone } from 'lucide-react';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>System Portal</h1>
        <p className={styles.subtitle}>Select your destination</p>
        
        <div className={styles.cardsContainer}>
          <Link href="/admin" className={`${styles.card} glass`}>
            <div className={styles.iconWrapper}>
              <LayoutDashboard size={48} />
            </div>
            <h2>Back-Office</h2>
            <p>Inventory, Orders & Reports</p>
          </Link>
          
          <Link href="/pos" className={`${styles.card} glass`}>
            <div className={styles.iconWrapper}>
              <MonitorSmartphone size={48} />
            </div>
            <h2>Point of Sale</h2>
            <p>Checkout & Register</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
