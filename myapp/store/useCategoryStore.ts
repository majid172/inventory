import { create } from 'zustand';

export interface Category {
  id: number;
  categoryId: string;
  category_id?: string;
  name: string;
  slug: string;
  productCount?: number;
  status: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (categoryData: Partial<Category>) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      const data = await response.json();
      
      const rawCategories = data.data || [];
      const normalizedCategories: Category[] = rawCategories.map((item: any) => ({
        id: item.id,
        categoryId: item.category_id || item.categoryId || `CAT_${String(item.id).padStart(3, '0')}`,
        name: item.name,
        slug: item.slug || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : ''),
        productCount: item.productCount ?? item.product_count ?? 0,
        status: item.status || 'ACTIVE',
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: item.updated_at || item.updatedAt || new Date().toISOString()
      }));

      set({ categories: normalizedCategories, loading: false });
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      set({ error: err.message || 'Error fetching categories', loading: false });
    }
  },

  addCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      await get().fetchCategories();
    } catch (err: any) {
      console.error('Error creating category:', err);
      set({ error: err.message || 'Error creating category', loading: false });
    }
  }
}));
