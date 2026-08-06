import Sidebar from '../components/admin/Sidebar';
import styles from './layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={`${styles.header} glass`}>
          <div className={styles.headerLeft}>
            <h2>Admin Dashboard</h2>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.avatar}>A</div>
          </div>
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
