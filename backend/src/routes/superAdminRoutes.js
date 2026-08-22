const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getTenants,
  createTenant,
  updateTenant,
  getPlans,
  createPlan,
  updatePlan,
  getMasterDrugs,
  createMasterDrug,
  updateMasterDrug,
  deleteMasterDrug,
  syncMasterDrugsToStores,
  getLogs
} = require('../controllers/superAdminController');

// Platform Analytics & Metrics
router.get('/analytics', getAnalytics);

// Subscriber Pharmacy Tenants Management
router.get('/tenants', getTenants);
router.post('/tenants', createTenant);
router.patch('/tenants/:id', updateTenant);

// Subscription Plan Tiers Config
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.patch('/plans/:id', updatePlan);

// Plan-Wise Global Master Drug Dictionary
router.get('/master-drugs', getMasterDrugs);
router.post('/master-drugs', createMasterDrug);
router.put('/master-drugs/:id', updateMasterDrug);
router.patch('/master-drugs/:id', updateMasterDrug);
router.delete('/master-drugs/:id', deleteMasterDrug);
router.post('/master-drugs/sync', syncMasterDrugsToStores);

// System Audit Logs & Security Telemetry
router.get('/logs', getLogs);

module.exports = router;
