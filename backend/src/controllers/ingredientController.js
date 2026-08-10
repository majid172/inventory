let ingredients = [
  { id: 1, ingredientId: "ING_000", name: "Espresso Beans (Dark Roast)", sku: "RAW-COF-000", category: "Coffee Beans", stock: 45, unit: "kg", minLevel: 15, cost: "12.50", status: "IN STOCK" },
  { id: 2, ingredientId: "ING_001", name: "Whole Milk (Organic)", sku: "RAW-COF-001", category: "Dairy", stock: 60, unit: "liters", minLevel: 5, cost: "2.20", status: "IN STOCK" }
];

const getIngredients = (req, res) => {
  res.json({ success: true, count: ingredients.length, data: ingredients });
};

const createIngredient = (req, res) => {
  const newIng = {
    id: ingredients.length + 1,
    ingredientId: `ING_${String(ingredients.length).padStart(3, '0')}`,
    ...req.body
  };
  ingredients.push(newIng);
  res.status(201).json({ success: true, data: newIng });
};

module.exports = {
  getIngredients,
  createIngredient
};
