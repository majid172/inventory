import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export interface CategoryItem {
  id: number;
  category_id: string;
  categoryId?: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<CategoryItem[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await axios.get('/categories');
      
      if (Array.isArray(data.data)) {
        categories.value = data.data.map((item: any) => ({
          ...item,
          id: item.id,
          category_id: item.category_id || item.categoryId || `CAT_${String(item.id).padStart(3, '0')}`,
          name: item.name,
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : ''),
          status: item.status || 'ACTIVE',
          product_count: item.product_count ?? 0,
          created_at: item.created_at || item.createdAt
        }));
      }
    } catch (err: any) {
      console.error('Failed to fetch categories from API:', err);
      error.value = err.message || 'Failed to fetch categories';
    } finally {
      loading.value = false;
    }
  };

  const addCategory = async (payload: { name: string; slug?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    loading.value = true;
    const catId = `CAT_${String(categories.value.length + 1).padStart(3, '0')}`;
    const slug = payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-');
    const status = payload.status || 'ACTIVE';

    try {
      const response = await axios.post('/categories', {
        categoryId: catId,
        name: payload.name,
        slug,
        status
      });

      if (response.data && response.data.data) {
        await fetchCategories();
        return;
      }
    } catch (err) {
      console.warn('Backend offline, adding category to local Pinia store.');
    }

    categories.value.push({
      id: categories.value.length + 1,
      category_id: catId,
      name: payload.name,
      slug,
      status,
      product_count: 0,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });
    loading.value = false;
  };

  const updateCategory = async (id: number, payload: { name: string; slug?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    loading.value = true;
    const slug = payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-');
    const status = payload.status || 'ACTIVE';

    try {
      await axios.put(`/categories/${id}`, {
        name: payload.name,
        slug,
        status
      });
      await fetchCategories();
      return;
    } catch (err) {
      console.warn('Backend API offline, updating local category state.');
    }

    const index = categories.value.findIndex(c => c.id === id);
    if (index !== -1) {
      categories.value[index] = {
        ...categories.value[index],
        name: payload.name,
        slug,
        status
      };
    }
    loading.value = false;
  };

  const deleteCategory = async (id: number) => {
    loading.value = true;
    try {
      await axios.delete(`/categories/${id}`);
      await fetchCategories();
      return;
    } catch (err) {
      console.warn('Backend API offline, deleting from local category state.');
    }

    categories.value = categories.value.filter(c => c.id !== id);
    loading.value = false;
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
