import { useSuperAdminStore } from '~/stores/superAdmin';
import { storeToRefs } from 'pinia';

export function useSuperAdmin() {
  const store = useSuperAdminStore();
  const refs = storeToRefs(store);

  return {
    ...refs,
    fetchAnalytics: store.fetchAnalytics,
    fetchPlans: store.fetchPlans,
    createPlanTier: store.createPlanTier,
    updatePlanTier: store.updatePlanTier,
    deletePlanTier: store.deletePlanTier,
    fetchTenants: store.fetchTenants,
    createTenant: store.createTenant,
    updateTenant: store.updateTenant,
    fetchMasterDrugs: store.fetchMasterDrugs,
    createMasterDrug: store.createMasterDrug,
    updateMasterDrug: store.updateMasterDrug,
    deleteMasterDrug: store.deleteMasterDrug,
    syncMasterCatalogToStores: store.syncMasterCatalogToStores,
    fetchLogs: store.fetchLogs
  };
}
