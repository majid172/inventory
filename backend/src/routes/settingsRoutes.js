const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { 
  verifyTokenMiddleware, 
  requireSuperAdmin, 
  requireTenantAccess,
  requireRole
} = require('../middleware/authMiddleware');

// ============================================================================
// SYSTEM SETTINGS ROUTES
// ============================================================================
// Anyone can fetch system settings (e.g. to check maintenance mode before login)
router.get('/system', settingsController.getSystemSettings);

// Only Super Admin can update system settings
router.post('/system', verifyTokenMiddleware, requireSuperAdmin, settingsController.updateSystemSettings);


// ============================================================================
// TENANT SETTINGS ROUTES
// ============================================================================
// Any logged in user in the tenant can fetch tenant settings
router.get('/tenant', verifyTokenMiddleware, requireTenantAccess, settingsController.getTenantSettings);

// Only STORE_ADMIN (or SUPER_ADMIN) can update tenant settings
router.post('/tenant', verifyTokenMiddleware, requireTenantAccess, requireRole('STORE_ADMIN', 'SUPER_ADMIN'), settingsController.updateTenantSettings);

module.exports = router;
