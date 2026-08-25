const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes        = require('./routes/authRoutes');
const inventoryRoutes   = require('./routes/inventoryRoutes');
const salesRoutes       = require('./routes/salesRoutes');
const superAdminRoutes  = require('./routes/superAdminRoutes');
const plansRoutes       = require('./routes/plansRoutes');

// Legacy routes (kept for backward compat)
const productRoutes     = require('./routes/productRoutes');
const ingredientRoutes  = require('./routes/ingredientRoutes');
const categoryRoutes    = require('./routes/categoryRoutes');
const supplierRoutes    = require('./routes/supplierRoutes');

const app = express();

// ── Global Middlewares ──────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', service: 'PharmaCare SaaS API', version: '2.0.0' }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/plans',       plansRoutes);       // Public: plan listing
app.use('/api/inventory',   inventoryRoutes);   // Tenant: inventory, products, categories, reports
app.use('/api/sales',       salesRoutes);       // Tenant: POS, sales history
app.use('/api/super-admin', superAdminRoutes);  // Super Admin panel

// Legacy API mounts (maintained for existing frontend pages)
app.use('/api/products',    productRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/suppliers',   supplierRoutes);

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
