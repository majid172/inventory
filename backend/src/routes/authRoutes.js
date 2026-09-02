const express = require('express');
const router = express.Router();
const {
  registerTenant, login, superAdminLogin,
  getMe, logout, changePassword,
  createStaff, getStaff, updateStaff, deleteStaff
} = require('../controllers/authController');
const { verifyTokenMiddleware, requireRole, enforcePlanLimit } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with 1 minute / 5 attempts rate limiting
router.post('/register-tenant', authLimiter, registerTenant);
router.post('/onboard', authLimiter, registerTenant);
router.post('/login', authLimiter, login);
router.post('/super-admin/login', authLimiter, superAdminLogin);
router.post('/super-admin-login', authLimiter, superAdminLogin);
router.post('/logout', logout);

// Protected
router.get('/me', verifyTokenMiddleware, getMe);
router.put('/change-password', verifyTokenMiddleware, changePassword);

// Staff management (Tenant Admin only)
router.get('/staff',        verifyTokenMiddleware, requireRole('STORE_ADMIN', 'SUPER_ADMIN'), getStaff);
router.post('/staff',       verifyTokenMiddleware, requireRole('STORE_ADMIN'), enforcePlanLimit('users'), createStaff);
router.patch('/staff/:id',  verifyTokenMiddleware, requireRole('STORE_ADMIN'), updateStaff);
router.delete('/staff/:id', verifyTokenMiddleware, requireRole('STORE_ADMIN'), deleteStaff);


module.exports = router;
