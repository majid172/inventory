import { computed } from 'vue';
import { useProductStore, type ProductItem } from '~/stores/products';

export function useAdminProducts() {
  const store = useProductStore();

  const products = computed(() => store.products);
  const loading = computed(() => store.loading);

  const fetchProducts = async () => {
    await store.fetchProducts();
  };

  const addProduct = async (newProd: Partial<ProductItem>) => {
    await store.addProduct(newProd);
  };

  const updateProduct = async (id: number, updatedProd: Partial<ProductItem>) => {
    await store.updateProduct(id, updatedProd);
  };

  const deleteProduct = async (id: number) => {
    await store.deleteProduct(id);
  };

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
}
