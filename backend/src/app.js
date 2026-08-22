const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const productRoutes = require('./routes/productRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

const app = express();

// Global Middlewares
app.use(cors(corsOptions));
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
app.use('/api/super-admin', superAdminRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
