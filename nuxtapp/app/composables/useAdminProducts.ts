import { ref } from 'vue';

export interface AdminProduct {
  id: number;
  product_id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  tax_rate: number;
  status: 'AVAILABLE' | 'OUT OF STOCK';
  created_at?: string;
  updated_at?: string;
}

const products = ref<AdminProduct[]>([
  { id: 1, product_id: "PRD_001", name: "Espresso Double", category: "Hot Drinks", price: 3.50, cost: 0.45, tax_rate: 8, status: "AVAILABLE", created_at: "2026-08-10 12:00:00" },
  { id: 2, product_id: "PRD_002", name: "Caramel Macchiato", category: "Hot Drinks", price: 4.80, cost: 0.95, tax_rate: 8, status: "AVAILABLE", created_at: "2026-08-10 12:05:00" },
  { id: 3, product_id: "PRD_003", name: "Vanilla Latte", category: "Hot Drinks", price: 4.50, cost: 0.85, tax_rate: 8, status: "AVAILABLE", created_at: "2026-08-10 12:10:00" },
  { id: 4, product_id: "PRD_004", name: "Iced Americano", category: "Cold Drinks", price: 3.80, cost: 0.40, tax_rate: 8, status: "AVAILABLE", created_at: "2026-08-10 12:15:00" },
  { id: 5, product_id: "PRD_005", name: "Butter Croissant", category: "Bakery", price: 2.90, cost: 0.80, tax_rate: 8, status: "AVAILABLE", created_at: "2026-08-11 08:30:00" },
  { id: 6, product_id: "PRD_006", name: "Chocolate Muffin", category: "Bakery", price: 3.20, cost: 0.90, tax_rate: 8, status: "AVAILABLE", created_at: "2026-08-11 08:40:00" }
]);

const loading = ref<boolean>(false);

export function useAdminProducts() {
  const fetchProducts = async () => {
    loading.value = true;
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          products.value = json.data.map((item: any) => ({
            id: item.id,
            product_id: item.productId || item.product_id,
            name: item.name,
            category: item.category || 'Hot Drinks',
            price: parseFloat(item.price) || 0,
            cost: parseFloat(item.cost) || 0,
            tax_rate: parseFloat(item.taxRate || item.tax_rate) || 8,
            status: item.status || 'AVAILABLE',
            created_at: item.createdAt || item.created_at || new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      console.warn('Backend API offline, using local product catalog.');
    } finally {
      loading.value = false;
    }
  };

  const addProduct = (newProd: Partial<AdminProduct>) => {
    const prodId = `PRD_${String(products.value.length + 1).padStart(3, '0')}`;
    const productObj: AdminProduct = {
      id: products.value.length + 1,
      product_id: prodId,
      name: newProd.name || 'New Coffee Product',
      category: newProd.category || 'Hot Drinks',
      price: newProd.price || 4.00,
      cost: newProd.cost || 0.80,
      tax_rate: 8,
      status: 'AVAILABLE',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    products.value.push(productObj);
  };

  const deleteProduct = (id: number) => {
    products.value = products.value.filter(p => p.id !== id);
  };

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    deleteProduct
  };
}
