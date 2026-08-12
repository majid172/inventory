const db = require('../config/db');

let defaultProducts = [
  { id: 1, productId: "PRD_001", name: "Espresso Double", category: "Hot Drinks", price: "3.50", cost: "0.45", taxRate: "8%", status: "AVAILABLE" },
  { id: 2, productId: "PRD_002", name: "Caramel Macchiato", category: "Hot Drinks", price: "4.80", cost: "0.95", taxRate: "8%", status: "AVAILABLE" },
  { id: 3, productId: "PRD_003", name: "Vanilla Latte", category: "Hot Drinks", price: "4.50", cost: "0.85", taxRate: "8%", status: "AVAILABLE" },
  { id: 4, productId: "PRD_004", name: "Flat White", category: "Hot Drinks", price: "4.20", cost: "0.75", taxRate: "8%", status: "AVAILABLE" },
  { id: 5, productId: "PRD_005", name: "Iced Americano", category: "Cold Drinks", price: "3.80", cost: "0.40", taxRate: "8%", status: "AVAILABLE" },
  { id: 6, productId: "PRD_006", name: "Cold Brew Coffee", category: "Cold Drinks", price: "4.00", cost: "0.50", taxRate: "8%", status: "AVAILABLE" },
  { id: 7, productId: "PRD_007", name: "Matcha Green Tea Latte", category: "Hot Drinks", price: "4.80", cost: "0.90", taxRate: "8%", status: "AVAILABLE" },
  { id: 8, productId: "PRD_008", name: "Butter Croissant", category: "Bakery", price: "2.90", cost: "0.80", taxRate: "8%", status: "AVAILABLE" },
  { id: 9, productId: "PRD_009", name: "Chocolate Muffin", category: "Bakery", price: "3.20", cost: "0.90", taxRate: "8%", status: "AVAILABLE" },
  { id: 10, productId: "PRD_010", name: "Blueberry Scone", category: "Bakery", price: "3.00", cost: "0.85", taxRate: "8%", status: "AVAILABLE" },
  { id: 11, productId: "PRD_011", name: "Avocado Toast", category: "Bakery", price: "7.50", cost: "2.20", taxRate: "8%", status: "AVAILABLE" },
  { id: 12, productId: "PRD_012", name: "Stainless Travel Mug", category: "Merchandise", price: "18.00", cost: "6.50", taxRate: "8%", status: "AVAILABLE" },
  { id: 13, productId: "PRD_013", name: "Coffee Beans (250g bag)", category: "Retail Coffee", price: "14.50", cost: "5.00", taxRate: "8%", status: "AVAILABLE" }
];

const getProducts = async (req, res, next) => {
  try {
    if (db && db.query) {
      const [rows] = await db.query('SELECT * FROM products ORDER BY id ASC');
      if (rows && rows.length > 0) {
        return res.json({ success: true, count: rows.length, data: rows });
      }
    }
  } catch (error) {
    // If DB query fails or table empty, fallback to default catalog
  }

  res.json({ success: true, count: defaultProducts.length, data: defaultProducts });
};

const createProduct = async (req, res, next) => {
  try {
    const newProduct = {
      id: defaultProducts.length + 1,
      productId: `PRD_${String(defaultProducts.length + 1).padStart(3, '0')}`,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    defaultProducts.push(newProduct);

    if (db && db.query) {
      await db.query(
        'INSERT INTO products (product_id, name, price, cost, status) VALUES (?, ?, ?, ?, ?)',
        [newProduct.productId, newProduct.name, newProduct.price, newProduct.cost, 'AVAILABLE']
      ).catch(() => {});
    }

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  createProduct
};
