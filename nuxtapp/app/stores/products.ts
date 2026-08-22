import { defineStore } from 'pinia';
import axios from 'axios';

export interface ProductItem {
  id: number;
  productId?: string;
  name: string;
  genericName?: string;
  dosageForm?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Eye Drops' | 'Inhaler' | 'Supplies';
  strength?: string;
  categoryId?: number | string;
  category: string;
  price: number;
  cost: number;
  taxRate: number;
  status: 'AVAILABLE' | 'OUT OF STOCK';
  rxRequired?: boolean;
  batchNumber?: string;
  expiryDate?: string;
  manufacturer?: string;
  rackLocation?: string;
  stockQuantity?: number;
  minReorderLevel?: number;
  icon?: string;
  updatedAt?: string;
}

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [] as ProductItem[],
    activeCategory: 'All Items',
    searchQuery: '',
    loading: false,
    error: null as string | null
  }),

  getters: {
    filteredProducts: (state) => {
      const query = (state.searchQuery || '').trim().toLowerCase();
      const cat = (state.activeCategory || 'All Items').toLowerCase();

      return state.products.filter(p => {
        const matchesCategory = cat === "all items" || (p.category && p.category.toLowerCase() === cat);
        const matchesSearch = !query || 
                              (p.name && p.name.toLowerCase().includes(query)) || 
                              (p.genericName && p.genericName.toLowerCase().includes(query)) ||
                              (p.batchNumber && p.batchNumber.toLowerCase().includes(query)) ||
                              (p.category && p.category.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
      });
    },

    categories: (state) => {
      const dynamicCats = ["All Items", ...new Set(state.products.map(p => p.category).filter(Boolean))];

      return dynamicCats.map((catName, index) => {
        const count = catName === "All Items" 
          ? state.products.length 
          : state.products.filter(p => p.category && p.category.toLowerCase() === catName.toLowerCase()).length;

        return {
          id: index,
          categoryId: `CAT_${String(index).padStart(3, '0')}`,
          name: catName,
          slug: catName.toLowerCase().replace(/\s+/g, '-'),
          count
        };
      });
    },

    rxProductsCount: (state) => state.products.filter(p => p.rxRequired).length,
    lowStockCount: (state) => state.products.filter(p => (p.stockQuantity || 0) <= (p.minReorderLevel || 10)).length,
    expiringSoonCount: (state) => {
      const today = new Date();
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);
      return state.products.filter(p => {
        if (!p.expiryDate) return false;
        const exp = new Date(p.expiryDate);
        return exp <= ninetyDaysFromNow;
      }).length;
    }
  },

  actions: {
    // ALWAYS fetch products dynamically from API database endpoint
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/products');
        const json = response.data;
        const itemsList = json && json.data ? json.data : (Array.isArray(json) ? json : []);

        if (Array.isArray(itemsList)) {
          this.products = itemsList.map((item: any) => ({
            id: item.id,
            productId: item.productId || item.product_id || `MED_${item.id}`,
            name: item.name,
            genericName: item.genericName || item.generic_name || item.name,
            dosageForm: item.dosageForm || item.dosage_form || 'Tablet',
            strength: item.strength || '',
            categoryId: item.categoryId || item.category_id,
            category: item.category || item.category_name || 'General',
            price: parseFloat(item.price) || 0,
            cost: parseFloat(item.cost) || 0,
            taxRate: parseFloat(item.taxRate || item.tax_rate) || 0,
            status: item.status || 'AVAILABLE',
            rxRequired: !!(item.rxRequired || item.rx_required),
            batchNumber: item.batchNumber || item.batch_number || `BATCH-${item.id}`,
            expiryDate: item.expiryDate || (item.expiry_date ? String(item.expiry_date).split('T')[0] : '2027-12-31'),
            manufacturer: item.manufacturer || '',
            rackLocation: item.rackLocation || item.rack_location || '',
            stockQuantity: item.stockQuantity || item.stock_quantity || 0,
            minReorderLevel: item.minReorderLevel || item.min_reorder_level || 0,
            icon: item.dosageForm === 'Syrup' ? '🧪' : item.dosageForm === 'Ointment' ? '🩹' : item.dosageForm === 'Inhaler' ? '🌬️' : item.dosageForm === 'Supplies' ? '🩺' : '💊'
          }));
        }
      } catch (e: any) {
        console.error('Failed to fetch products from API:', e.message);
        this.error = e.message || 'Failed to fetch products';
      } finally {
        this.loading = false;
      }
    },

    // Save product directly to database API
    async addProduct(newProd: Partial<ProductItem>) {
      this.loading = true;
      try {
        const payload = {
          name: newProd.name,
          genericName: newProd.genericName || newProd.name,
          dosageForm: newProd.dosageForm || 'Tablet',
          strength: newProd.strength || '',
          categoryId: newProd.categoryId || 1,
          category: newProd.category,
          price: newProd.price || 0,
          cost: newProd.cost || 0,
          taxRate: newProd.taxRate || 0,
          status: newProd.status || 'AVAILABLE',
          rxRequired: newProd.rxRequired ?? false,
          batchNumber: newProd.batchNumber || '',
          expiryDate: newProd.expiryDate || '',
          manufacturer: newProd.manufacturer || '',
          rackLocation: newProd.rackLocation || '',
          stockQuantity: newProd.stockQuantity || 0,
          minReorderLevel: newProd.minReorderLevel || 0
        };

        await axios.post('/products', payload);
        await this.fetchProducts();
      } catch (e: any) {
        console.error('Failed to add product to API:', e);
      } finally {
        this.loading = false;
      }
    },

    // Update product directly in database API
    async updateProduct(id: number, updatedProd: Partial<ProductItem>) {
      this.loading = true;
      try {
        await axios.put(`/products/${id}`, updatedProd);
        await this.fetchProducts();
      } catch (e: any) {
        console.error('Failed to update product in API:', e);
      } finally {
        this.loading = false;
      }
    },

    // Delete product directly from database API
    async deleteProduct(id: number) {
      this.loading = true;
      try {
        await axios.delete(`/products/${id}`);
        await this.fetchProducts();
      } catch (e: any) {
        console.error('Failed to delete product from API:', e);
      } finally {
        this.loading = false;
      }
    }
  }
});
