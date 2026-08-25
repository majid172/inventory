'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, TrendingUp, CreditCard, AlertTriangle,
  BarChart3, Building2, ArrowUpRight, Shield, Settings,
  LogOut, Package, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import styles from './superadmin.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Analytics {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  newTenantsLast30Days: number;
  planDistribution: { starter: number; pro: number; enterprise: number };
  revenueChart: { month: string; revenue: number }[];
  expiringTenants: { id: number; store_name: string; plan_id: string; subscription_end: string }[];
}

interface Tenant {
  id: number;
  store_name: string;
  owner_name: string;
  email: string;
  plan_id: string;
  status: string;
  subscription_end: string;
  mrr: number;
}

const statusColor: Record<string, string> = {
  active: '#22c55e', trial: '#3b82f6', suspended: '#ef4444', expired: '#f59e0b', pending: '#9ca3af'
};

export default function SuperAdminDashboard() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<{id:string;name:string;price_monthly:number}[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard'|'tenants'|'plans'|'payments'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/super-admin/login');
      return;
    }
    loadAll();
  }, []);

  const authHeader = { Authorization: `Bearer ${token}` };

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [aRes, tRes, pRes] = await Promise.all([
        fetch(`${API}/super-admin/analytics`, { headers: authHeader }),
        fetch(`${API}/super-admin/tenants?limit=20`, { headers: authHeader }),
        fetch(`${API}/super-admin/plans`, { headers: authHeader })
      ]);
      const [aData, tData, pData] = await Promise.all([aRes.json(), tRes.json(), pRes.json()]);
      if (aData.success) setAnalytics(aData.data);
      if (tData.success) setTenants(tData.tenants || []);
      if (pData.success) setPlans(pData.plans || []);
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const updateTenantStatus = async (id: number, status: string) => {
    await fetch(`${API}/super-admin/tenants/${id}`, {
      method: 'PATCH',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleLogout = () => { logout(); router.push('/super-admin/login'); };

  if (isLoading) return (
    <div className={styles.loader}><div className={styles.loaderSpinner} /><p>Loading platform data...</p></div>
  );

  const kpis = analytics ? [
    { icon: Users,      label: 'Total Tenants',  value: analytics.totalTenants,  sub: `+${analytics.newTenantsLast30Days} this month`,   color: '#6366f1' },
    { icon: TrendingUp, label: 'Monthly Revenue', value: `$${analytics.mrr.toFixed(0)}`, sub: `ARR: $${analytics.arr.toFixed(0)}`, color: '#22c55e' },
    { icon: Building2,  label: 'Active Tenants',  value: analytics.activeTenants, sub: `${analytics.trialTenants} on trial`,             color: '#3b82f6' },
    { icon: AlertTriangle, label: 'Suspended',    value: analytics.suspendedTenants, sub: 'Needs attention',                            color: '#ef4444' },
  ] : [];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoIcon}>💊</div>
          <div>
            <div className={styles.sidebarBrand}>PharmaCare</div>
            <div className={styles.sidebarRole}>Super Admin Panel</div>
          </div>
        </div>
        <nav className={styles.sidebarNav}>
          {([
            ['dashboard', BarChart3, 'Dashboard'],
            ['tenants',   Building2, 'Tenants'],
            ['plans',     Package,   'Plans'],
            ['payments',  CreditCard,'Payments'],
          ] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              className={`${styles.navItem} ${activeTab === id ? styles.navActive : ''}`}
              onClick={() => setActiveTab(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile}>
            <div className={styles.adminAvatar}>SA</div>
            <div>
              <div className={styles.adminName}>{user?.name || 'Super Admin'}</div>
              <div className={styles.adminEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={16}/> Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>
              {activeTab === 'dashboard' ? 'Platform Overview' :
               activeTab === 'tenants' ? 'Tenant Management' :
               activeTab === 'plans' ? 'Subscription Plans' : 'Payments & Billing'}
            </h1>
            <p className={styles.pageSubtitle}>{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div className={styles.topbarActions}>
            <div className={styles.topbarBadge}><Shield size={14}/> Platform Admin</div>
          </div>
        </header>

        <div className={styles.content}>

          {/* ─── DASHBOARD TAB ─── */}
          {activeTab === 'dashboard' && analytics && (
            <>
              {/* KPI Cards */}
              <div className={styles.kpiGrid}>
                {kpis.map(kpi => (
                  <div key={kpi.label} className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                      <span className={styles.kpiLabel}>{kpi.label}</span>
                      <div className={styles.kpiIconBox} style={{ background: kpi.color + '18' }}>
                        <kpi.icon size={20} color={kpi.color} />
                      </div>
                    </div>
                    <div className={styles.kpiValue}>{kpi.value}</div>
                    <div className={styles.kpiSub}><ArrowUpRight size={12}/> {kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Plan Distribution + Expiring */}
              <div className={styles.twoCol}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Plan Distribution</h3>
                  <div className={styles.planDist}>
                    {[
                      { label: 'Starter', count: analytics.planDistribution.starter, color: '#6366f1' },
                      { label: 'Pro',     count: analytics.planDistribution.pro,     color: '#f59e0b' },
                      { label: 'Enterprise', count: analytics.planDistribution.enterprise, color: '#22c55e' },
                    ].map(p => (
                      <div key={p.label} className={styles.planDistRow}>
                        <div className={styles.planDistLabel}>
                          <span className={styles.planDistDot} style={{ background: p.color }} />
                          {p.label}
                        </div>
                        <div className={styles.planDistBar}>
                          <div className={styles.planDistFill} style={{
                            width: `${analytics.totalTenants > 0 ? (p.count / analytics.totalTenants * 100) : 0}%`,
                            background: p.color
                          }} />
                        </div>
                        <span className={styles.planDistCount}>{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Expiring Soon <span className={styles.cardBadge}>{analytics.expiringTenants?.length || 0}</span></h3>
                  {analytics.expiringTenants?.length > 0 ? (
                    <div className={styles.expiryList}>
                      {analytics.expiringTenants.map(t => (
                        <div key={t.id} className={styles.expiryItem}>
                          <div>
                            <div className={styles.expiryName}>{t.store_name}</div>
                            <div className={styles.expiryDate}>Expires: {t.subscription_end}</div>
                          </div>
                          <span className={styles.planTag}>{t.plan_id}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className={styles.emptyMsg}>No subscriptions expiring in the next 14 days.</p>}
                </div>
              </div>

              {/* Tenant Status Breakdown */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Tenant Status Overview</h3>
                <div className={styles.statusGrid}>
                  {[
                    { label:'Active',    count: analytics.activeTenants,    color:'#22c55e', bg:'#f0fdf4' },
                    { label:'Trial',     count: analytics.trialTenants,     color:'#3b82f6', bg:'#eff6ff' },
                    { label:'Suspended', count: analytics.suspendedTenants, color:'#ef4444', bg:'#fef2f2' },
                    { label:'Expired',   count: analytics.expiredTenants,   color:'#f59e0b', bg:'#fffbeb' },
                  ].map(s => (
                    <div key={s.label} className={styles.statusCard} style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
                      <div className={styles.statusCount} style={{ color: s.color }}>{s.count}</div>
                      <div className={styles.statusLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── TENANTS TAB ─── */}
          {activeTab === 'tenants' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>All Pharmacies ({tenants.length})</h3>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Pharmacy</th><th>Owner</th><th>Plan</th><th>Status</th>
                      <th>Sub. End</th><th>MRR</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(t => (
                      <tr key={t.id}>
                        <td>
                          <div className={styles.tenantName}>{t.store_name}</div>
                          <div className={styles.tenantEmail}>{t.email}</div>
                        </td>
                        <td className={styles.tdSub}>{t.owner_name}</td>
                        <td><span className={styles.planBadge}>{t.plan_id}</span></td>
                        <td>
                          <span className={styles.statusBadge} style={{ color: statusColor[t.status] || '#6b7280', background: (statusColor[t.status] || '#6b7280') + '18' }}>
                            {t.status}
                          </span>
                        </td>
                        <td className={styles.tdSub}>{t.subscription_end ? new Date(t.subscription_end).toLocaleDateString() : '—'}</td>
                        <td className={styles.tdMrr}>${t.mrr}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            {t.status !== 'active'    && <button className={`${styles.actionBtn} ${styles.activateBtn}`} onClick={() => updateTenantStatus(t.id, 'active')}>Activate</button>}
                            {t.status !== 'suspended' && <button className={`${styles.actionBtn} ${styles.suspendBtn}`}  onClick={() => updateTenantStatus(t.id, 'suspended')}>Suspend</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── PLANS TAB ─── */}
          {activeTab === 'plans' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Subscription Plans</h3>
              </div>
              <div className={styles.plansTable}>
                {plans.map(p => (
                  <div key={p.id} className={styles.planRow}>
                    <div className={styles.planRowLeft}>
                      <span className={styles.planBadge}>{p.id}</span>
                      <strong>{p.name}</strong>
                    </div>
                    <div className={styles.planRowRight}>
                      <span>${p.price_monthly}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PAYMENTS TAB ─── */}
          {activeTab === 'payments' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Payment Transactions</h3>
              <p className={styles.emptyMsg}>Loading payment records...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
