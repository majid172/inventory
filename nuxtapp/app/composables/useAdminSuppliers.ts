import { ref, onMounted } from 'vue';
import axios from 'axios';

export interface AdminSupplier {
  id: number;
  supplier_id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  due_amount?: number;
}

export function useAdminSuppliers() {
  const suppliers = ref<AdminSupplier[]>([]);
  const loading = ref(false);

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.client) {
      const savedStore = localStorage.getItem('active_tenant_store');
      if (savedStore) {
        try {
          const store = JSON.parse(savedStore);
          if (store && store.id) headers['x-tenant-id'] = String(store.id);
        } catch (e) {}
      }
    }
    return headers;
  };

  const fetchSuppliers = async () => {
    loading.value = true;
    try {
      const res = await axios.get('/suppliers');
      const data = res.data;
      if (data && data.success) {
        suppliers.value = data.data;
      }
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    } finally {
      loading.value = false;
    }
  };

  const addSupplier = async (sup: Partial<AdminSupplier>) => {
    loading.value = true;
    try {
      const res = await axios.post('/suppliers', sup);
      const data = res.data;
      if (data && data.success) {
        suppliers.value.unshift(data.data);
      }
    } catch (err) {
      console.error('Failed to create supplier', err);
    } finally {
      loading.value = false;
    }
  };

  const updateSupplier = async (id: number, sup: Partial<AdminSupplier>) => {
    loading.value = true;
    try {
      const res = await axios.put(`/suppliers/${id}`, sup);
      const data = res.data;
      if (data && data.success) {
        await fetchSuppliers();
      }
    } catch (err) {
      console.error('Failed to update supplier', err);
    } finally {
      loading.value = false;
    }
  };

  const deleteSupplier = (id: number) => {
    suppliers.value = suppliers.value.filter(s => s.id !== id);
  };

  onMounted(() => {
    fetchSuppliers();
  });

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSuppliers
  };
}
