import { ref } from 'vue';
import axios from 'axios';

export interface AdminCategory {
  id: number;
  category_id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

const categories = ref<AdminCategory[]>([]);

const loading = ref<boolean>(false);
const error = ref<string | null>(null);

export function useAdminCategories() {
  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get('/categories');
      const data = response.data?.data ?? response.data;
      if (Array.isArray(data)) {
        categories.value = data.map((item: any) => ({
          id: item.id,
          category_id: item.category_id || item.categoryId || `CAT_${String(item.id).padStart(3, '0')}`,
          name: item.name,
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : ''),
          status: item.status || 'ACTIVE',
          product_count: item.product_count ?? 0,
          created_at: item.created_at || item.createdAt
        }));
      }
    } catch (e: any) {
      console.error('Failed to fetch admin categories from API:', e);
      error.value = e.message || 'Failed to fetch categories';
    } finally {
      loading.value = false;
    }
  };

  const addCategory = async (newCat: { name: string; slug?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    loading.value = true;
    const catId = `CAT_${String(categories.value.length + 1).padStart(3, '0')}`;
    const slug = newCat.slug || newCat.name.toLowerCase().replace(/\s+/g, '-');
    const categoryObj: AdminCategory = {
      id: categories.value.length + 1,
      category_id: catId,
      name: newCat.name,
      slug: slug,
      status: newCat.status || 'ACTIVE',
      product_count: 0,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    try {
      const response = await axios.post('/categories', { categoryId: catId, name: newCat.name, slug, status: newCat.status || 'ACTIVE' });
      if (response.data) {
        await fetchCategories();
        return;
      }
    } catch (e) {
      console.warn('Backend offline, saving category locally.');
    }

    categories.value.push(categoryObj);
    loading.value = false;
  };

  const deleteCategory = (id: number) => {
    categories.value = categories.value.filter(c => c.id !== id);
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    deleteCategory
  };
}
