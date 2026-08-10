const express = require('express');
const router = express.Router();
const { getIngredients, createIngredient } = require('../controllers/ingredientController');

router.route('/')
  .get(getIngredients)
  .post(createIngredient);

module.exports = router;
