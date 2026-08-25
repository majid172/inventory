import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface CategoryItem {
  id: number;
  category_id?: string;
  categoryId?: string;
  name: string;
  description?: string;
  slug?: string;
  status: number | 'ACTIVE' | 'INACTIVE';
  statusLabel?: string;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<CategoryItem[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
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

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        headers: getHeaders()
      });
      const data = await res.json();
      
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data.categories) ? data.categories : []);
      categories.value = list.map((item: any) => {
        const isAct = item.status === 1 || item.status === '1' || item.status === 'ACTIVE' || item.status === true;
        return {
          id: item.id,
          category_id: `CAT_${item.id}`,
          categoryId: `CAT_${item.id}`,
          name: item.name,
          description: item.description || '',
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
          status: isAct ? 1 : 0,
          statusLabel: isAct ? 'ACTIVE' : 'INACTIVE',
          product_count: parseInt(item.product_count ?? item.productCount ?? 0, 10) || 0,
          created_at: item.created_at || item.createdAt
        };
      });
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      error.value = err.message || 'Failed to fetch categories';
    } finally {
      loading.value = false;
    }
  };

  const addCategory = async (payload: { name: string; description?: string; status?: number | string }) => {
    loading.value = true;
    console.log(payload);
    
    try {
      const statusInt = (payload.status === 0 || payload.status === '0' || payload.status === 'INACTIVE') ? 0 : 1;
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: payload.name,
          description: payload.description || '',
          status: statusInt
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save category in MySQL');
      }

      await fetchCategories();
      return data.data;
    } catch (err: any) {
      console.error('Error adding category:', err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: number, payload: { name: string; description?: string; status?: number | string }) => {
    loading.value = true;
    try {
      const statusInt = (payload.status === 0 || payload.status === '0' || payload.status === 'INACTIVE') ? 0 : 1;
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: payload.name,
          description: payload.description || '',
          status: statusInt
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update category in MySQL');
      }

      await fetchCategories();
      return data.data;
    } catch (err: any) {
      console.error('Error updating category:', err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: number) => {
    loading.value = true;
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category in MySQL');
      }
      await fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
});
