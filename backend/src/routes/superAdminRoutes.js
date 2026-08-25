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

// All super admin routes require valid JWT + SUPER_ADMIN role
router.use(verifyTokenMiddleware, requireSuperAdmin);

// Platform analytics dashboard
router.get('/analytics', getAnalytics);

// User management
router.get('/users',       getUsers);
router.post('/users',      createUser);
router.put('/users/:id',   updateUser);
router.delete('/users/:id', deleteUser);

// Platform maintenance & settings
router.get('/settings',              getPlatformSettings);
router.put('/settings',              updatePlatformSettings);
router.post('/maintenance/backup',   executeDatabaseBackup);
router.post('/maintenance/optimize', executeOptimizeDatabase);
router.post('/maintenance/cache',    executeClearCache);

// Tenant management
router.get('/tenants',       getTenants);
router.post('/tenants',      createTenant);
router.get('/tenants/:id',   getTenantById);
router.patch('/tenants/:id', updateTenant);
router.delete('/tenants/:id', deleteTenant);

// Subscription plan management
router.get('/plans',          getPlans);
router.post('/plans',         createPlan);
router.put('/plans/:id',      updatePlan);
router.patch('/plans/:id',    updatePlan);
router.delete('/plans/:id',   deletePlan);

// Master Drug Dictionary
router.get('/master-drugs',        getMasterDrugs);
router.post('/master-drugs',       createMasterDrug);
router.put('/master-drugs/:id',    updateMasterDrug);
router.delete('/master-drugs/:id', deleteMasterDrug);

// Payments & invoices
router.get('/payments', getAllPayments);

// System audit logs
router.get('/logs', getAuditLogs);

module.exports = router;
