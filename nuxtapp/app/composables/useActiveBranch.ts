import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useAuth } from './useAuth';

export interface BranchItem {
  id: number;
  tenant_id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_main: number;
  status: string;
  terminals_count?: number;
  staff_count?: number;
}

const branchesState = ref<BranchItem[]>([]);
const selectedBranchIdState = ref<number | 'all'>('all');
const loadingBranchesState = ref(false);

export function useActiveBranch() {
  const { user, isSuperAdmin } = useAuth();

  const isStoreAdmin = computed(() => {
    const role = (user.value?.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
    return role === 'STOREADMIN' || role === 'TENANTOWNER' || role === 'SUPERADMIN' || isSuperAdmin.value;
  });

  const isBranchScoped = computed(() => {
    const role = (user.value?.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
    return role === 'BRANCHMANAGER' || role === 'MANAGER' || role === 'CASHIER';
  });

  const userBranchId = computed(() => {
    const u = user.value as any;
    return u?.branch_id || u?.branchId || null;
  });

  const userBranchName = computed(() => {
    const u = user.value as any;
    if (u?.branch_name) return u.branch_name;
    if (userBranchId.value && branchesState.value.length > 0) {
      const match = branchesState.value.find(b => Number(b.id) === Number(userBranchId.value));
      if (match) return match.name;
    }
    return null;
  });

  const initActiveBranch = () => {
    if (isBranchScoped.value && userBranchId.value) {
      selectedBranchIdState.value = Number(userBranchId.value);
    } else if (process.client) {
      const saved = localStorage.getItem('selected_branch_id');
      if (saved && saved !== 'all' && !isNaN(Number(saved))) {
        selectedBranchIdState.value = Number(saved);
      } else {
        selectedBranchIdState.value = 'all';
      }
    }
  };

  const setSelectedBranch = (branchId: number | 'all') => {
    if (isBranchScoped.value && userBranchId.value) {
      // Branch Manager / Cashier cannot switch to other branches
      selectedBranchIdState.value = Number(userBranchId.value);
      return;
    }
    selectedBranchIdState.value = branchId;
    if (process.client) {
      localStorage.setItem('selected_branch_id', String(branchId));
    }
  };

  const fetchBranches = async () => {
    loadingBranchesState.value = true;
    try {
      const res = await axios.get('/branches');
      if (res.data && res.data.success) {
        branchesState.value = res.data.branches || res.data.data || [];
        initActiveBranch();
      }
    } catch (err) {
      console.warn('Could not fetch branches from API:', err);
    } finally {
      loadingBranchesState.value = false;
    }
  };

  const selectedBranch = computed(() => {
    if (selectedBranchIdState.value === 'all') return null;
    return branchesState.value.find(b => Number(b.id) === Number(selectedBranchIdState.value)) || null;
  });

  const branchQueryParam = computed(() => {
    if (isBranchScoped.value && userBranchId.value) {
      return Number(userBranchId.value);
    }
    return selectedBranchIdState.value;
  });

  return {
    branches: branchesState,
    selectedBranchId: selectedBranchIdState,
    selectedBranch,
    isStoreAdmin,
    isBranchScoped,
    userBranchId,
    userBranchName,
    loadingBranches: loadingBranchesState,
    initActiveBranch,
    setSelectedBranch,
    fetchBranches,
    branchQueryParam
  };
}
