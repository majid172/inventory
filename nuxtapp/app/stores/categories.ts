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
  const categories = ref<CategoryItem[]>([
    { id: 1, category_id: "CAT_001", name: "Hot Drinks", slug: "hot-drinks", status: "ACTIVE", product_count: 5, created_at: "2026-08-10 10:00:00" },
    { id: 2, category_id: "CAT_002", name: "Cold Drinks", slug: "cold-drinks", status: "ACTIVE", product_count: 2, created_at: "2026-08-10 10:15:00" },
    { id: 3, category_id: "CAT_003", name: "Bakery", slug: "bakery", status: "ACTIVE", product_count: 4, created_at: "2026-08-10 10:30:00" },
    { id: 4, category_id: "CAT_004", name: "Retail Coffee", slug: "retail-coffee", status: "ACTIVE", product_count: 1, created_at: "2026-08-11 09:00:00" },
    { id: 5, category_id: "CAT_005", name: "Merchandise", slug: "merchandise", status: "ACTIVE", product_count: 1, created_at: "2026-08-11 09:30:00" }
  ]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      const data = response.data.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        categories.value = data.map((item: any) => ({
          ...item,
          category_id: item.category_id || item.categoryId || `CAT_${String(item.id).padStart(3, '0')}`,
          status: item.status || 'ACTIVE'
        }));
      }
    } catch (err: any) {
      console.warn('Backend API offline, using local categories store fallback.');
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
      const response = await axios.post('http://localhost:5000/api/categories', {
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
      await axios.put(`http://localhost:5000/api/categories/${id}`, {
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
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
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
