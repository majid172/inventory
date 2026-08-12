import { defineStore } from 'pinia';

export interface ProductItem {
  id: number;
  productId: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  taxRate: number;
  status: 'AVAILABLE' | 'OUT OF STOCK';
  icon?: string;
  updatedAt?: string;
}

const defaultProductsList: ProductItem[] = [
  { id: 1, productId: "PRD_001", name: "Espresso Double", category: "Hot Drinks", price: 3.50, cost: 0.45, taxRate: 8, status: "AVAILABLE", icon: "☕" },
  { id: 2, productId: "PRD_002", name: "Caramel Macchiato", category: "Hot Drinks", price: 4.80, cost: 0.95, taxRate: 8, status: "AVAILABLE", icon: "🥛" },
  { id: 3, productId: "PRD_003", name: "Vanilla Latte", category: "Hot Drinks", price: 4.50, cost: 0.85, taxRate: 8, status: "AVAILABLE", icon: "☕" },
  { id: 4, productId: "PRD_004", name: "Flat White", category: "Hot Drinks", price: 4.20, cost: 0.75, taxRate: 8, status: "AVAILABLE", icon: "☕" },
  { id: 5, productId: "PRD_005", name: "Iced Americano", category: "Cold Drinks", price: 3.80, cost: 0.40, taxRate: 8, status: "AVAILABLE", icon: "🧊" },
  { id: 6, productId: "PRD_006", name: "Cold Brew Coffee", category: "Cold Drinks", price: 4.00, cost: 0.50, taxRate: 8, status: "AVAILABLE", icon: "🧊" },
  { id: 7, productId: "PRD_007", name: "Matcha Green Tea Latte", category: "Hot Drinks", price: 4.80, cost: 0.90, taxRate: 8, status: "AVAILABLE", icon: "🍵" },
  { id: 8, productId: "PRD_008", name: "Butter Croissant", category: "Bakery", price: 2.90, cost: 0.80, taxRate: 8, status: "AVAILABLE", icon: "🥐" },
  { id: 9, productId: "PRD_009", name: "Chocolate Muffin", category: "Bakery", price: 3.20, cost: 0.90, taxRate: 8, status: "AVAILABLE", icon: "🧁" },
  { id: 10, productId: "PRD_010", name: "Blueberry Scone", category: "Bakery", price: 3.00, cost: 0.85, taxRate: 8, status: "AVAILABLE", icon: "🍪" },
  { id: 11, productId: "PRD_011", name: "Avocado Toast", category: "Bakery", price: 7.50, cost: 2.20, taxRate: 8, status: "AVAILABLE", icon: "🥑" },
  { id: 12, productId: "PRD_012", name: "Stainless Travel Mug", category: "Merchandise", price: 18.00, cost: 6.50, taxRate: 8, status: "AVAILABLE", icon: "🥤" },
  { id: 13, productId: "PRD_013", name: "Coffee Beans (250g bag)", category: "Retail Coffee", price: 14.50, cost: 5.00, taxRate: 8, status: "AVAILABLE", icon: "🫘" }
];

export const useProductStore = defineStore('products', {
  state: () => ({
    products: defaultProductsList as ProductItem[],
    activeCategory: 'All Items',
    searchQuery: '',
    loading: false
  }),

  getters: {
    filteredProducts: (state) => {
      const query = (state.searchQuery || '').trim().toLowerCase();
      const cat = (state.activeCategory || 'All Items').toLowerCase();

      return state.products.filter(p => {
        const matchesCategory = cat === "all items" || (p.category && p.category.toLowerCase() === cat);
        const matchesSearch = !query || 
                              (p.name && p.name.toLowerCase().includes(query)) || 
                              (p.productId && p.productId.toLowerCase().includes(query)) ||
                              (p.category && p.category.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
      });
    },

    categories: (state) => {
      const categoryNames = ["All Items", "Hot Drinks", "Cold Drinks", "Bakery", "Retail Coffee", "Merchandise"];
      return categoryNames.map((catName, index) => {
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
    }
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            this.products = json.data.map((item: any) => ({
              id: item.id,
              productId: item.productId || item.product_id || `PRD_${item.id}`,
              name: item.name,
              category: item.category || 'Hot Drinks',
              price: parseFloat(item.price) || 0,
              cost: parseFloat(item.cost) || 0,
              taxRate: parseFloat(item.taxRate || item.tax_rate) || 8,
              status: item.status || 'AVAILABLE',
              icon: item.category === 'Cold Drinks' ? '🧊' : item.category === 'Bakery' ? '🥐' : '☕'
            }));
          }
        }
      } catch (e) {
        console.warn('Backend API offline, using local Pinia products store.');
      } finally {
        this.loading = false;
      }
    },

    addProduct(newProd: Partial<ProductItem>) {
      const prodId = `PRD_${String(this.products.length + 1).padStart(3, '0')}`;
      const productObj: ProductItem = {
        id: this.products.length + 1,
        productId: prodId,
        name: newProd.name || 'New Coffee Item',
        category: newProd.category || 'Hot Drinks',
        price: newProd.price || 4.00,
        cost: newProd.cost || 0.80,
        taxRate: 8,
        status: 'AVAILABLE',
        icon: newProd.category === 'Cold Drinks' ? '🧊' : newProd.category === 'Bakery' ? '🥐' : '☕',
        updatedAt: new Date().toISOString()
      };
      this.products.push(productObj);
    },

    deleteProduct(id: number) {
      this.products = this.products.filter(p => p.id !== id);
    }
  }
});
