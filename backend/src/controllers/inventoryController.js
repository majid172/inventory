// ============================================================================
// PharmaCare SaaS — Inventory Controller (100% Aligned with MySQL SQL Dump)
// ============================================================================

const db = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
// 1. TENANT DASHBOARD METRICS
// ─────────────────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const tid = req.tenantId || 1;

    // Today's sales
    const [[todaySale]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS today_revenue, COUNT(*) AS today_sales
       FROM sales WHERE tenant_id = ? AND DATE(created_at) = CURDATE()`, [tid]
    );

    // This month's sales
    const [[monthSale]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS month_revenue, COUNT(*) AS month_sales
       FROM sales WHERE tenant_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`, [tid]
    );

    // Total products & Stock
    const [[prodStats]] = await db.query(
      `SELECT COUNT(*) AS total_products FROM products WHERE tenant_id = ?`, [tid]
    );

    // Near expiry batches (within 90 days)
    const [[expiryStats]] = await db.query(
      `SELECT COUNT(*) AS near_expiry_count
       FROM inventory_batches
       WHERE tenant_id = ? AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
         AND quantity > 0`, [tid]
    );

    // Low stock products
    const [lowStockAlerts] = await db.query(
      `SELECT p.id, p.name, p.reorder_level, p.rack_location,
              COALESCE(SUM(ib.quantity), 0) AS stock_quantity
       FROM products p
       LEFT JOIN inventory_batches ib ON p.id = ib.product_id AND p.tenant_id = ib.tenant_id
       WHERE p.tenant_id = ?
       GROUP BY p.id
       HAVING stock_quantity <= p.reorder_level
       LIMIT 10`, [tid]
    );

    // Near expiry alerts
    const [nearExpiryAlerts] = await db.query(
      `SELECT p.name, ib.batch_number, ib.expiry_date, ib.quantity,
              DATEDIFF(ib.expiry_date, CURDATE()) AS days_until_expiry
       FROM inventory_batches ib 
       JOIN products p ON ib.product_id = p.id AND ib.tenant_id = p.tenant_id
       WHERE ib.tenant_id = ? AND ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
         AND ib.quantity > 0
       ORDER BY ib.expiry_date ASC LIMIT 10`, [tid]
    );

    return res.json({
      success: true,
      dashboard: {
        todayRevenue: parseFloat(todaySale.today_revenue) || 0,
        todaySales: parseInt(todaySale.today_sales, 10) || 0,
        monthRevenue: parseFloat(monthSale.month_revenue) || 0,
        monthSales: parseInt(monthSale.month_sales, 10) || 0,
        totalProducts: parseInt(prodStats.total_products, 10) || 0,
        lowStockCount: lowStockAlerts.length,
        nearExpiryCount: parseInt(expiryStats.near_expiry_count, 10) || 0,
        lowStockAlerts,
        nearExpiryAlerts
      }
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ success: false, message: err.message });
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
               WHERE ib.product_id = p.id AND ib.tenant_id = p.tenant_id
             ), 0) AS total_stock
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
    const { name, description } = req.body;
    await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ? AND tenant_id = ?', [name, description || '', req.params.id, tid]);
    return res.json({ success: true, message: 'Category updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    await db.query('DELETE FROM categories WHERE id = ? AND tenant_id = ?', [req.params.id, tid]);
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
// 7. REPORTS
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
      `SELECT p.name, p.retail_price, p.reorder_level, COALESCE(SUM(ib.quantity), 0) AS total_stock
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
  getExpiryReport
};
