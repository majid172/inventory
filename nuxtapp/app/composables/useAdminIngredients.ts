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

const ingredients = ref<AdminIngredient[]>([]);

export function useAdminIngredients() {
  const addIngredient = (item: Partial<AdminIngredient>) => {
    const ingId = `API_${String(ingredients.value.length + 1).padStart(3, '0')}`;
    const stockVal = item.stock || 10;
    const minVal = item.min_level || 5;
    const statusVal = stockVal === 0 ? 'OUT OF STOCK' : stockVal < minVal ? 'LOW STOCK' : 'IN STOCK';

    ingredients.value.push({
      id: ingredients.value.length + 1,
      ingredient_id: ingId,
      name: item.name || 'New Active Chemical Compound',
      sku: item.sku || `API-NEW-${Date.now().toString().slice(-4)}`,
      category: item.category || 'Active Chemical Powder',
      stock: stockVal,
      unit: item.unit || 'kg',
      min_level: minVal,
      cost: item.cost || 25.00,
      status: statusVal,
      supplier: item.supplier || 'Global Pharma Chem'
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
