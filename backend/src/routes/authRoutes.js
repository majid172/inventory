const express = require('express');
const router = express.Router();
const { 
  login, 
  superAdminLogin, 
  register, 
  getMe, 
  changePin, 
  logout,
  onboardTenant
} = require('../controllers/authController');
const { verifyTokenMiddleware } = require('../middleware/authMiddleware');

// Public Authentication Endpoints
router.post('/login', login);
router.post('/super-admin-login', superAdminLogin);
router.post('/register', register);
router.post('/onboard', onboardTenant);
router.post('/logout', logout);

// Protected Auth Profile & Credential Endpoints
router.get('/me', verifyTokenMiddleware, getMe);
router.put('/change-pin', verifyTokenMiddleware, changePin);

module.exports = router;
