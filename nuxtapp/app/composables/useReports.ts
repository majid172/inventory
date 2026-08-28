import { ref } from 'vue';
import axios from 'axios';

export interface ProfitLossSummary {
  total_invoices: number;
  gross_sales: number;
  total_discounts: number;
  total_tax: number;
  net_revenue: number;
  total_cogs: number;
  gross_profit: number;
  margin_percentage: number;
  total_collected: number;
  total_due: number;
  total_units_sold: number;
}

export interface TimelineItem {
  sale_date: string;
  invoice_count: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin_pct: number;
}

export interface ProductProfitItem {
  product_id: number;
  product_name: string;
  generic_name?: string;
  category_name?: string;
  units_sold: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin_pct: number;
}

export interface CategoryProfitItem {
  category_name: string;
  units_sold: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin_pct: number;
}

export interface InvoiceProfitItem {
  id: number;
  invoice_no: string;
  created_at: string;
  customer_phone?: string;
  payment_method: string;
  net_amount: number;
  cogs: number;
  profit: number;
  margin_pct: number;
  cashier_name?: string;
}

export interface ExpiryLossSummary {
  expired_batch_count: number;
  expired_total_units: number;
  expired_total_loss: number;
  near30_loss: number;
  near30_units: number;
  near60_loss: number;
  near60_units: number;
  near90_loss: number;
  near90_units: number;
  total_at_risk_value: number;
  total_at_risk_units: number;
}

export interface ExpiredBatchItem {
  id: number;
  batch_number: string;
  expiry_date: string;
  expired_units: number;
  unit_cost: number;
  total_loss: number;
  days_expired: number;
  product_name: string;
  generic_name?: string;
  category_name?: string;
  supplier_name?: string;
  rack_location?: string;
}

export interface NearExpiryBatchItem {
  id: number;
  batch_number: string;
  expiry_date: string;
  stock_units: number;
  unit_cost: number;
  total_value_at_risk: number;
  days_left: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  product_name: string;
  generic_name?: string;
  category_name?: string;
  supplier_name?: string;
  rack_location?: string;
}

export function useReports() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Profit & Loss State
  const pnlSummary = ref<ProfitLossSummary>({
    total_invoices: 0,
    gross_sales: 0,
    total_discounts: 0,
    total_tax: 0,
    net_revenue: 0,
    total_cogs: 0,
    gross_profit: 0,
    margin_percentage: 0,
    total_collected: 0,
    total_due: 0,
    total_units_sold: 0
  });
  const pnlTimeline = ref<TimelineItem[]>([]);
  const pnlProducts = ref<ProductProfitItem[]>([]);
  const pnlCategories = ref<CategoryProfitItem[]>([]);
  const pnlInvoices = ref<InvoiceProfitItem[]>([]);

  // Expiry Loss State
  const expirySummary = ref<ExpiryLossSummary>({
    expired_batch_count: 0,
    expired_total_units: 0,
    expired_total_loss: 0,
    near30_loss: 0,
    near30_units: 0,
    near60_loss: 0,
    near60_units: 0,
    near90_loss: 0,
    near90_units: 0,
    total_at_risk_value: 0,
    total_at_risk_units: 0
  });
  const expiredBatches = ref<ExpiredBatchItem[]>([]);
  const nearExpiryBatches = ref<NearExpiryBatchItem[]>([]);

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.client) {
      const token = localStorage.getItem('auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          const tid = user?.tenantId || user?.tenant_id;
          if (user && tid && tid !== 'SYSTEM') {
            headers['x-tenant-id'] = String(tid);
          }
        } catch (e) {}
      }

      const savedStore = localStorage.getItem('active_tenant_store');
      if (savedStore && !headers['x-tenant-id']) {
        try {
          const store = JSON.parse(savedStore);
          if (store && store.id) headers['x-tenant-id'] = String(store.id);
        } catch (e) {}
      }
    }
    return headers;
  };

  const fetchProfitLoss = async (params: {
    period?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const q = new URLSearchParams();
      if (params.period) q.append('period', params.period);
      if (params.startDate) q.append('startDate', params.startDate);
      if (params.endDate) q.append('endDate', params.endDate);

      const res = await axios.get(`/inventory/reports/profit-loss?${q.toString()}`, {
        headers: getHeaders()
      });
      if (res.data && res.data.success) {
        pnlSummary.value = res.data.summary || pnlSummary.value;
        pnlTimeline.value = res.data.timeline || [];
        pnlProducts.value = res.data.products || [];
        pnlCategories.value = res.data.categories || [];
        pnlInvoices.value = res.data.invoices || [];
      }
    } catch (err: any) {
      console.warn('Failed to fetch profit loss report:', err);
      error.value = err?.response?.data?.message || err?.message || 'Failed to load report';
    } finally {
      loading.value = false;
    }
  };

  const fetchExpiryLoss = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get('/inventory/reports/expiry-loss', {
        headers: getHeaders()
      });
      if (res.data && res.data.success) {
        expirySummary.value = res.data.summary || expirySummary.value;
        expiredBatches.value = res.data.expired_batches || [];
        nearExpiryBatches.value = res.data.near_expiry_batches || [];
      }
    } catch (err: any) {
      console.warn('Failed to fetch expiry loss report:', err);
      error.value = err?.response?.data?.message || err?.message || 'Failed to load expiry report';
    } finally {
      loading.value = false;
    }
  };

  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    loading,
    error,
    pnlSummary,
    pnlTimeline,
    pnlProducts,
    pnlCategories,
    pnlInvoices,
    expirySummary,
    expiredBatches,
    nearExpiryBatches,
    fetchProfitLoss,
    fetchExpiryLoss,
    exportToCSV
  };
}
