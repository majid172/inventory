'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp, Package, AlertTriangle, Clock, ShoppingCart,
  ArrowUpRight, BarChart3, Bell, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import styles from './dashboard.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DashData {
  todayRevenue: number;
  todaySales: number;
  monthRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  nearExpiryCount: number;
  salesChart: { sale_date: string; revenue: number; count: number }[];
  topProducts: { name: string; units_sold: number; revenue: number }[];
  lowStockAlerts: { id: number; name: string; stock_quantity: number; reorder_level: number }[];
  nearExpiryAlerts: { name: string; batch_number: string; expiry_date: string; days_until_expiry: number }[];
}

export default function TenantDashboard() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subExpiring, setSubExpiring] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user?.role === 'SUPER_ADMIN') { router.push('/super-admin/dashboard'); return; }
    loadDashboard();
    checkSubscription();
  }, []);

  const authHeader = { Authorization: `Bearer ${token}` };

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/inventory/dashboard`, { headers: authHeader });
      const d = await res.json();
      if (d.success) setData(d.dashboard);
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const checkSubscription = async () => {
    try {
      const res = await fetch(`${API}/inventory/my-subscription`, { headers: authHeader });
      const d = await res.json();
      if (d.success && d.subscription?.subscription_end) {
        const daysLeft = Math.ceil((new Date(d.subscription.subscription_end).getTime() - Date.now()) / 86400000);
        setSubExpiring(daysLeft <= 7 && daysLeft >= 0);
      }
    } catch {}
  };

  if (isLoading) return (
    <div className={styles.loader}><div className={styles.spinner}/><p>Loading dashboard...</p></div>
  );

  const kpis = data ? [
    { icon: TrendingUp,    label: "Today's Revenue",  value: `৳${(data.todayRevenue||0).toFixed(0)}`, sub: `${data.todaySales} sales today`,       color: '#22c55e' },
    { icon: ShoppingCart,  label: "Month Revenue",    value: `৳${(data.monthRevenue||0).toFixed(0)}`, sub: `This month`,                             color: '#6366f1' },
    { icon: Package,       label: "Total Products",   value: data.totalProducts,                       sub: `${data.lowStockCount} low stock`,        color: '#3b82f6' },
    { icon: Clock,         label: "Near Expiry",      value: data.nearExpiryCount,                    sub: `Within 90 days`,                          color: '#f59e0b' },
  ] : [];

  return (
    <div className={styles.page}>
      {/* Subscription expiry banner */}
      {subExpiring && (
        <div className={styles.expiryBanner}>
          <Bell size={16} />
          Your subscription expires soon! <Link href="/admin/subscription">Renew Now →</Link>
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>{user?.storeName || 'Your Pharmacy'} — {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</p>
        </div>
        <button className={styles.refreshBtn} onClick={loadDashboard}><RefreshCw size={16}/> Refresh</button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <div className={styles.kpiIcon} style={{ background: k.color+'18' }}>
                <k.icon size={20} color={k.color} />
              </div>
            </div>
            <div className={styles.kpiValue}>{k.value}</div>
            <div className={styles.kpiSub}><ArrowUpRight size={12}/>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts + Top Products */}
      <div className={styles.twoCol}>
        {/* Sales chart (last 7 days) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Sales — Last 7 Days</h3>
            <BarChart3 size={16} color="#9ca3af" />
          </div>
          {data?.salesChart && data.salesChart.length > 0 ? (
            <div className={styles.barChart}>
              {data.salesChart.map((d, i) => {
                const max = Math.max(...(data.salesChart.map(s => s.revenue))) || 1;
                return (
                  <div key={i} className={styles.barWrap} title={`৳${d.revenue}`}>
                    <div className={styles.bar} style={{ height: `${(d.revenue / max) * 100}%` }} />
                    <div className={styles.barLabel}>{new Date(d.sale_date).toLocaleDateString('en', {weekday:'short'})}</div>
                  </div>
                );
              })}
            </div>
          ) : <p className={styles.emptyMsg}>No sales data yet. <Link href="/pos">Make your first sale →</Link></p>}
        </div>

        {/* Top Products */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><h3>Top Products (This Month)</h3></div>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className={styles.topList}>
              {data.topProducts.map((p, i) => (
                <div key={i} className={styles.topItem}>
                  <div className={styles.topRank}>{i+1}</div>
                  <div className={styles.topInfo}>
                    <div className={styles.topName}>{p.name}</div>
                    <div className={styles.topSub}>{p.units_sold} units sold</div>
                  </div>
                  <div className={styles.topRev}>৳{(p.revenue||0).toFixed(0)}</div>
                </div>
              ))}
            </div>
          ) : <p className={styles.emptyMsg}>No sales recorded yet.</p>}
        </div>
      </div>

      {/* Alerts */}
      <div className={styles.twoCol}>
        {/* Low Stock */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Low Stock Alerts <span className={styles.alertCount}>{data?.lowStockCount || 0}</span></h3>
            <Link href="/admin/inventory" className={styles.viewAll}>View All →</Link>
          </div>
          {data?.lowStockAlerts && data.lowStockAlerts.length > 0 ? (
            data.lowStockAlerts.map(p => (
              <div key={p.id} className={styles.alertItem}>
                <AlertTriangle size={14} color="#f59e0b" />
                <div className={styles.alertInfo}>
                  <span className={styles.alertName}>{p.name}</span>
                  <span className={styles.alertSub}>Stock: {p.stock_quantity} / Min: {p.reorder_level}</span>
                </div>
                <div className={styles.alertBadge} style={{ background: p.stock_quantity === 0 ? '#fee2e2' : '#fff9f5', color: p.stock_quantity === 0 ? '#dc2626' : '#b45309' }}>
                  {p.stock_quantity === 0 ? 'Out' : 'Low'}
                </div>
              </div>
            ))
          ) : <p className={styles.emptyMsg}>✅ All products are well-stocked!</p>}
        </div>

        {/* Near Expiry */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Near Expiry <span className={styles.alertCount}>{data?.nearExpiryCount || 0}</span></h3>
            <Link href="/admin/reports/stock" className={styles.viewAll}>View All →</Link>
          </div>
          {data?.nearExpiryAlerts && data.nearExpiryAlerts.length > 0 ? (
            data.nearExpiryAlerts.map((b, i) => (
              <div key={i} className={styles.alertItem}>
                <Clock size={14} color={b.days_until_expiry <= 30 ? '#ef4444' : '#f59e0b'} />
                <div className={styles.alertInfo}>
                  <span className={styles.alertName}>{b.name}</span>
                  <span className={styles.alertSub}>{b.batch_number} — {b.expiry_date}</span>
                </div>
                <div className={styles.alertBadge} style={{ background: b.days_until_expiry <= 30 ? '#fee2e2' : '#fff9f5', color: b.days_until_expiry <= 30 ? '#dc2626' : '#b45309' }}>
                  {b.days_until_expiry}d
                </div>
              </div>
            ))
          ) : <p className={styles.emptyMsg}>✅ No medicines expiring within 90 days!</p>}
        </div>
      </div>

      {/* Quick links */}
      <div className={styles.quickLinks}>
        {[
          { href: '/pos',              label: 'New Sale',      icon: ShoppingCart, color:'#22c55e' },
          { href: '/admin/products/new', label: 'Add Medicine', icon: Package,      color:'#6366f1' },
          { href: '/admin/inventory',  label: 'Stock In',      icon: TrendingUp,   color:'#3b82f6' },
          { href: '/admin/reports/sales', label: 'Sales Report', icon: BarChart3,  color:'#f59e0b' },
        ].map(q => (
          <Link key={q.href} href={q.href} className={styles.quickLink}>
            <div className={styles.quickIcon} style={{ background: q.color+'18' }}>
              <q.icon size={20} color={q.color} />
            </div>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
