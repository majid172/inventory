const express = require('express');
const router = express.Router();
const {
  registerTenant, login, superAdminLogin,
  getMe, logout, changePassword,
  createStaff, getStaff, updateStaff
} = require('../controllers/authController');
const { verifyTokenMiddleware, requireRole, enforcePlanLimit } = require('../middleware/authMiddleware');

// Public
router.post('/register-tenant', registerTenant);
router.post('/onboard', registerTenant);
router.post('/login', login);
router.post('/super-admin/login', superAdminLogin);
router.post('/super-admin-login', superAdminLogin);
router.post('/logout', logout);

// Protected
router.get('/me', verifyTokenMiddleware, getMe);
router.put('/change-password', verifyTokenMiddleware, changePassword);

// Staff management (Tenant Admin only)
router.get('/staff',     verifyTokenMiddleware, requireRole('STORE_ADMIN', 'SUPER_ADMIN'), getStaff);
router.post('/staff',    verifyTokenMiddleware, requireRole('STORE_ADMIN'), enforcePlanLimit('users'), createStaff);
router.patch('/staff/:id', verifyTokenMiddleware, requireRole('STORE_ADMIN'), updateStaff);

module.exports = router;
