import { computed } from 'vue';
import { useProductStore, type ProductItem } from '~/stores/products';

export function usePOSProducts() {
  const store = useProductStore();

  const products = computed(() => store.products);
  const activeCategory = computed({
    get: () => store.activeCategory,
    set: (val) => { store.activeCategory = val; }
  });
  const searchQuery = computed({
    get: () => store.searchQuery,
    set: (val) => { store.searchQuery = val; }
  });
  const loading = computed(() => store.loading);
  const categories = computed(() => store.categories);
  const filteredProducts = computed(() => store.filteredProducts);

  const fetchProducts = async () => {
    // POS typically needs the entire active catalog loaded for fast offline-capable filtering
    await store.fetchProducts(1, 10000);
  };

  return {
    products,
    categories,
    activeCategory,
    searchQuery,
    loading,
    filteredProducts,
    fetchProducts
  };
}
