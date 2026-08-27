// ============================================================================
// PharmaCare SaaS — Sales & Invoices Controller (Lean 2-Table Architecture)
// Tables: `sales` and `sale_items` (customer_phone based, no customer table needed)
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
    const { 
      customer_phone,
     
      items, 
      total_amount, 
      subtotal,
      discount = 0, 
      tax = 0, 
      total,
      paid_amount,
      due_amount = 0,
      payment_method = 'cash',
      transaction_no,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Sale must contain at least one item.' });
    }

    const invoiceNo = req.body.invoice_no || `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-5)}`;
    const subtotalVal = parseFloat(subtotal || total_amount || total || 0);
    const discountVal = parseFloat(discount || 0);
    const taxVal = parseFloat(tax || 0);
    const totalVal = parseFloat(total || total_amount || (subtotalVal + taxVal - discountVal));
    const paidVal = parseFloat(paid_amount !== undefined ? paid_amount : totalVal);
    const dueVal = parseFloat(due_amount || Math.max(0, totalVal - paidVal));
    const phoneVal = customer_phone || 'Walk-in Patient';
    const finalTrxNo = transaction_no || null;
    const finalNotes = notes || null;

    // 1. Insert into sales table (Matched 100% with MySQL sales table)
    const [saleResult] = await connection.query(
      `INSERT INTO sales (
         tenant_id, invoice_no, customer_phone, 
         subtotal, discount, tax, total, paid_amount, due_amount, 
         payment_method, transaction_no, status, notes, sold_by
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [
        tid, invoiceNo, phoneVal,
        subtotalVal, discountVal, taxVal, totalVal, paidVal, dueVal,
        payment_method, finalTrxNo, finalNotes, userId
      ]
    );
    const saleId = saleResult.insertId;

    // 2. Process each item and deduct stock from inventory_batches (FEFO)
    for (const item of items) {
      const productId = item.product_id || item.id;
      let requestedQty = parseInt(item.quantity, 10) || 1;
      const unitPrice = parseFloat(item.unit_price || item.retail_price || item.price || 0);
      const itemDiscount = parseFloat(item.discount || 0);
      const itemSubtotal = (unitPrice * requestedQty) - itemDiscount;
      const prodName = item.name || item.product_name || 'Medicine Item';

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

      // Deduct product overall stock if products table has stock_quantity
      try {
        await connection.query(
          `UPDATE products SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - ?) WHERE id = ? AND tenant_id = ?`,
          [requestedQty, productId, tid]
        );
      } catch (e) {}

      // Insert sale item record
      await connection.query(
        `INSERT INTO sale_items (tenant_id, sale_id, product_id, batch_id, product_name, quantity, unit_price, discount, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tid, saleId, productId, allocatedBatchId, prodName, requestedQty, unitPrice, itemDiscount, itemSubtotal]
      );
    }

    await connection.commit();

    const [[createdSale]] = await db.query(`SELECT * FROM sales WHERE id = ?`, [saleId]);
    const [saleItemsList] = await db.query(
      `SELECT si.*, 
              COALESCE(p.name, si.product_name, 'Medicine') AS product_name 
       FROM sale_items si 
       LEFT JOIN products p ON si.product_id = p.id 
       WHERE si.sale_id = ?`,
      [saleId]
    );

    return res.status(201).json({
      success: true,
      message: 'POS Sale invoice generated successfully.',
      saleId,
      sale: createdSale,
      items: saleItemsList,
      invoice_no: createdSale.invoice_no
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
// GET /api/sales — Sales History & KPI Analytics
// ─────────────────────────────────────────────────────────────────────────────
const getSales = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { page = 1, limit = 50, search, method, startDate, endDate } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereClause = 'WHERE s.tenant_id = ?';
    const params = [tid];

    if (search) {
      whereClause += ' AND (s.invoice_no LIKE ? OR s.customer_phone LIKE ? OR s.notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (method && method !== 'all') {
      whereClause += ' AND LOWER(s.payment_method) = LOWER(?)';
      params.push(method);
    }

    if (startDate) {
      whereClause += ' AND DATE(s.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(s.created_at) <= ?';
      params.push(endDate);
    }

    // Total Count
    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total FROM sales s ${whereClause}`,
      params
    );
    const totalCount = countRow ? countRow.total : 0;

    // Sales Records with item summary
    const queryParams = [...params, parseInt(limit, 10), offset];
    const [rows] = await db.query(
      `SELECT s.*, 
              s.customer_phone,
              s.customer_phone AS customer_name,
              u.name AS cashier_name,
              (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id = s.id) AS items_count,
              (SELECT GROUP_CONCAT(CONCAT(si.quantity, 'x ', COALESCE(p.name, si.product_name, 'Medicine')) SEPARATOR ', ')
               FROM sale_items si
               LEFT JOIN products p ON si.product_id = p.id
               WHERE si.sale_id = s.id) AS items_summary
       FROM sales s
       LEFT JOIN users u ON (s.sold_by = u.id)
       ${whereClause}
       ORDER BY s.id DESC LIMIT ? OFFSET ?`,
      queryParams
    );

    // Dynamic KPI Aggregates
    let stats = {
      total_invoices: rows.length,
      total_revenue: 0,
      today_revenue: 0,
      today_invoices: 0,
      cash_count: 0,
      digital_count: 0
    };

    try {
      const [[aggStats]] = await db.query(
        `SELECT 
           COUNT(*) AS total_invoices,
           COALESCE(SUM(total), 0) AS total_revenue,
           COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total ELSE 0 END), 0) AS today_revenue,
           COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END), 0) AS today_invoices,
           COALESCE(SUM(CASE WHEN LOWER(payment_method) = 'cash' THEN 1 ELSE 0 END), 0) AS cash_count,
           COALESCE(SUM(CASE WHEN LOWER(payment_method) != 'cash' THEN 1 ELSE 0 END), 0) AS digital_count
         FROM sales
         WHERE tenant_id = ?`,
        [tid]
      );
      if (aggStats) stats = aggStats;
    } catch (e) {}

    return res.json({ 
      success: true, 
      count: totalCount, 
      total: totalCount, 
      sales: rows, 
      data: rows,
      stats
    });
  } catch (err) {
    console.error('getSales error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sales/:id — Single Sale Invoice Details with Line Items
// ─────────────────────────────────────────────────────────────────────────────
const getSaleById = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [[sale]] = await db.query(
      `SELECT s.*,
              s.customer_phone,
              s.customer_phone AS customer_name,
              u.name AS cashier_name
       FROM sales s
       LEFT JOIN users u ON (s.sold_by = u.id)
       WHERE s.id = ? AND s.tenant_id = ?`,
      [req.params.id, tid]
    );

    if (!sale) return res.status(404).json({ success: false, message: 'Sale invoice record not found.' });

    const [items] = await db.query(
      `SELECT si.*, 
              COALESCE(p.name, si.product_name, 'Medicine') AS product_name,
              p.generic_name,
              p.dosage_form,
              p.strength,
              ib.batch_number,
              ib.expiry_date
       FROM sale_items si 
       LEFT JOIN products p ON si.product_id = p.id 
       LEFT JOIN inventory_batches ib ON si.batch_id = ib.id
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
  getSaleById
};
