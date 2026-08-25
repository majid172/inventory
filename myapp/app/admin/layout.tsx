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
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
