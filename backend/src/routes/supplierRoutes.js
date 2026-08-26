const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, updateSupplier } = require('../controllers/supplierController');

router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .put(updateSupplier);

module.exports = router;
