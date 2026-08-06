import styles from './DashboardStats.module.css';
import { Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

export default function DashboardStats() {
  const stats = [
    { label: 'Total Revenue', value: '$24,562', icon: DollarSign, trend: '+12%', color: 'success' },
    { label: 'Total Items', value: '1,248', icon: Package, trend: '+4%', color: 'primary' },
    { label: 'Low Stock Alerts', value: '12', icon: AlertCircle, trend: '-2%', color: 'danger' },
    { label: 'Monthly Sales', value: '384', icon: TrendingUp, trend: '+8%', color: 'accent' },
  ];

  return (
    <div className={styles.grid}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.label}>{stat.label}</span>
              <div className={`${styles.iconWrapper} ${styles[stat.color]}`}>
                <Icon size={20} />
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.value}>{stat.value}</h3>
              <span className={`${styles.trend} ${stat.trend.startsWith('+') ? styles.positive : styles.negative}`}>
                {stat.trend} from last month
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
