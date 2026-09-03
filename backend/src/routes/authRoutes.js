const express = require('express');
const router = express.Router();
const {
  registerTenant, login, superAdminLogin,
  getMe, logout, changePassword,
  createStaff, getStaff, updateStaff, deleteStaff
} = require('../controllers/authController');
const { forgotPassword, resetPassword, verifyResetToken } = require('../controllers/passwordResetController');
const { verifyTokenMiddleware, requireRole, enforcePlanLimit } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register-tenant', authLimiter, registerTenant);
router.post('/onboard', authLimiter, registerTenant);
router.post('/login', authLimiter, login);
router.post('/super-admin/login', authLimiter, superAdminLogin);
router.post('/super-admin-login', authLimiter, superAdminLogin);
router.post('/logout', logout);

// ── Password Reset (public, rate-limited) ───────────────────────────────────
router.post('/forgot-password',     authLimiter, forgotPassword);
router.get('/verify-reset-token',   verifyResetToken);
router.post('/reset-password',      authLimiter, resetPassword);

// Protected
router.get('/me', verifyTokenMiddleware, getMe);
router.put('/change-password', verifyTokenMiddleware, changePassword);

// Staff management (Tenant Admin & Branch Manager)
router.get('/staff',        verifyTokenMiddleware, requireRole('STORE_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'), getStaff);
router.post('/staff',       verifyTokenMiddleware, requireRole('STORE_ADMIN', 'BRANCH_MANAGER'), enforcePlanLimit('users'), createStaff);
router.patch('/staff/:id',  verifyTokenMiddleware, requireRole('STORE_ADMIN', 'BRANCH_MANAGER'), updateStaff);
router.delete('/staff/:id', verifyTokenMiddleware, requireRole('STORE_ADMIN'), deleteStaff);


module.exports = router;
