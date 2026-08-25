// Public route — return active plans from MySQL subscription_plans table
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/plans — Public plan listing for landing page and onboarding
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subscription_plans ORDER BY id ASC');
    const plans = rows.map(r => {
      let features = {};
      try {
        features = typeof r.features === 'string' ? JSON.parse(r.features || '{}') : (r.features || {});
      } catch (e) {
        features = {};
      }

      const price = parseFloat(r.price) || parseFloat(r.price_monthly) || 0;
      const durationDays = parseInt(r.duration_days, 10) || 30;
      const maxTerminals = parseInt(r.max_terminals, 10) || parseInt(r.terminals_limit, 10) || 1;
      const maxUsers = parseInt(r.max_users, 10) || 5;
      const maxProducts = parseInt(r.max_products, 10) || 500;

      return {
        id: r.id?.toString() || '',
        name: r.name || '',
        price,
        priceMonthly: price,
        price_monthly: price,
        priceYearly: price * 10,
        price_yearly: price * 10,
        durationDays,
        duration_days: durationDays,
        maxTerminals,
        max_terminals: maxTerminals,
        terminalsLimit: maxTerminals,
        terminals_limit: maxTerminals,
        maxUsers,
        max_users: maxUsers,
        maxProducts,
        max_products: maxProducts,
        features,
        created_at: r.created_at || null
      };
    });

    return res.json({
      success: true,
      plans,
      data: plans
    });
  } catch (err) {
    console.error('GET /api/plans error:', err.message);
    res.status(500).json({ success: false, message: `Database Query Error: ${err.message}` });
  }
});

module.exports = router;
