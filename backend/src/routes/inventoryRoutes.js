const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  stockIn, stockOut,
  getSuppliers, createSupplier, updateSupplier,
  getBatches,
  getMySubscription,
  getSalesReport, getStockReport, getExpiryReport,
  getProfitLossReport, getExpiryLossReport,
  getTerminals, registerTerminal, deleteTerminal
} = require('../controllers/inventoryController');
const {
  verifyTokenMiddleware, requireTenantAccess, requireActiveSubscription,
  requireRole, enforcePlanLimit
} = require('../middleware/authMiddleware');

// All inventory routes require auth + active tenant
router.use(verifyTokenMiddleware, requireTenantAccess, requireActiveSubscription);

// Dashboard
router.get('/dashboard', getDashboard);

// Subscription info
router.get('/my-subscription', getMySubscription);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', requireRole('STORE_ADMIN', 'PHARMACIST'), enforcePlanLimit('products'), createProduct);
router.put('/products/:id', requireRole('STORE_ADMIN', 'PHARMACIST'), updateProduct);
router.patch('/products/:id', requireRole('STORE_ADMIN', 'PHARMACIST'), updateProduct);
router.delete('/products/:id', requireRole('STORE_ADMIN'), deleteProduct);

// Categories
router.get('/categories', getCategories);
router.post('/categories', requireRole('STORE_ADMIN'), createCategory);
router.put('/categories/:id', requireRole('STORE_ADMIN'), updateCategory);
router.delete('/categories/:id', requireRole('STORE_ADMIN'), deleteCategory);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', requireRole('STORE_ADMIN'), createSupplier);
router.put('/suppliers/:id', requireRole('STORE_ADMIN'), updateSupplier);

// Inventory batches
router.get('/batches', getBatches);

// Stock operations
router.post('/stock-in', requireRole('STORE_ADMIN', 'PHARMACIST'), stockIn);
router.post('/stock-out', requireRole('STORE_ADMIN', 'PHARMACIST'), stockOut);

// Reports (Admin & Pharmacist only)
router.get('/reports/sales', requireRole('STORE_ADMIN', 'PHARMACIST'), getSalesReport);
router.get('/reports/stock', requireRole('STORE_ADMIN', 'PHARMACIST'), getStockReport);
router.get('/reports/expiry', requireRole('STORE_ADMIN', 'PHARMACIST'), getExpiryReport);
router.get('/reports/profit-loss', requireRole('STORE_ADMIN'), getProfitLossReport);
router.get('/reports/expiry-loss', requireRole('STORE_ADMIN', 'PHARMACIST'), getExpiryLossReport);

// POS Terminals (Plan Limit Checked)
router.get('/terminals', getTerminals);
router.post('/terminals', enforcePlanLimit('terminals'), registerTerminal);
router.delete('/terminals/:id', requireRole('STORE_ADMIN'), deleteTerminal);

module.exports = router;


