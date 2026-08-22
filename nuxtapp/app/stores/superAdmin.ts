import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TenantStore {
  id: string;
  storeName: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  planTier: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'expired';
  terminalsCount: number;
  branchesCount: number;
  joinedDate: string;
  nextBillingDate: string;
  mrr: number;
}

export interface SubscriptionPlan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  priceMonthly: number;
  priceYearly: number;
  terminalsLimit: number;
  branchesLimit: number;
  masterDrugLimit: string;
  allowedDrugTiers: string[];
  features: {
    posRegister: boolean;
    fefoExpiry: string;
    rxVerification: boolean;
    smsReceipts: string;
    poGenerator: boolean;
    support: string;
  };
}

export interface MasterDrug {
  id: string;
  drugCode?: string;
  brandName: string;
  genericName: string;
  dosageForm: string;
  manufacturer: string;
  defaultRetailPrice: number;
  rxRequired: boolean;
  planTierAccess: 'starter' | 'pro' | 'enterprise';
  barcode: string;
  therapeuticClass: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  tenantId: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface AnalyticsData {
  mrr: number;
  arr: number;
  totalSubscribers: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  masterDrugsTotal: number;
  masterDrugsMockCount: number;
  activeTerminalsTotal: number;
  systemUptime: string;
  dbResponseLatencyMs: number;
  planDistribution: {
    starter: number;
    pro: number;
    enterprise: number;
  };
}

export const useSuperAdminStore = defineStore('superAdmin', () => {
  // State
  const analytics = ref<AnalyticsData>({
    mrr: 14850.00,
    arr: 178200.00,
    totalSubscribers: 38,
    activeTenants: 32,
    trialTenants: 4,
    suspendedTenants: 2,
    masterDrugsTotal: 52400,
    masterDrugsMockCount: 7,
    activeTerminalsTotal: 142,
    systemUptime: "99.98%",
    dbResponseLatencyMs: 3,
    planDistribution: {
      starter: 12,
      pro: 20,
      enterprise: 6
    }
  });

  const tenants = ref<TenantStore[]>([]);
  const plans = ref<SubscriptionPlan[]>([]);
  const masterDrugs = ref<MasterDrug[]>([]);
  const auditLogs = ref<AuditLog[]>([]);

  const isLoading = ref(false);
  const searchFilter = ref('');
  const statusFilter = ref('all');
  const planFilter = ref('all');
  const masterDrugTierFilter = ref('all');

  // Computed Plan-Wise Metrics & Filters
  const filteredTenants = computed(() => {
    return tenants.value.filter(t => {
      const matchesSearch = !searchFilter.value || 
        t.storeName.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
        t.email.toLowerCase().includes(searchFilter.value.toLowerCase());
      
      const matchesStatus = statusFilter.value === 'all' || t.status === statusFilter.value;
      const matchesPlan = planFilter.value === 'all' || t.planTier === planFilter.value;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  });

  const filteredMasterDrugs = computed(() => {
    return masterDrugs.value.filter(d => {
      const matchesSearch = !searchFilter.value ||
        d.brandName.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
        d.genericName.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
        d.manufacturer.toLowerCase().includes(searchFilter.value.toLowerCase());
      
      const matchesTier = masterDrugTierFilter.value === 'all' || d.planTierAccess === masterDrugTierFilter.value;

      return matchesSearch && matchesTier;
    });
  });

  const starterDrugsCount = computed(() => masterDrugs.value.filter(d => d.planTierAccess === 'starter').length);
  const proDrugsCount = computed(() => masterDrugs.value.filter(d => d.planTierAccess === 'pro').length);
  const enterpriseDrugsCount = computed(() => masterDrugs.value.filter(d => d.planTierAccess === 'enterprise').length);

  // API Sync Methods
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/super-admin/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          analytics.value = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline, using local fallback telemetry.");
    }
  };

  const fetchPlans = async () => {
    isLoading.value = true;
    try {
      const res = await fetch('http://localhost:5000/api/super-admin/plans');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          plans.value = json.data;
          return;
        }
      }
    } catch (e) {
      console.warn("Backend plans API offline, using fallback subscription plans.");
    } finally {
      if (plans.value.length === 0) {
        plans.value = [
          {
            id: "starter",
            name: "Starter Plan",
            priceMonthly: 49,
            priceYearly: 470,
            terminalsLimit: 1,
            branchesLimit: 1,
            masterDrugLimit: "10,000 Essential Generics",
            allowedDrugTiers: ["starter"],
            features: {
              posRegister: true,
              fefoExpiry: "Basic",
              rxVerification: false,
              smsReceipts: "Not Included",
              poGenerator: false,
              support: "Email Support"
            }
          },
          {
            id: "pro",
            name: "Pro Plan (Popular)",
            priceMonthly: 149,
            priceYearly: 1430,
            terminalsLimit: 3,
            branchesLimit: 1,
            masterDrugLimit: "50,000+ Full National Catalog",
            allowedDrugTiers: ["starter", "pro"],
            features: {
              posRegister: true,
              fefoExpiry: "Advanced FEFO Alerts",
              rxVerification: true,
              smsReceipts: "500 SMS / month",
              poGenerator: true,
              support: "Priority Chat Support"
            }
          },
          {
            id: "enterprise",
            name: "Enterprise Chain Plan",
            priceMonthly: 399,
            priceYearly: 3830,
            terminalsLimit: 999,
            branchesLimit: 99,
            masterDrugLimit: "Unlimited + Biologics & Custom Catalog",
            allowedDrugTiers: ["starter", "pro", "enterprise"],
            features: {
              posRegister: true,
              fefoExpiry: "Automated AI Reordering",
              rxVerification: true,
              smsReceipts: "Unlimited SMS",
              poGenerator: true,
              support: "24/7 Dedicated Account Manager"
            }
          }
        ];
      }
      isLoading.value = false;
    }
  };

  const createPlanTier = async (payload: Partial<SubscriptionPlan> & { name: string; priceMonthly: number }) => {
    isLoading.value = true;
    let createdPlan: SubscriptionPlan | null = null;

    try {
      const res = await fetch('http://localhost:5000/api/super-admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        console.log("Create Plan Tier Response:", json);
        if (json.success && json.data) {
          createdPlan = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline for plan creation.");
    }

    if (!createdPlan) {
      const planId = (payload.id || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) as any;
      createdPlan = {
        id: planId,
        name: payload.name,
        priceMonthly: payload.priceMonthly,
        priceYearly: payload.priceYearly || payload.priceMonthly * 10,
        terminalsLimit: payload.terminalsLimit || 1,
        branchesLimit: payload.branchesLimit || 1,
        masterDrugLimit: payload.masterDrugLimit || "Standard Essential Drug Catalog",
        allowedDrugTiers: payload.allowedDrugTiers || [planId],
        features: payload.features || {
          posRegister: true,
          fefoExpiry: "Basic",
          rxVerification: false,
          smsReceipts: "Not Included",
          poGenerator: false,
          support: "Email Support"
        }
      };
    }

    const idx = plans.value.findIndex(p => p.id === createdPlan!.id);
    if (idx === -1) {
      plans.value.push(createdPlan);
    } else {
      plans.value[idx] = createdPlan;
    }

    auditLogs.value.unshift({
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: "Subscription Tier Created",
      details: `Created subscription plan tier '${createdPlan.name}' ($${createdPlan.priceMonthly}/mo)`,
      tenantId: "SYSTEM",
      severity: "success"
    });

    isLoading.value = false;
    return createdPlan;
  };

  const updatePlanTier = async (id: string, payload: Partial<SubscriptionPlan>) => {
    isLoading.value = true;
    let updatedData: Partial<SubscriptionPlan> = { ...payload };

    try {
      const res = await fetch(`http://localhost:5000/api/super-admin/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          updatedData = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline for plan update.");
    }

    const idx = plans.value.findIndex(p => p.id === id);
    if (idx !== -1) {
      plans.value[idx] = { ...plans.value[idx], ...updatedData };
    }

    auditLogs.value.unshift({
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: "Subscription Tier Updated",
      details: `Updated plan specs for '${id.toUpperCase()}'`,
      tenantId: "SYSTEM",
      severity: "info"
    });

    isLoading.value = false;
    return plans.value[idx];
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/super-admin/tenants');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          tenants.value = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline, using local tenant directory.");
    }
  };

  const createTenant = async (payload: { storeName: string; ownerName: string; email: string; phone?: string; planTier: string }) => {
    isLoading.value = true;
    let newTenant: TenantStore | null = null;

    try {
      const res = await fetch('http://localhost:5000/api/super-admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          newTenant = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline for tenant creation.");
    }

    if (!newTenant) {
      const mrrMap: Record<string, number> = { starter: 49, pro: 149, enterprise: 399 };
      newTenant = {
        id: `TENANT_${100 + tenants.value.length + 1}`,
        storeName: payload.storeName,
        slug: payload.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerName: payload.ownerName,
        email: payload.email,
        phone: payload.phone || "+1 (555) 000-0000",
        planTier: payload.planTier as any,
        status: "trial",
        terminalsCount: payload.planTier === 'enterprise' ? 5 : payload.planTier === 'pro' ? 3 : 1,
        branchesCount: 1,
        joinedDate: new Date().toISOString().split('T')[0],
        nextBillingDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        mrr: mrrMap[payload.planTier] || 99
      };
    }

    const idx = tenants.value.findIndex(t => t.id === newTenant!.id);
    if (idx === -1) {
      tenants.value.unshift(newTenant);
    } else {
      tenants.value[idx] = newTenant;
    }

    auditLogs.value.unshift({
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: "New Tenant Onboarded",
      details: `Created pharmacy tenant '${newTenant.storeName}' (${newTenant.planTier.toUpperCase()} Plan - 14 Day Trial)`,
      tenantId: newTenant.id,
      severity: "success"
    });

    isLoading.value = false;
    return newTenant;
  };

  const updateTenant = async (id: string, updates: { status?: 'active' | 'trial' | 'suspended' | 'expired'; planTier?: string; extendDays?: number }) => {
    try {
      await fetch(`http://localhost:5000/api/super-admin/tenants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn("Backend update API offline, performing local mutation.");
    }

    const t = tenants.value.find(item => item.id === id);
    if (t) {
      if (updates.status) t.status = updates.status as any;
      if (updates.planTier) {
        t.planTier = updates.planTier as any;
        const mrrMap: Record<string, number> = { starter: 49, pro: 149, enterprise: 399 };
        t.mrr = mrrMap[updates.planTier] || t.mrr;
      }
      if (updates.extendDays) {
        const nextDate = new Date(t.nextBillingDate);
        nextDate.setDate(nextDate.getDate() + Number(updates.extendDays));
        t.nextBillingDate = nextDate.toISOString().split('T')[0];
      }

      auditLogs.value.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: "Tenant Plan/Status Updated",
        details: `Updated '${t.storeName}' status to ${t.status}, tier to ${t.planTier.toUpperCase()}`,
        tenantId: t.id,
        severity: "info"
      });
    }
  };

  const fetchMasterDrugs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/super-admin/master-drugs');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          masterDrugs.value = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline, using local master drug dictionary.");
    }
  };

  const createMasterDrug = async (payload: Omit<MasterDrug, 'id'> & { id?: string }) => {
    isLoading.value = true;
    let createdDrug: MasterDrug | null = null;

    try {
      const res = await fetch('http://localhost:5000/api/super-admin/master-drugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          createdDrug = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline for master drug creation.");
    }

    if (!createdDrug) {
      createdDrug = {
        id: payload.id || `MDRUG_${1000 + masterDrugs.value.length + 1}`,
        ...payload
      };
    }

    const idx = masterDrugs.value.findIndex(d => d.id === createdDrug!.id);
    if (idx === -1) {
      masterDrugs.value.unshift(createdDrug);
    } else {
      masterDrugs.value[idx] = createdDrug;
    }

    auditLogs.value.unshift({
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: "Master Drug Added",
      details: `Added generic '${createdDrug.genericName}' (${createdDrug.brandName}) for ${createdDrug.planTierAccess.toUpperCase()} Plan tier access`,
      tenantId: "SYSTEM",
      severity: "success"
    });

    isLoading.value = false;
    return createdDrug;
  };

  const updateMasterDrug = async (id: string, payload: Partial<MasterDrug>) => {
    isLoading.value = true;
    let updatedDrugData: Partial<MasterDrug> = { ...payload };

    try {
      const res = await fetch(`http://localhost:5000/api/super-admin/master-drugs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          updatedDrugData = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend API offline for master drug update.");
    }

    const idx = masterDrugs.value.findIndex(d => d.id === id);
    if (idx !== -1) {
      masterDrugs.value[idx] = { ...masterDrugs.value[idx], ...updatedDrugData };
    }

    auditLogs.value.unshift({
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: "Master Drug Updated",
      details: `Updated master drug specs for '${payload.brandName || id}'`,
      tenantId: "SYSTEM",
      severity: "info"
    });

    isLoading.value = false;
    return masterDrugs.value[idx];
  };

  const deleteMasterDrug = async (id: string) => {
    isLoading.value = true;
    try {
      await fetch(`http://localhost:5000/api/super-admin/master-drugs/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn("Backend API offline for master drug delete.");
    }

    const idx = masterDrugs.value.findIndex(d => d.id === id);
    let removedName = id;
    if (idx !== -1) {
      removedName = masterDrugs.value[idx].brandName;
      masterDrugs.value.splice(idx, 1);
    }

    auditLogs.value.unshift({
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: "Master Drug Deleted",
      details: `Deleted drug '${removedName}' (ID: ${id}) from central master catalog`,
      tenantId: "SYSTEM",
      severity: "warning"
    });

    isLoading.value = false;
  };

  const syncMasterCatalogToStores = async () => {
    try {
      await fetch('http://localhost:5000/api/super-admin/master-drugs/sync', { method: 'POST' });
    } catch (e) {
      console.warn("Backend sync API offline, simulating local push.");
    }

    auditLogs.value.unshift({
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: "Global Master Catalog Sync Triggered",
      details: `Pushed catalog updates to 38 subscriber stores filtered by their respective plan tier access limits.`,
      tenantId: "SYSTEM",
      severity: "success"
    });
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/super-admin/logs');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          auditLogs.value = json.data;
        }
      }
    } catch (e) {
      console.warn("Backend logs API offline, using local audit logs.");
    }
  };

  return {
    analytics,
    tenants,
    plans,
    masterDrugs,
    auditLogs,
    isLoading,
    searchFilter,
    statusFilter,
    planFilter,
    masterDrugTierFilter,
    filteredTenants,
    filteredMasterDrugs,
    starterDrugsCount,
    proDrugsCount,
    enterpriseDrugsCount,
    fetchAnalytics,
    fetchPlans,
    createPlanTier,
    updatePlanTier,
    fetchTenants,
    createTenant,
    updateTenant,
    fetchMasterDrugs,
    createMasterDrug,
    updateMasterDrug,
    deleteMasterDrug,
    syncMasterCatalogToStores,
    fetchLogs
  };
});
