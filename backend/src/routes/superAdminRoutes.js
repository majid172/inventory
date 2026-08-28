const express = require('express');
const router = express.Router();
const {
  getAnalytics, getTenants, getTenantById, createTenant, updateTenant, deleteTenant,
  getPlans, createPlan, updatePlan, deletePlan,
  getMasterDrugs, createMasterDrug, updateMasterDrug, deleteMasterDrug,
  getAllPayments, getAuditLogs,
  getUsers, createUser, updateUser, deleteUser,
  getPlatformSettings, updatePlatformSettings, executeDatabaseBackup, executeOptimizeDatabase, executeClearCache
} = require('../controllers/superAdminController');
const { verifyTokenMiddleware, requireSuperAdmin } = require('../middleware/authMiddleware');

// All super admin routes require valid JWT token
router.use(verifyTokenMiddleware);

// Platform analytics dashboard
router.get('/analytics', requireSuperAdmin, getAnalytics);

// User management
router.get('/users', requireSuperAdmin, getUsers);
router.post('/users', requireSuperAdmin, createUser);
router.put('/users/:id', requireSuperAdmin, updateUser);
router.delete('/users/:id', requireSuperAdmin, deleteUser);

// Platform maintenance & settings
router.get('/settings', requireSuperAdmin, getPlatformSettings);
router.put('/settings', requireSuperAdmin, updatePlatformSettings);
router.post('/maintenance/backup', requireSuperAdmin, executeDatabaseBackup);
router.post('/maintenance/optimize', requireSuperAdmin, executeOptimizeDatabase);
router.post('/maintenance/cache', requireSuperAdmin, executeClearCache);

// Tenant management
router.get('/tenants', requireSuperAdmin, getTenants);
router.post('/tenants', requireSuperAdmin, createTenant);
router.get('/tenants/:id', requireSuperAdmin, getTenantById);
router.patch('/tenants/:id', requireSuperAdmin, updateTenant);
router.delete('/tenants/:id', requireSuperAdmin, deleteTenant);

// Subscription plan management
router.get('/plans', getPlans);
router.post('/plans', requireSuperAdmin, createPlan);
router.put('/plans/:id', requireSuperAdmin, updatePlan);
router.patch('/plans/:id', requireSuperAdmin, updatePlan);
router.delete('/plans/:id', requireSuperAdmin, deletePlan);

// Master Drug Dictionary
router.get('/master-drugs', getMasterDrugs);
router.post('/master-drugs', requireSuperAdmin, createMasterDrug);
router.put('/master-drugs/:id', requireSuperAdmin, updateMasterDrug);
router.delete('/master-drugs/:id', requireSuperAdmin, deleteMasterDrug);

// Payments & invoices (Dynamically filtered in controller by user role & tenant_id)
router.get('/payments', getAllPayments);

// System audit logs
router.get('/logs', requireSuperAdmin, getAuditLogs);

module.exports = router;
