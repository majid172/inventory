
const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    // req.tenantId is already sanitized & set by verifyTokenMiddleware.
    // Fallback chain: JWT token tenantId → x-tenant-id header → 1
    const tid = req.tenantId || 1;

    // Debug log to trace which tenant is being queried
    console.log(`[getDashboard] tenantId=${tid} user=${req.user?.id} role=${req.user?.role}`);

    let todaySale = { today_revenue: 0, today_sales: 0 };
    try {
      const [[resToday]] = await db.query(
        `SELECT COALESCE(SUM(total), 0) AS today_revenue, COUNT(*) AS today_sales
         FROM sales WHERE tenant_id = ? AND (DATE(created_at) = CURDATE() OR DATE(created_at) = CURRENT_DATE())`,
        [tid]
      );
      if (resToday) todaySale = resToday;
    } catch (e) {
      console.warn('[getDashboard] todaySale query error:', e.message);
    }

    let monthSale = { month_revenue: 0, month_sales: 0 };
    try {
      const [[resMonth]] = await db.query(
        `SELECT COALESCE(SUM(total), 0) AS month_revenue, COUNT(*) AS month_sales
         FROM sales WHERE tenant_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
        [tid]
      );
      if (resMonth) monthSale = resMonth;
    } catch (e) {
      console.warn('[getDashboard] monthSale query error:', e.message);
    }

    let prodStats = { total_products: 0, rx_products: 0 };
    try {
      const [[resProd]] = await db.query(
        `SELECT 
           COUNT(*) AS total_products,
           COALESCE(SUM(CASE WHEN rx_required = 1 THEN 1 ELSE 0 END), 0) AS rx_products
         FROM products WHERE tenant_id = ?`,
        [tid]
      );
      if (resProd) prodStats = resProd;
    } catch (e) {
      console.warn('[getDashboard] prodStats query error:', e.message);
      try {
        const [[resProdFallback]] = await db.query(
          `SELECT COUNT(*) AS total_products, 0 AS rx_products FROM products WHERE tenant_id = ?`,
          [tid]
        );
        if (resProdFallback) prodStats = resProdFallback;
      } catch (e2) {}
    }

    let expiryStats = { near_expiry_count: 0 };
    try {
      const [[resExp]] = await db.query(
        `SELECT COUNT(*) AS near_expiry_count
         FROM inventory_batches
         WHERE tenant_id = ? AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
           AND quantity > 0`,
        [tid]
      );
      if (resExp) expiryStats = resExp;
    } catch (e) {
      console.warn('[getDashboard] expiryStats query error:', e.message);
    }

    // 5. 7-Day Revenue Trend (Dynamic Daily Aggregates with local date formatting)
    let trendRows = [];
    try {
      const [rows] = await db.query(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m-%d') AS sale_date,
           DATE_FORMAT(created_at, '%a') AS day_label,
           COALESCE(SUM(total), 0) AS daily_revenue,
           COUNT(*) AS daily_invoices
         FROM sales
         WHERE tenant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), DATE_FORMAT(created_at, '%a')
         ORDER BY sale_date ASC`,
        [tid]
      );
      if (rows) trendRows = rows;
    } catch (e) {
      console.warn('[getDashboard] trendRows query error:', e.message);
    }

    // Format 7 days continuous trend (Local timezone safe)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const matched = trendRows.find(r => String(r.sale_date).startsWith(dateStr));
      last7Days.push({
        date: dateStr,
        label: dayLabel,
        value: matched ? parseFloat(matched.daily_revenue || 0) : 0,
        invoices: matched ? parseInt(matched.daily_invoices || 0, 10) : 0
      });
    }
    const total7DayRevenue = last7Days.reduce((acc, curr) => acc + curr.value, 0);

    // 5b. 30-Day Revenue Trend
    let trend30Rows = [];
    try {
      const [rows] = await db.query(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m-%d') AS sale_date,
           DATE_FORMAT(created_at, '%d %b') AS day_label,
           COALESCE(SUM(total), 0) AS daily_revenue,
           COUNT(*) AS daily_invoices
         FROM sales
         WHERE tenant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), DATE_FORMAT(created_at, '%d %b')
         ORDER BY sale_date ASC`,
        [tid]
      );
      if (rows) trend30Rows = rows;
    } catch (e) {
      console.warn('[getDashboard] trend30Rows error:', e.message);
    }

    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayLabel = `${day}/${month}`;
      const matched = trend30Rows.find(r => String(r.sale_date).startsWith(dateStr));
      last30Days.push({
        date: dateStr,
        label: dayLabel,
        value: matched ? parseFloat(matched.daily_revenue || 0) : 0,
        invoices: matched ? parseInt(matched.daily_invoices || 0, 10) : 0
      });
    }
    const total30DayRevenue = last30Days.reduce((acc, curr) => acc + curr.value, 0);

    // 5c. Monthly Trend (Last 12 Months)
    let monthlyRows = [];
    try {
      const [rows] = await db.query(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m') AS month_key,
           DATE_FORMAT(created_at, '%b') AS month_label,
           COALESCE(SUM(total), 0) AS monthly_revenue,
           COUNT(*) AS monthly_invoices
         FROM sales
         WHERE tenant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
         ORDER BY month_key ASC`,
        [tid]
      );
      if (rows) monthlyRows = rows;
    } catch (e) {
      console.warn('[getDashboard] monthlyRows error:', e.message);
    }

    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const matched = monthlyRows.find(r => String(r.month_key) === monthKey);
      last12Months.push({
        date: monthKey,
        label: monthLabel,
        value: matched ? parseFloat(matched.monthly_revenue || 0) : 0,
        invoices: matched ? parseInt(matched.monthly_invoices || 0, 10) : 0
      });
    }
    const totalMonthlyRevenue = last12Months.reduce((acc, curr) => acc + curr.value, 0);

    // 6. Top Dispensed Medicines Breakdown
    let topMedicines = [];
    try {
      const [rows] = await db.query(
        `SELECT 
           COALESCE(p.name, si.product_name, 'Medicine') AS name,
           COALESCE(SUM(si.quantity), 0) AS units_sold,
           COALESCE(SUM(si.subtotal), 0) AS revenue
         FROM sale_items si
         JOIN sales s ON si.sale_id = s.id
         LEFT JOIN products p ON si.product_id = p.id
         WHERE s.tenant_id = ?
         GROUP BY COALESCE(p.name, si.product_name, 'Medicine')
         ORDER BY units_sold DESC
         LIMIT 5`,
        [tid]
      );
      if (rows) topMedicines = rows;
    } catch (e) {
      console.warn('[getDashboard] topMedicines error:', e.message);
    }

    // 7. Recent 5 Sales Transactions (Live Feed matching Orders Page)
    let recentSales = [];
    try {
      const [rows] = await db.query(
        `SELECT 
           s.id,
           s.invoice_no,
           s.created_at,
           DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i') AS formatted_date,
           COALESCE(NULLIF(TRIM(s.customer_phone), ''), 'Walk-in Patient') AS patient,
           UPPER(COALESCE(s.payment_method, 'CASH')) AS payment_method,
           s.transaction_no,
           UPPER(COALESCE(s.status, 'COMPLETED')) AS status,
           COALESCE(s.total, 0) AS total,
           COALESCE(s.subtotal, s.total) AS subtotal,
           COALESCE(s.discount, 0) AS discount,
           COALESCE(s.paid_amount, s.total) AS paid_amount,
           COALESCE(s.due_amount, 0) AS due_amount,
           'Pharmacist' AS cashier_name,
           (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id = s.id) AS items_count,
           (SELECT GROUP_CONCAT(CONCAT(si.quantity, 'x ', COALESCE(p2.name, si.product_name, 'Medicine')) SEPARATOR ', ')
            FROM sale_items si
            LEFT JOIN products p2 ON si.product_id = p2.id
            WHERE si.sale_id = s.id) AS items_summary
         FROM sales s
         WHERE s.tenant_id = ?
         ORDER BY s.id DESC
         LIMIT 5`,
        [tid]
      );
      if (rows) recentSales = rows;
    } catch (e) {
      console.warn('[getDashboard] recentSales error:', e.message);
    }

    console.log(`[getDashboard] recentSales count=${recentSales.length} for tenant=${tid}`);

    // 8. Low Stock Alerts
    let lowStockAlerts = [];
    try {
      const [rows] = await db.query(
        `SELECT p.id, p.name, p.reorder_level, p.rack_location,
                COALESCE(SUM(ib.quantity), 0) AS stock_quantity
         FROM products p
         LEFT JOIN inventory_batches ib ON p.id = ib.product_id AND p.tenant_id = ib.tenant_id
         WHERE p.tenant_id = ?
         GROUP BY p.id, p.name, p.reorder_level, p.rack_location
         HAVING stock_quantity <= p.reorder_level
         LIMIT 10`,
        [tid]
      );
      if (rows) lowStockAlerts = rows;
    } catch (e) {
      console.warn('[getDashboard] lowStockAlerts error:', e.message);
    }

    // 9. FEFO Near Expiry Batches (<90 days)
    let nearExpiryAlerts = [];
    try {
      const [rows] = await db.query(
        `SELECT ib.id, p.name, ib.batch_number, ib.expiry_date, ib.quantity,
                p.rack_location,
                DATEDIFF(ib.expiry_date, CURDATE()) AS days_until_expiry
         FROM inventory_batches ib 
         JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
         WHERE ib.tenant_id = ? AND ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
           AND ib.quantity > 0
         ORDER BY ib.expiry_date ASC LIMIT 6`,
        [tid]
      );
      if (rows) nearExpiryAlerts = rows;
    } catch (e) {
      console.warn('[getDashboard] nearExpiryAlerts error:', e.message);
    }

    return res.json({
      success: true,
      dashboard: {
        todayRevenue: parseFloat(todaySale?.today_revenue || 0),
        todaySales: parseInt(todaySale?.today_sales || 0, 10),
        monthRevenue: parseFloat(monthSale?.month_revenue || 0),
        monthSales: parseInt(monthSale?.month_sales || 0, 10),
        totalProducts: parseInt(prodStats?.total_products || 0, 10),
        rxProductsCount: parseInt(prodStats?.rx_products || 0, 10),
        lowStockCount: lowStockAlerts.length,
        nearExpiryCount: parseInt(expiryStats?.near_expiry_count || 0, 10),
        revenueTrend7Days: last7Days,
        total7DayRevenue,
        revenueTrend30Days: last30Days,
        total30DayRevenue,
        revenueTrendMonthly: last12Months,
        totalMonthlyRevenue,
        topMedicines,
        recentSales,
        lowStockAlerts,
        nearExpiryAlerts
      }
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. SUBSCRIPTION INFO
// ─────────────────────────────────────────────────────────────────────────────
const getMySubscription = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [[sub]] = await db.query(
      `SELECT ts.*, sp.name AS plan_name, sp.price, sp.duration_days, sp.max_terminals, sp.max_users, sp.max_products, sp.features
       FROM tenant_subscriptions ts
       JOIN subscription_plans sp ON ts.plan_id = sp.id
       WHERE ts.tenant_id = ? ORDER BY ts.id DESC LIMIT 1`,
      [tid]
    );

    return res.json({
      success: true,
      subscription: sub || {
        status: 'active',
        plan_name: 'Pro Plan',
        max_terminals: 3,
        max_users: 5,
        max_products: 500
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRODUCTS CRUD
// ─────────────────────────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { search, category_id } = req.query;

    let sql = `
      SELECT p.*, 
             c.name AS category_name, 
             md.generic_name, 
             md.dosage_form, 
             md.manufacturer, 
             md.rx_required,
             COALESCE((
               SELECT SUM(ib.quantity) 
               FROM inventory_batches ib 
               WHERE ib.product_id = p.id
             ), 0) AS total_stock,
             COALESCE((
               SELECT SUM(ib.quantity) 
               FROM inventory_batches ib 
               WHERE ib.product_id = p.id
             ), 0) AS stock_quantity,
             COALESCE((
               SELECT ib.purchase_price
               FROM inventory_batches ib
               WHERE ib.product_id = p.id
               ORDER BY ib.id DESC LIMIT 1
             ), 0) AS cost
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN master_drugs md ON p.master_drug_id = md.id
      WHERE p.tenant_id = ?
    `;
    const params = [tid];

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.barcode LIKE ? OR md.generic_name LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }

    sql += ' ORDER BY p.id DESC';
    const [rows] = await db.query(sql, params);

    return res.json({ success: true, count: rows.length, data: rows, products: rows });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [[prod]] = await db.query(
      `SELECT p.*, c.name AS category_name, md.generic_name, md.dosage_form, md.manufacturer, md.rx_required
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN master_drugs md ON p.master_drug_id = md.id
       WHERE p.id = ? AND p.tenant_id = ?`,
      [req.params.id, tid]
    );

    if (!prod) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, product: prod, data: prod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { master_drug_id, category_id, name, barcode, retail_price, reorder_level, rack_location } = req.body;

    if (!name || retail_price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and retail price are required.' });
    }

    const [r] = await db.query(
      `INSERT INTO products (tenant_id, master_drug_id, category_id, name, barcode, retail_price, reorder_level, rack_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tid, master_drug_id || null, category_id || null, name, barcode || null, parseFloat(retail_price), parseInt(reorder_level, 10) || 10, rack_location || null]
    );

    const [[created]] = await db.query('SELECT * FROM products WHERE id = ?', [r.insertId]);
    return res.status(201).json({ success: true, message: 'Product created successfully.', data: created, product: created });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const id = req.params.id;
    const { master_drug_id, category_id, name, barcode, retail_price, reorder_level, rack_location } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (master_drug_id !== undefined) { updates.push('master_drug_id = ?'); params.push(master_drug_id || null); }
    if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id || null); }
    if (barcode !== undefined) { updates.push('barcode = ?'); params.push(barcode || null); }
    if (retail_price !== undefined) { updates.push('retail_price = ?'); params.push(parseFloat(retail_price)); }
    if (reorder_level !== undefined) { updates.push('reorder_level = ?'); params.push(parseInt(reorder_level, 10)); }
    if (rack_location !== undefined) { updates.push('rack_location = ?'); params.push(rack_location || null); }

    if (updates.length > 0) {
      params.push(id, tid);
      await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, params);
    }

    const [[updated]] = await db.query('SELECT * FROM products WHERE id = ? AND tenant_id = ?', [id, tid]);
    return res.json({ success: true, message: 'Product updated successfully.', data: updated, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    await db.query('DELETE FROM products WHERE id = ? AND tenant_id = ?', [req.params.id, tid]);
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. CATEGORIES CRUD
// ─────────────────────────────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [rows] = await db.query('SELECT * FROM categories WHERE tenant_id = ? ORDER BY name ASC', [tid]);
    return res.json({ success: true, count: rows.length, data: rows, categories: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const [r] = await db.query('INSERT INTO categories (tenant_id, name, description) VALUES (?, ?, ?)', [tid, name, description || '']);
    const [[created]] = await db.query('SELECT * FROM categories WHERE id = ?', [r.insertId]);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, description, status } = req.body;
    const statusInt = (status === 0 || status === '0' || status === 'INACTIVE' || status === false) ? 0 : 1;

    await db.query(
      'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [name, description || '', statusInt, req.params.id, tid]
    );

    // Cascade deactivation to products
    try {
      await db.query(
        'UPDATE products SET status = ? WHERE category_id = ? AND tenant_id = ?',
        [statusInt, req.params.id, tid]
      );
    } catch (e) {}

    return res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const catId = req.params.id;

    // Deletion Guard: Check if products exist in this category
    const [[prodCount]] = await db.query(
      'SELECT COUNT(*) AS count FROM products WHERE category_id = ? AND tenant_id = ?',
      [catId, tid]
    );

    const count = prodCount ? parseInt(prodCount.count, 10) : 0;
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `এই ক্যাটাগরিতে ${count}টি মেডিসিন রয়েছে! ডিলিট করার আগে মেডিসিনগুলো অন্য ক্যাটাগরিতে সরান।`
      });
    }

    await db.query('DELETE FROM categories WHERE id = ? AND tenant_id = ?', [catId, tid]);
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. INVENTORY BATCHES (FEFO Tracking) & Stock In / Out
// ─────────────────────────────────────────────────────────────────────────────
const getBatches = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { product_id } = req.query;
    let sql = `
      SELECT ib.*, p.name AS product_name, s.name AS supplier_name
      FROM inventory_batches ib
      JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
      LEFT JOIN suppliers s ON ib.supplier_id = s.id
      WHERE ib.tenant_id = ?
    `;
    const params = [tid];
    if (product_id) {
      sql += ' AND ib.product_id = ?';
      params.push(product_id);
    }
    sql += ' ORDER BY ib.expiry_date ASC';
    const [rows] = await db.query(sql, params);
    return res.json({ success: true, data: rows, batches: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { product_id, supplier_id, batch_number, expiry_date, quantity, purchase_price } = req.body;

    if (!product_id || !batch_number || !expiry_date || quantity === undefined || purchase_price === undefined) {
      return res.status(400).json({ success: false, message: 'Missing batch required fields.' });
    }

    const [r] = await db.query(
      `INSERT INTO inventory_batches (tenant_id, product_id, supplier_id, batch_number, expiry_date, quantity, purchase_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tid, product_id, supplier_id || null, batch_number, expiry_date, parseInt(quantity, 10), parseFloat(purchase_price)]
    );

    const [[created]] = await db.query('SELECT * FROM inventory_batches WHERE id = ?', [r.insertId]);
    return res.status(201).json({ success: true, message: 'Batch added successfully.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const stockIn = async (req, res) => {
  return createBatch(req, res);
};

const stockOut = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { batch_id, quantity } = req.body;
    await db.query('UPDATE inventory_batches SET quantity = GREATEST(0, quantity - ?) WHERE id = ? AND tenant_id = ?', [parseInt(quantity, 10), batch_id, tid]);
    return res.json({ success: true, message: 'Stock deducted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SUPPLIERS CRUD
// ─────────────────────────────────────────────────────────────────────────────
const getSuppliers = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [rows] = await db.query('SELECT * FROM suppliers WHERE tenant_id = ? ORDER BY name ASC', [tid]);
    return res.json({ success: true, data: rows, suppliers: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, contact_person, phone, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Supplier name is required.' });

    const [r] = await db.query('INSERT INTO suppliers (tenant_id, name, contact_person, phone, address) VALUES (?, ?, ?, ?, ?)', [tid, name, contact_person || '', phone || '', address || '']);
    const [[created]] = await db.query('SELECT * FROM suppliers WHERE id = ?', [r.insertId]);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, contact_person, phone, address } = req.body;
    await db.query('UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, address = ? WHERE id = ? AND tenant_id = ?', [name, contact_person || '', phone || '', address || '', req.params.id, tid]);
    return res.json({ success: true, message: 'Supplier updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPREHENSIVE FINANCIAL & INVENTORY REPORTS
// ─────────────────────────────────────────────────────────────────────────────
const getSalesReport = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [rows] = await db.query('SELECT * FROM sales WHERE tenant_id = ? ORDER BY id DESC LIMIT 100', [tid]);
    return res.json({ success: true, report: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStockReport = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [rows] = await db.query(
      `SELECT p.name, COALESCE(p.retail_price, 0) AS retail_price, p.reorder_level, COALESCE(SUM(ib.quantity), 0) AS total_stock
       FROM products p
       LEFT JOIN inventory_batches ib ON p.id = ib.product_id AND p.tenant_id = ib.tenant_id
       WHERE p.tenant_id = ?
       GROUP BY p.id`,
      [tid]
    );
    return res.json({ success: true, report: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getExpiryReport = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [rows] = await db.query(
      `SELECT p.name, ib.batch_number, ib.expiry_date, ib.quantity, DATEDIFF(ib.expiry_date, CURDATE()) AS days_left
       FROM inventory_batches ib
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       WHERE ib.tenant_id = ? AND ib.quantity > 0
       ORDER BY ib.expiry_date ASC`,
      [tid]
    );
    return res.json({ success: true, report: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Profit & Loss (P&L / COGS) Comprehensive Report ──────────────────────────
const getProfitLossReport = async (req, res) => {
  try {
    const tid = (req.user && req.user.tenantId && !isNaN(parseInt(req.user.tenantId, 10)) ? parseInt(req.user.tenantId, 10) : null)
      || (!isNaN(parseInt(req.tenantId, 10)) ? parseInt(req.tenantId, 10) : null)
      || (req.headers && req.headers['x-tenant-id'] && !isNaN(parseInt(req.headers['x-tenant-id'], 10)) ? parseInt(req.headers['x-tenant-id'], 10) : null)
      || 1;
    const { period = 'all', startDate, endDate } = req.query;

    let dateCondition = '';
    const params = [tid];

    if (startDate && endDate) {
      dateCondition = 'AND DATE(s.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (period === 'today') {
      dateCondition = 'AND (DATE(s.created_at) = CURDATE() OR DATE(s.created_at) = CURRENT_DATE())';
    } else if (period === 'yesterday') {
      dateCondition = 'AND DATE(s.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
    } else if (period === '7days') {
      dateCondition = 'AND DATE(s.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === '30days') {
      dateCondition = 'AND DATE(s.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (period === 'this_month') {
      dateCondition = 'AND YEAR(s.created_at) = YEAR(CURDATE()) AND MONTH(s.created_at) = MONTH(CURDATE())';
    } else if (period === 'last_month') {
      dateCondition = 'AND YEAR(s.created_at) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(s.created_at) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)';
    } else if (period === 'this_year') {
      dateCondition = 'AND YEAR(s.created_at) = YEAR(CURDATE())';
    } else if (period === 'all') {
      dateCondition = '';
    } else {
      dateCondition = '';
    }

    // 1. Overall Financial Summary KPIs from sales table (prevents duplication)
    const [[salesAgg]] = await db.query(
      `SELECT 
         COUNT(*) AS total_invoices,
         COALESCE(SUM(subtotal), 0) AS gross_sales,
         COALESCE(SUM(discount), 0) AS total_discounts,
         COALESCE(SUM(tax), 0) AS total_tax,
         COALESCE(SUM(total), 0) AS net_revenue,
         COALESCE(SUM(paid_amount), 0) AS total_collected,
         COALESCE(SUM(due_amount), 0) AS total_due
       FROM sales s
       WHERE s.tenant_id = ? ${dateCondition}`,
      params
    );

    // 2. COGS and Units sold from sale_items table
    const [[cogsAgg]] = await db.query(
      `SELECT 
         COALESCE(SUM(si.quantity), 0) AS total_units_sold,
         COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price, 
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70, 
             0
           )
         ), 0) AS total_cogs
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       LEFT JOIN products p ON si.product_id = p.id
       LEFT JOIN inventory_batches ib ON si.batch_id = ib.id
       WHERE s.tenant_id = ? ${dateCondition}`,
      params
    );

    const grossSales = parseFloat(salesAgg?.gross_sales || 0);
    const totalDiscounts = parseFloat(salesAgg?.total_discounts || 0);
    const totalTax = parseFloat(salesAgg?.total_tax || 0);
    const netRevenue = parseFloat(salesAgg?.net_revenue || (grossSales - totalDiscounts + totalTax) || 0);
    const totalCogs = parseFloat(cogsAgg?.total_cogs || 0);
    const grossProfit = netRevenue - totalCogs;
    const marginPercentage = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    // 3. Timeline Daily Breakdown
    const [timelineRows] = await db.query(
      `SELECT 
         DATE(s.created_at) AS sale_date,
         COUNT(DISTINCT s.id) AS invoice_count,
         COALESCE(SUM(s.total), 0) AS revenue,
         COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0) AS cogs,
         (COALESCE(SUM(s.total), 0) - COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0)) AS profit
       FROM sales s
       LEFT JOIN sale_items si ON s.id = si.sale_id
       LEFT JOIN products p ON si.product_id = p.id
       LEFT JOIN inventory_batches ib ON si.batch_id = ib.id
       WHERE s.tenant_id = ? ${dateCondition}
       GROUP BY DATE(s.created_at)
       ORDER BY sale_date DESC`,
      params
    );

    // 4. Product-level Profit Performance Breakdown
    const [productRows] = await db.query(
      `SELECT 
         COALESCE(si.product_id, p.id, 0) AS product_id,
         COALESCE(p.name, si.product_name, 'Medicine Item') AS product_name,
         p.generic_name,
         c.name AS category_name,
         COALESCE(SUM(si.quantity), 0) AS units_sold,
         COALESCE(SUM(si.subtotal), 0) AS revenue,
         COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0) AS cogs,
         (COALESCE(SUM(si.subtotal), 0) - COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0)) AS profit,
         CASE 
           WHEN SUM(si.subtotal) > 0 THEN 
             ((SUM(si.subtotal) - SUM(si.quantity * COALESCE(ib.purchase_price, ib.unit_cost_price, p.purchase_price, p.retail_price * 0.70, si.unit_price * 0.70, 0))) / SUM(si.subtotal)) * 100
           ELSE 0
         END AS margin_pct
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       LEFT JOIN products p ON si.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory_batches ib ON si.batch_id = ib.id
       WHERE s.tenant_id = ? ${dateCondition}
       GROUP BY COALESCE(si.product_id, p.id, 0), p.name, si.product_name, p.generic_name, c.name
       ORDER BY revenue DESC
       LIMIT 50`,
      params
    );

    // 5. Category-level Profit Breakdown
    const [categoryRows] = await db.query(
      `SELECT 
         COALESCE(c.name, 'General Medicines') AS category_name,
         COALESCE(SUM(si.quantity), 0) AS units_sold,
         COALESCE(SUM(si.subtotal), 0) AS revenue,
         COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0) AS cogs,
         (COALESCE(SUM(si.subtotal), 0) - COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0)) AS profit
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       LEFT JOIN products p ON si.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory_batches ib ON si.batch_id = ib.id
       WHERE s.tenant_id = ? ${dateCondition}
       GROUP BY COALESCE(c.name, 'General Medicines')
       ORDER BY revenue DESC`,
      params
    );

    // 6. Invoices with COGS & Profit list
    const [invoiceRows] = await db.query(
      `SELECT 
         s.id,
         s.invoice_no,
         s.created_at,
         s.customer_phone,
         s.payment_method,
         s.total AS net_amount,
         COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0) AS cogs,
         (s.total - COALESCE(SUM(
           si.quantity * COALESCE(
             ib.purchase_price, 
             ib.unit_cost_price,
             p.purchase_price, 
             p.retail_price * 0.70, 
             si.unit_price * 0.70,
             0
           )
         ), 0)) AS profit,
         u.name AS cashier_name
       FROM sales s
       LEFT JOIN sale_items si ON s.id = si.sale_id
       LEFT JOIN products p ON si.product_id = p.id
       LEFT JOIN inventory_batches ib ON si.batch_id = ib.id
       LEFT JOIN users u ON s.sold_by = u.id
       WHERE s.tenant_id = ? ${dateCondition}
       GROUP BY s.id
       ORDER BY s.id DESC
       LIMIT 100`,
      params
    );

    return res.json({
      success: true,
      period,
      summary: {
        total_invoices: parseInt(salesAgg?.total_invoices || 0, 10),
        gross_sales: grossSales,
        total_discounts: totalDiscounts,
        total_tax: totalTax,
        net_revenue: netRevenue,
        total_cogs: totalCogs,
        gross_profit: grossProfit,
        margin_percentage: parseFloat(marginPercentage.toFixed(2)),
        total_collected: parseFloat(salesAgg?.total_collected || 0),
        total_due: parseFloat(salesAgg?.total_due || 0),
        total_units_sold: parseInt(cogsAgg?.total_units_sold || 0, 10)
      },
      timeline: timelineRows.map(r => ({
        ...r,
        revenue: parseFloat(r.revenue || 0),
        cogs: parseFloat(r.cogs || 0),
        profit: parseFloat(r.profit || 0),
        margin_pct: r.revenue > 0 ? parseFloat((((r.revenue - r.cogs) / r.revenue) * 100).toFixed(2)) : 0
      })),
      products: productRows.map(r => ({
        ...r,
        revenue: parseFloat(r.revenue || 0),
        cogs: parseFloat(r.cogs || 0),
        profit: parseFloat(r.profit || 0),
        margin_pct: parseFloat(parseFloat(r.margin_pct || 0).toFixed(2))
      })),
      categories: categoryRows.map(r => ({
        ...r,
        revenue: parseFloat(r.revenue || 0),
        cogs: parseFloat(r.cogs || 0),
        profit: parseFloat(r.profit || 0),
        margin_pct: r.revenue > 0 ? parseFloat((((r.revenue - r.cogs) / r.revenue) * 100).toFixed(2)) : 0
      })),
      invoices: invoiceRows.map(r => ({
        ...r,
        net_amount: parseFloat(r.net_amount || 0),
        cogs: parseFloat(r.cogs || 0),
        profit: parseFloat(r.profit || 0),
        margin_pct: r.net_amount > 0 ? parseFloat((((r.net_amount - r.cogs) / r.net_amount) * 100).toFixed(2)) : 0
      }))
    });
  } catch (err) {
    console.error('getProfitLossReport error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Expiry Loss & Financial Risk Report ───────────────────────────────────────
const getExpiryLossReport = async (req, res) => {
  try {
    const tid = (req.user && req.user.tenantId && !isNaN(parseInt(req.user.tenantId, 10)) ? parseInt(req.user.tenantId, 10) : null)
      || (!isNaN(parseInt(req.tenantId, 10)) ? parseInt(req.tenantId, 10) : null)
      || (req.headers && req.headers['x-tenant-id'] && !isNaN(parseInt(req.headers['x-tenant-id'], 10)) ? parseInt(req.headers['x-tenant-id'], 10) : null)
      || 1;

    // 1. KPI Summary Aggregates
    const [[expiredAgg]] = await db.query(
      `SELECT 
         COUNT(*) AS expired_batch_count,
         COALESCE(SUM(ib.quantity), 0) AS expired_total_units,
         COALESCE(SUM(ib.quantity * COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0)), 0) AS expired_total_loss
       FROM inventory_batches ib
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       WHERE ib.tenant_id = ? AND ib.expiry_date < CURDATE() AND ib.quantity > 0`,
      [tid]
    );

    const [[near30Agg]] = await db.query(
      `SELECT 
         COUNT(*) AS near30_batch_count,
         COALESCE(SUM(ib.quantity), 0) AS near30_units,
         COALESCE(SUM(ib.quantity * COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0)), 0) AS near30_loss
       FROM inventory_batches ib
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       WHERE ib.tenant_id = ? 
         AND ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
         AND ib.quantity > 0`,
      [tid]
    );

    const [[near60Agg]] = await db.query(
      `SELECT 
         COUNT(*) AS near60_batch_count,
         COALESCE(SUM(ib.quantity), 0) AS near60_units,
         COALESCE(SUM(ib.quantity * COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0)), 0) AS near60_loss
       FROM inventory_batches ib
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       WHERE ib.tenant_id = ? 
         AND ib.expiry_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 31 DAY) AND DATE_ADD(CURDATE(), INTERVAL 60 DAY) 
         AND ib.quantity > 0`,
      [tid]
    );

    const [[near90Agg]] = await db.query(
      `SELECT 
         COUNT(*) AS near90_batch_count,
         COALESCE(SUM(ib.quantity), 0) AS near90_units,
         COALESCE(SUM(ib.quantity * COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0)), 0) AS near90_loss
       FROM inventory_batches ib
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       WHERE ib.tenant_id = ? 
         AND ib.expiry_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 61 DAY) AND DATE_ADD(CURDATE(), INTERVAL 90 DAY) 
         AND ib.quantity > 0`,
      [tid]
    );

    // 2. Already Expired Batches (Write-off loss ledger)
    const [expiredBatches] = await db.query(
      `SELECT 
         ib.id,
         ib.batch_number,
         ib.expiry_date,
         ib.quantity AS expired_units,
         COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0) AS unit_cost,
         (ib.quantity * COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0)) AS total_loss,
         DATEDIFF(CURDATE(), ib.expiry_date) AS days_expired,
         p.name AS product_name,
         p.generic_name,
         c.name AS category_name,
         s.name AS supplier_name,
         ib.rack_location
       FROM inventory_batches ib
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON ib.supplier_id = s.id
       WHERE ib.tenant_id = ? AND ib.expiry_date < CURDATE() AND ib.quantity > 0
       ORDER BY ib.expiry_date DESC`,
      [tid]
    );

    // 3. Near Expiry Batches (At Risk of Expiry within 90 days)
    const [nearExpiryBatches] = await db.query(
      `SELECT 
         ib.id,
         ib.batch_number,
         ib.expiry_date,
         ib.quantity AS stock_units,
         COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0) AS unit_cost,
         (ib.quantity * COALESCE(ib.purchase_price, p.purchase_price, p.retail_price * 0.70, 0)) AS total_value_at_risk,
         DATEDIFF(ib.expiry_date, CURDATE()) AS days_left,
         CASE 
           WHEN DATEDIFF(ib.expiry_date, CURDATE()) <= 30 THEN 'CRITICAL'
           WHEN DATEDIFF(ib.expiry_date, CURDATE()) <= 60 THEN 'HIGH'
           ELSE 'MEDIUM'
         END AS risk_level,
         p.name AS product_name,
         p.generic_name,
         c.name AS category_name,
         s.name AS supplier_name,
         ib.rack_location
       FROM inventory_batches ib
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON ib.supplier_id = s.id
       WHERE ib.tenant_id = ? 
         AND ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY) 
         AND ib.quantity > 0
       ORDER BY ib.expiry_date ASC`,
      [tid]
    );

    const expiredTotalLoss = parseFloat(expiredAgg?.expired_total_loss || 0);
    const near30Loss = parseFloat(near30Agg?.near30_loss || 0);
    const near60Loss = parseFloat(near60Agg?.near60_loss || 0);
    const near90Loss = parseFloat(near90Agg?.near90_loss || 0);
    const totalAtRiskValue = near30Loss + near60Loss + near90Loss;

    return res.json({
      success: true,
      summary: {
        expired_batch_count: parseInt(expiredAgg?.expired_batch_count || 0, 10),
        expired_total_units: parseInt(expiredAgg?.expired_total_units || 0, 10),
        expired_total_loss: expiredTotalLoss,
        near30_loss: near30Loss,
        near30_units: parseInt(near30Agg?.near30_units || 0, 10),
        near60_loss: near60Loss,
        near60_units: parseInt(near60Agg?.near60_units || 0, 10),
        near90_loss: near90Loss,
        near90_units: parseInt(near90Agg?.near90_units || 0, 10),
        total_at_risk_value: totalAtRiskValue,
        total_at_risk_units: parseInt(near30Agg?.near30_units || 0, 10) + parseInt(near60Agg?.near60_units || 0, 10) + parseInt(near90Agg?.near90_units || 0, 10)
      },
      expired_batches: expiredBatches.map(b => ({
        ...b,
        unit_cost: parseFloat(b.unit_cost || 0),
        total_loss: parseFloat(b.total_loss || 0)
      })),
      near_expiry_batches: nearExpiryBatches.map(b => ({
        ...b,
        unit_cost: parseFloat(b.unit_cost || 0),
        total_value_at_risk: parseFloat(b.total_value_at_risk || 0)
      }))
    });
  } catch (err) {
    console.error('getExpiryLossReport error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboard,
  getMySubscription,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBatches,
  createBatch,
  stockIn,
  stockOut,
  getSuppliers,
  createSupplier,
  updateSupplier,
  getSalesReport,
  getStockReport,
  getExpiryReport,
  getProfitLossReport,
  getExpiryLossReport
};
