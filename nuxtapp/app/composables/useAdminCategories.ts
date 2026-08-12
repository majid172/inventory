import { ref } from 'vue';

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

const categories = ref<AdminCategory[]>([
  { id: 1, category_id: "CAT_001", name: "Hot Drinks", slug: "hot-drinks", status: "ACTIVE", product_count: 5, created_at: "2026-08-10 10:00:00" },
  { id: 2, category_id: "CAT_002", name: "Cold Drinks", slug: "cold-drinks", status: "ACTIVE", product_count: 2, created_at: "2026-08-10 10:15:00" },
  { id: 3, category_id: "CAT_003", name: "Bakery", slug: "bakery", status: "ACTIVE", product_count: 4, created_at: "2026-08-10 10:30:00" },
  { id: 4, category_id: "CAT_004", name: "Retail Coffee", slug: "retail-coffee", status: "ACTIVE", product_count: 1, created_at: "2026-08-11 09:00:00" },
  { id: 5, category_id: "CAT_005", name: "Merchandise", slug: "merchandise", status: "ACTIVE", product_count: 1, created_at: "2026-08-11 09:30:00" }
]);

const loading = ref<boolean>(false);
const error = ref<string | null>(null);

export function useAdminCategories() {
  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          categories.value = json.data;
        }
      }
    } catch (e: any) {
      console.warn('Backend API offline, using local categories data.');
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
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: catId, name: newCat.name, slug, status: newCat.status || 'ACTIVE' })
      });
      if (res.ok) {
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
