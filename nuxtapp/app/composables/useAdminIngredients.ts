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
  { id: 1, ingredient_id: "API_001", name: "Paracetamol Micronized Powder", sku: "API-PCM-001", category: "Active Chemical Powder", stock: 150, unit: "kg", min_level: 30, cost: 18.50, status: "IN STOCK", supplier: "Global Pharma Chem" },
  { id: 2, ingredient_id: "API_002", name: "Amoxicillin Trihydrate Compacted", sku: "API-AMX-001", category: "Antibacterial API", stock: 12, unit: "kg", min_level: 25, cost: 42.00, status: "LOW STOCK", supplier: "BioSynthetica Labs" },
  { id: 3, ingredient_id: "API_003", name: "Lactose Monohydrate (Binder)", sku: "EXC-LAC-001", category: "Excipients & Fillers", stock: 240, unit: "kg", min_level: 50, cost: 4.80, status: "IN STOCK", supplier: "FormuTech Supplies" },
  { id: 4, ingredient_id: "API_004", name: "Ethyl Alcohol 99.9% Medical Grade", sku: "SOL-ETH-001", category: "Solvents & Liquids", stock: 85, unit: "liters", min_level: 20, cost: 9.50, status: "IN STOCK", supplier: "PureChem International" },
  { id: 5, ingredient_id: "API_005", name: "Blister Foil PVC/PVDC Packaging Roll", sku: "PAC-BLI-001", category: "Primary Packaging", stock: 1200, unit: "meters", min_level: 300, cost: 0.85, status: "IN STOCK", supplier: "PharmaPack Co." }
]);

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
