const express = require('express');
const router = express.Router();
const { login, superAdminLogin, getMe } = require('../controllers/authController');
const { verifyTokenMiddleware } = require('../middleware/authMiddleware');

// Public Authentication Endpoints
router.post('/login', login);
router.post('/super-admin-login', superAdminLogin);

// Protected Auth Profile Endpoint
router.get('/me', verifyTokenMiddleware, getMe);

module.exports = router;
