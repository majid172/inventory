const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById } = require('../controllers/salesController');
const { verifyTokenMiddleware, requireTenantAccess, requireActiveSubscription } = require('../middleware/authMiddleware');

router.use(verifyTokenMiddleware, requireTenantAccess, requireActiveSubscription);

router.get('/',    getSales);
router.post('/',   createSale);
router.get('/:id', getSaleById);

module.exports = router;
