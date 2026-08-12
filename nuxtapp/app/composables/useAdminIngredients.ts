import { ref } from 'vue';

export interface AdminIngredient {
  id: number;
  ingredient_id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unit: string;
  min_level: number;
  cost: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  supplier: string;
}

const ingredients = ref<AdminIngredient[]>([
  { id: 1, ingredient_id: "ING_001", name: "Espresso Beans (Dark Roast)", sku: "RAW-COF-001", category: "Coffee Beans", stock: 45, unit: "kg", min_level: 15, cost: 12.50, status: "IN STOCK", supplier: "Farm Co-op" },
  { id: 2, ingredient_id: "ING_002", name: "Whole Milk (Organic)", sku: "RAW-DAI-001", category: "Dairy", stock: 8, unit: "liters", min_level: 10, cost: 2.20, status: "LOW STOCK", supplier: "Dairy Fresh Inc." },
  { id: 3, ingredient_id: "ING_003", name: "Oat Milk (Barista Edition)", sku: "RAW-DAI-002", category: "Dairy Alternatives", stock: 24, unit: "liters", min_level: 5, cost: 3.40, status: "IN STOCK", supplier: "Oat Organic Ltd." },
  { id: 4, ingredient_id: "ING_004", name: "Vanilla Syrup (750ml)", sku: "RAW-SYR-001", category: "Sweeteners", stock: 12, unit: "bottles", min_level: 3, cost: 8.50, status: "IN STOCK", supplier: "Global Foods" },
  { id: 5, ingredient_id: "ING_005", name: "Paper Cups (12oz)", sku: "RAW-PAC-001", category: "Packaging", stock: 450, unit: "pcs", min_level: 100, cost: 0.15, status: "IN STOCK", supplier: "Eco Pack Co." }
]);

export function useAdminIngredients() {
  const addIngredient = (item: Partial<AdminIngredient>) => {
    const ingId = `ING_${String(ingredients.value.length + 1).padStart(3, '0')}`;
    const stockVal = item.stock || 10;
    const minVal = item.min_level || 5;
    const statusVal = stockVal === 0 ? 'OUT OF STOCK' : stockVal < minVal ? 'LOW STOCK' : 'IN STOCK';

    ingredients.value.push({
      id: ingredients.value.length + 1,
      ingredient_id: ingId,
      name: item.name || 'New Raw Ingredient',
      sku: item.sku || `RAW-NEW-${Date.now().toString().slice(-4)}`,
      category: item.category || 'General',
      stock: stockVal,
      unit: item.unit || 'kg',
      min_level: minVal,
      cost: item.cost || 5.00,
      status: statusVal,
      supplier: item.supplier || 'Farm Co-op'
    });
  };

  const deleteIngredient = (id: number) => {
    ingredients.value = ingredients.value.filter(i => i.id !== id);
  };

  return {
    ingredients,
    addIngredient,
    deleteIngredient
  };
}
