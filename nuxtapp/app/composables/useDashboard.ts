import { ref } from 'vue';
import axios from 'axios';

export interface TrendDayItem {
  date: string;
  label: string;
  value: number;
  invoices: number;
}

export interface TopMedicineItem {
  name: string;
  units_sold: number;
  revenue: number;
}

export interface RecentSaleItem {
  id: number;
  invoice_no: string;
  created_at: string;
  formatted_date?: string;
  patient: string;
  payment_method: string;
  transaction_no?: string;
  status?: string;
  total: number;
  subtotal?: number;
  discount?: number;
  paid_amount?: number;
  due_amount?: number;
  cashier_name: string;
  items_count: number;
  items_summary?: string;
}

export interface NearExpiryAlertItem {
  id: number;
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  rack_location?: string;
  days_until_expiry: number;
}

export interface DashboardData {
  todayRevenue: number;
  todaySales: number;
  monthRevenue: number;
  monthSales: number;
  totalProducts: number;
  rxProductsCount: number;
  lowStockCount: number;
  nearExpiryCount: number;
  revenueTrend7Days: TrendDayItem[];
  total7DayRevenue: number;
  revenueTrend30Days: TrendDayItem[];
  total30DayRevenue: number;
  revenueTrendMonthly: TrendDayItem[];
  totalMonthlyRevenue: number;
  topMedicines: TopMedicineItem[];
  recentSales: RecentSaleItem[];
  nearExpiryAlerts: NearExpiryAlertItem[];
}

export function useDashboard() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const dashboard = ref<DashboardData>({
    todayRevenue: 0,
    todaySales: 0,
    monthRevenue: 0,
    monthSales: 0,
    totalProducts: 0,
    rxProductsCount: 0,
    lowStockCount: 0,
    nearExpiryCount: 0,
    revenueTrend7Days: [
      { date: '', label: 'Mon', value: 0, invoices: 0 },
      { date: '', label: 'Tue', value: 0, invoices: 0 },
      { date: '', label: 'Wed', value: 0, invoices: 0 },
      { date: '', label: 'Thu', value: 0, invoices: 0 },
      { date: '', label: 'Fri', value: 0, invoices: 0 },
      { date: '', label: 'Sat', value: 0, invoices: 0 },
      { date: '', label: 'Sun', value: 0, invoices: 0 }
    ],
    total7DayRevenue: 0,
    revenueTrend30Days: [],
    total30DayRevenue: 0,
    revenueTrendMonthly: [],
    totalMonthlyRevenue: 0,
    topMedicines: [],
    recentSales: [],
    nearExpiryAlerts: []
  });

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.client) {
      const token = localStorage.getItem('auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user && user.tenantId && user.tenantId !== 'SYSTEM') {
            headers['x-tenant-id'] = String(user.tenantId);
          }
        } catch (e) {}
      }
    }
    return headers;
  };

  const fetchDashboard = async (branchId?: number | 'all') => {
    loading.value = true;
    error.value = null;
    try {
      const headers = getHeaders();
      const url = branchId && branchId !== 'all' ? `/inventory/dashboard?branch_id=${branchId}` : '/inventory/dashboard';
      const res = await axios.get(url, { headers });

      if (res.data && res.data.success && res.data.dashboard) {
        const d = res.data.dashboard;
        dashboard.value = {
          todayRevenue: Number(d.todayRevenue || 0),
          todaySales: Number(d.todaySales || 0),
          monthRevenue: Number(d.monthRevenue || 0),
          monthSales: Number(d.monthSales || 0),
          totalProducts: Number(d.totalProducts || 0),
          rxProductsCount: Number(d.rxProductsCount || 0),
          lowStockCount: Number(d.lowStockCount || 0),
          nearExpiryCount: Number(d.nearExpiryCount || 0),
          revenueTrend7Days: Array.isArray(d.revenueTrend7Days) && d.revenueTrend7Days.length > 0
            ? d.revenueTrend7Days
            : dashboard.value.revenueTrend7Days,
          total7DayRevenue: Number(d.total7DayRevenue || 0),
          revenueTrend30Days: Array.isArray(d.revenueTrend30Days) ? d.revenueTrend30Days : [],
          total30DayRevenue: Number(d.total30DayRevenue || 0),
          revenueTrendMonthly: Array.isArray(d.revenueTrendMonthly) ? d.revenueTrendMonthly : [],
          totalMonthlyRevenue: Number(d.totalMonthlyRevenue || 0),
          topMedicines: Array.isArray(d.topMedicines) ? d.topMedicines : [],
          recentSales: Array.isArray(d.recentSales) ? d.recentSales : [],
          nearExpiryAlerts: Array.isArray(d.nearExpiryAlerts) ? d.nearExpiryAlerts : []
        };
      }

      // If recentSales is empty, sync directly with /sales ledger
      if (dashboard.value.recentSales.length === 0) {
        try {
          const salesRes = await axios.get('/sales?limit=50', { headers });
          if (salesRes.data && salesRes.data.success && Array.isArray(salesRes.data.sales) && salesRes.data.sales.length > 0) {
            const allSales = salesRes.data.sales;
            const stats = salesRes.data.stats || {};

            // 1. Populate latest 5 recent sales
            dashboard.value.recentSales = allSales.slice(0, 5).map((s: any) => ({
              id: s.id,
              invoice_no: s.invoice_no || `INV-${s.id}`,
              created_at: s.created_at || new Date().toISOString(),
              formatted_date: s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB') + ' ' + new Date(s.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined,
              patient: s.customer_phone || s.customer_name || 'Walk-in Patient',
              payment_method: s.payment_method || 'CASH',
              transaction_no: s.transaction_no || undefined,
              status: s.status || 'COMPLETED',
              total: Number(s.total || s.total_amount || 0),
              cashier_name: s.cashier_name || 'Pharmacist',
              items_count: Number(s.items_count || 1),
              items_summary: s.items_summary || undefined
            }));

            // 2. Populate KPIs if dashboard returned 0
            if (dashboard.value.todayRevenue === 0 && stats.today_revenue) {
              dashboard.value.todayRevenue = Number(stats.today_revenue || 0);
              dashboard.value.todaySales = Number(stats.today_invoices || 0);
            }
            if (dashboard.value.monthRevenue === 0 && stats.total_revenue) {
              dashboard.value.monthRevenue = Number(stats.total_revenue || 0);
              dashboard.value.monthSales = Number(stats.total_invoices || allSales.length);
            }

            // 3. Compute continuous 7-Day & 30-Day Trend if empty
            const total7 = dashboard.value.revenueTrend7Days.reduce((acc, curr) => acc + curr.value, 0);
            if (total7 === 0) {
              const last7Days: TrendDayItem[] = [];
              for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                const daySales = allSales.filter((s: any) => String(s.created_at || '').startsWith(dateStr));
                const dayTotal = daySales.reduce((sum: number, s: any) => sum + Number(s.total || s.total_amount || 0), 0);
                last7Days.push({
                  date: dateStr,
                  label: dayLabel,
                  value: dayTotal,
                  invoices: daySales.length
                });
              }
              dashboard.value.revenueTrend7Days = last7Days;
              dashboard.value.total7DayRevenue = last7Days.reduce((acc, curr) => acc + curr.value, 0);
            }
          }
        } catch (salesErr) {
          console.warn('Fallback sales fetch skipped:', salesErr);
        }
      }
    } catch (err: any) {
      console.warn('Dashboard fetch warning:', err);
      error.value = err?.response?.data?.message || err?.message || 'Failed to load dashboard data';
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    dashboard,
    fetchDashboard
  };
}
