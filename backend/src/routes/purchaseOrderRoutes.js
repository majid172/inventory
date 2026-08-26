const express = require('express');
const router = express.Router();
const { getPurchaseOrders, createPurchaseOrder } = require('../controllers/purchaseOrderController');

// Define routes
router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);

module.exports = router;
