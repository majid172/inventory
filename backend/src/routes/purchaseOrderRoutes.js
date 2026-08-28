const express = require('express');
const router = express.Router();
const { 
  getPurchaseOrders, 
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrder
} = require('../controllers/purchaseOrderController');

// Define routes
router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.get('/:id', getPurchaseOrderById);
router.put('/:id/status', updatePurchaseOrderStatus);
router.post('/:id/receive', receivePurchaseOrder);

module.exports = router;
