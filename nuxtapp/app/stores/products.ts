import { defineStore } from 'pinia';

export interface ProductItem {
  id: number;
  tenantId?: string | number;
  masterDrugId?: number | null;
  productType?: 'medicine' | 'general';
  name: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  categoryId?: number | string;
  category?: string;
  barcode?: string;
  price: number;
  cost: number;
  taxRate?: number;
  status: number | string;
  statusLabel?: string;
  is_active?: number;
  isActive?: number;
  rxRequired?: boolean;
  batchNumber?: string;
  expiryDate?: string;
  manufacturer?: string;
  rackLocation?: string;
  stockQuantity?: number;
  minReorderLevel?: number;
  created_at?: string;
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
        // POS only shows Active products (status column = 1)
        const isActive = p.is_active === 1 || p.isActive === 1 || p.is_active === undefined;
        const matchesCategory = cat === "all items" || (p.category && p.category.toLowerCase() === cat);
        const matchesSearch = !query ||
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.genericName && p.genericName.toLowerCase().includes(query)) ||
          (p.batchNumber && p.batchNumber.toLowerCase().includes(query)) ||
          (p.manufacturer && p.manufacturer.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query));
        return isActive && matchesCategory && matchesSearch;
      });
    },
    expiringSoonCount: (state) => {
      const today = new Date();
      return state.products.filter(p => {
        if (!p.expiryDate || p.expiryDate === '-') return false;
        const exp = new Date(p.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 90 && diffDays > 0;
      }).length;
    },
    rxProductsCount: (state) => {
      return state.products.filter(p => !!p.rxRequired).length;
    }
  },

  actions: {
    getHeaders() {
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
          } catch (e) { }
        }

        const savedStore = localStorage.getItem('active_tenant_store');
        if (savedStore && !headers['x-tenant-id']) {
          try {
            const store = JSON.parse(savedStore);
            if (store && store.id) headers['x-tenant-id'] = String(store.id);
          } catch (e) { }
        }
      }
      return headers;
    },

    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const res = await fetch('http://localhost:5000/api/products', {
          headers: this.getHeaders()
        });
        const json = await res.json();
        const itemsList = json && Array.isArray(json.data) 
          ? json.data 
          : (json && Array.isArray(json.products) 
              ? json.products 
              : (Array.isArray(json) ? json : []));

        if (Array.isArray(itemsList)) {
          this.products = itemsList.map((item: any) => ({
            id: item.id,
            tenantId: item.tenantId || item.tenant_id,
            masterDrugId: item.master_drug_id || item.masterDrugId || null,
            productType: item.master_drug_id ? 'medicine' : 'general',
            name: item.name,
            genericName: item.genericName || item.generic_name || item.name,
            dosageForm: item.dosageForm || item.dosage_form || '-',
            strength: item.strength || '-',
            categoryId: item.categoryId || item.category_id,
            category: item.category || item.category_name || 'General',
            barcode: item.barcode || `MED-${item.id}`,
            price: parseFloat(item.price ?? item.retail_price ?? 0) || 0,
            cost: parseFloat(item.cost ?? item.purchase_price ?? 0) || 0,
            taxRate: 0,
            status: item.status !== undefined ? item.status : 1,
            statusLabel: (item.status === 1 || item.status === '1' || item.statusLabel === 'Available') ? 'Available' : 'Out of Stock',
            is_active: item.is_active !== undefined ? Number(item.is_active) : (item.isActive !== undefined ? Number(item.isActive) : 1),
            isActive: item.is_active !== undefined ? Number(item.is_active) : (item.isActive !== undefined ? Number(item.isActive) : 1),
            rxRequired: !!(item.rxRequired || item.rx_required),
            batchNumber: item.batchNumber || item.batch_number || '-',
            expiryDate: item.expiryDate || (item.expiry_date ? String(item.expiry_date).split('T')[0] : '-'),
            manufacturer: item.manufacturer || item.supplier_name || '',
            rackLocation: item.rackLocation || item.rack_location || '',
            stockQuantity: parseInt(item.stockQuantity ?? item.stock_quantity ?? item.total_stock ?? 0, 10),
            minReorderLevel: parseInt(item.minReorderLevel ?? item.min_reorder_level ?? 10, 10),
            created_at: item.created_at
          }));
        }
      } catch (e: any) {
        console.error('Failed to fetch products:', e.message);
        this.error = e.message || 'Failed to fetch products';
      } finally {
        this.loading = false;
      }
    },

    deductProductStock(items: { id: number; quantity: number }[]) {
      for (const it of items) {
        const prod = this.products.find(p => p.id === it.id);
        if (prod && prod.stockQuantity !== undefined) {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - it.quantity);
          if (prod.stockQuantity <= 0) {
            prod.statusLabel = 'Out of Stock';
          }
        }
      }
    },

    async addProduct(newProd: Partial<ProductItem>) {
      this.loading = true;
      try {
        const isMed = newProd.productType === 'medicine';
        const payload = {
          productType: newProd.productType || (newProd.genericName ? 'medicine' : 'general'),
          name: newProd.name,
          genericName: isMed ? (newProd.genericName || newProd.name) : '',
          dosageForm: isMed ? (newProd.dosageForm || 'Tablet') : '',
          strength: isMed ? (newProd.strength || 'Standard') : '',
          categoryId: newProd.categoryId || null,
          category: newProd.category,
          price: newProd.price || 0,
          cost: newProd.cost || 0,
          barcode: newProd.barcode,
          rxRequired: isMed ? (newProd.rxRequired ?? false) : false,
          batchNumber: newProd.batchNumber || '',
          expiryDate: newProd.expiryDate || '',
          manufacturer: newProd.manufacturer || '',
          rackLocation: newProd.rackLocation || 'Shelf A-01',
          stockQuantity: newProd.stockQuantity || 0,
          minReorderLevel: newProd.minReorderLevel || 10
        };

        const res = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to create product in MySQL');
        }

        await this.fetchProducts();
        return data.data;
      } catch (e: any) {
        console.error('Failed to add product:', e.message);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id: number, updatedProd: Partial<ProductItem>) {
      this.loading = true;
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updatedProd)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to update product in MySQL');
        }

        await this.fetchProducts();
        return data.data;
      } catch (e: any) {
        console.error('Failed to update product:', e.message);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id: number) {
      this.loading = true;
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders()
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to delete product in MySQL');
        }
        await this.fetchProducts();
      } catch (e: any) {
        console.error('Failed to delete product:', e.message);
        throw e;
      } finally {
        this.loading = false;
      }
    }
  }
});
