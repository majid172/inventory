// ============================================================================
// PharmaCare SaaS — Sales & POS Controller (100% Aligned with MySQL SQL Dump)
// ============================================================================

const db = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sales — Process POS Checkout & FEFO Inventory Batch Deductions
// ─────────────────────────────────────────────────────────────────────────────
const processSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const tid = req.tenantId || 1;
    const userId = req.user?.id || 1;
    const { customer_id, items, total_amount, discount = 0, tax = 0, payment_method = 'cash' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Sale must contain at least one item.' });
    }

    // 1. Insert into sales table
    const [saleResult] = await connection.query(
      `INSERT INTO sales (tenant_id, user_id, customer_id, total_amount, discount, tax, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [tid, userId, customer_id || null, parseFloat(total_amount), parseFloat(discount), parseFloat(tax), payment_method]
    );
    const saleId = saleResult.insertId;

    // 2. Process each item and deduct stock from inventory_batches
    for (const item of items) {
      const productId = item.product_id || item.id;
      let requestedQty = parseInt(item.quantity, 10) || 1;
      const unitPrice = parseFloat(item.unit_price || item.retail_price || item.price || 0);
      const totalPrice = unitPrice * requestedQty;

      // FEFO Batch Selection: Select earliest expiring batch with available quantity
      const [batches] = await connection.query(
        `SELECT * FROM inventory_batches 
         WHERE tenant_id = ? AND product_id = ? AND quantity > 0
         ORDER BY expiry_date ASC`,
        [tid, productId]
      );

      let allocatedBatchId = null;

      if (batches && batches.length > 0) {
        let remainingToDeduct = requestedQty;
        for (const batch of batches) {
          if (remainingToDeduct <= 0) break;
          allocatedBatchId = batch.id;
          const deductAmount = Math.min(batch.quantity, remainingToDeduct);

          await connection.query(
            `UPDATE inventory_batches SET quantity = quantity - ? WHERE id = ? AND tenant_id = ?`,
            [deductAmount, batch.id, tid]
          );

          remainingToDeduct -= deductAmount;
        }
      }

      // Insert sale item record
      await connection.query(
        `INSERT INTO sale_items (sale_id, product_id, batch_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [saleId, productId, allocatedBatchId, requestedQty, unitPrice, totalPrice]
      );
    }

    await connection.commit();

    const [[createdSale]] = await db.query('SELECT * FROM sales WHERE id = ?', [saleId]);
    const [saleItemsList] = await db.query(
      `SELECT si.*, p.name AS product_name 
       FROM sale_items si 
       JOIN products p ON si.product_id = p.id 
       WHERE si.sale_id = ?`,
      [saleId]
    );

    return res.status(201).json({
      success: true,
      message: 'POS transaction completed successfully.',
      saleId,
      sale: createdSale,
      items: saleItemsList
    });
  } catch (err) {
    await connection.rollback();
    console.error('processSale error:', err);
    return res.status(500).json({ success: false, message: `Checkout Error: ${err.message}` });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sales — Sales History
// ─────────────────────────────────────────────────────────────────────────────
const getSales = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [rows] = await db.query(
      `SELECT s.*, u.name AS cashier_name, c.name AS customer_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN customers c ON s.customer_id = c.id
       WHERE s.tenant_id = ?
       ORDER BY s.id DESC LIMIT ? OFFSET ?`,
      [tid, parseInt(limit, 10), offset]
    );

    return res.json({ success: true, count: rows.length, sales: rows, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMERS CRUD
// ─────────────────────────────────────────────────────────────────────────────
const getCustomers = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [rows] = await db.query('SELECT * FROM customers WHERE tenant_id = ? ORDER BY name ASC', [tid]);
    return res.json({ success: true, customers: rows, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, phone, address, points = 0 } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Customer name is required.' });

    const [r] = await db.query(
      `INSERT INTO customers (tenant_id, name, phone, address, points) VALUES (?, ?, ?, ?, ?)`,
      [tid, name, phone || null, address || null, parseInt(points, 10) || 0]
    );

    const [[created]] = await db.query('SELECT * FROM customers WHERE id = ?', [r.insertId]);
    return res.status(201).json({ success: true, customer: created, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [[sale]] = await db.query('SELECT * FROM sales WHERE id = ? AND tenant_id = ?', [req.params.id, tid]);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found.' });

    const [items] = await db.query(
      `SELECT si.*, p.name AS product_name 
       FROM sale_items si 
       JOIN products p ON si.product_id = p.id 
       WHERE si.sale_id = ?`,
      [req.params.id]
    );

    return res.json({ success: true, sale, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  processSale,
  createSale: processSale,
  getSales,
  getSaleById,
  getCustomers,
  createCustomer
};
