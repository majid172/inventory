let products = [
  { id: 1, productId: "PRD_000", name: "Espresso Double", category: "Hot Drinks", price: "3.50", cost: "0.45", taxRate: "8%", status: "AVAILABLE", updatedAt: "2026-08-10 12:00:00 AM" },
  { id: 2, productId: "PRD_001", name: "Caramel Macchiato", category: "Hot Drinks", price: "4.80", cost: "0.95", taxRate: "8%", status: "AVAILABLE", updatedAt: "2026-08-10 12:05:00 AM" },
  { id: 3, productId: "PRD_002", name: "Vanilla Latte", category: "Hot Drinks", price: "4.50", cost: "0.85", taxRate: "8%", status: "AVAILABLE", updatedAt: "2026-08-10 12:10:00 AM" }
];

const getProducts = (req, res) => {
  res.json({ success: true, count: products.length, data: products });
};

const createProduct = (req, res) => {
  const newProduct = {
    id: products.length + 1,
    productId: `PRD_${String(products.length).padStart(3, '0')}`,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
};

module.exports = {
  getProducts,
  createProduct
};
