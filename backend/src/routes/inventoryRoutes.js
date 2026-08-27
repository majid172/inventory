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
  getProfitLossReport, getExpiryLossReport
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
router.get('/products',        getProducts);
router.get('/products/:id',    getProductById);
router.post('/products',       requireRole('STORE_ADMIN','PHARMACIST'), enforcePlanLimit('products'), createProduct);
router.put('/products/:id',    requireRole('STORE_ADMIN','PHARMACIST'), updateProduct);
router.patch('/products/:id',  requireRole('STORE_ADMIN','PHARMACIST'), updateProduct);
router.delete('/products/:id', requireRole('STORE_ADMIN'), deleteProduct);

// Categories
router.get('/categories',        getCategories);
router.post('/categories',       requireRole('STORE_ADMIN'), createCategory);
router.put('/categories/:id',    requireRole('STORE_ADMIN'), updateCategory);
router.delete('/categories/:id', requireRole('STORE_ADMIN'), deleteCategory);

// Suppliers
router.get('/suppliers',        getSuppliers);
router.post('/suppliers',       requireRole('STORE_ADMIN'), createSupplier);
router.put('/suppliers/:id',    requireRole('STORE_ADMIN'), updateSupplier);

// Inventory batches
router.get('/batches', getBatches);

// Stock operations
router.post('/stock-in',  requireRole('STORE_ADMIN','PHARMACIST'), stockIn);
router.post('/stock-out', requireRole('STORE_ADMIN','PHARMACIST'), stockOut);

// Reports
router.get('/reports/sales',       getSalesReport);
router.get('/reports/stock',       getStockReport);
router.get('/reports/expiry',      getExpiryReport);
router.get('/reports/profit-loss', getProfitLossReport);
router.get('/reports/expiry-loss', getExpiryLossReport);

module.exports = router;

