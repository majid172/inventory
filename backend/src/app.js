const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const productRoutes = require('./routes/productRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Root Hello World Endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API Routes Mount
app.use('/api/products', productRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
