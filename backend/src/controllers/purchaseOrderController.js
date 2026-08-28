const db = require('../config/db');

// Helper to get a valid tenant_id
const resolveTenantId = async (req) => {
  if (req.tenantId && req.tenantId !== 'SYSTEM') {
    return parseInt(req.tenantId, 10);
  }
  const xTenant = req.headers['x-tenant-id'] || req.headers['X-Tenant-Id'];
  if (xTenant && !isNaN(parseInt(xTenant, 10))) {
    return parseInt(xTenant, 10);
  }
  try {
    const [[firstTenant]] = await db.query('SELECT id FROM tenants ORDER BY id ASC LIMIT 1');
    if (firstTenant && firstTenant.id) {
      return firstTenant.id;
    }
  } catch (e) {}
  return 1;
};

// Ensure po_items table exists
const ensurePOItemsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS po_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT DEFAULT 1,
        unit_price DECIMAL(10, 2) DEFAULT 0.00,
        FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
  } catch (err) {
    console.error("PO Items schema check warning:", err.message);
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    await ensurePOItemsTable();

    const [rows] = await db.query(
      `SELECT p.*, s.name as supplierName 
       FROM purchase_orders p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.tenant_id = ? 
       ORDER BY p.id DESC`,
      [tenantId]
    );

    const formatted = rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      poNumber: r.po_number || `PO-${r.id}`,
      supplierId: r.supplier_id,
      supplierName: r.supplierName || 'Unknown Supplier',
      status: r.status === 'pending' ? 'DRAFT' : (r.status === 'received' ? 'RECEIVED' : (r.status === 'sent' ? 'SENT' : 'CANCELLED')),
      totalAmount: parseFloat(r.total_amount),
      createdAt: r.created_at,
      expectedDate: r.expected_date
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error('getPurchaseOrders error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching purchase orders' });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const poId = req.params.id;

    const [poRows] = await db.query(
      `SELECT p.*, s.name as supplierName 
       FROM purchase_orders p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ? AND p.tenant_id = ?`,
      [poId, tenantId]
    );

    if (poRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const po = poRows[0];
    
    // Get items
    const [itemRows] = await db.query(
      `SELECT i.*, p.name as productName 
       FROM po_items i
       JOIN products p ON i.product_id = p.id
       WHERE i.po_id = ?`,
      [poId]
    );

    res.json({ 
      success: true, 
      data: {
        id: po.id,
        poNumber: po.po_number || `PO-${po.id}`,
        supplierId: po.supplier_id,
        supplierName: po.supplierName,
        status: po.status === 'pending' ? 'DRAFT' : (po.status === 'received' ? 'RECEIVED' : (po.status === 'sent' ? 'SENT' : 'CANCELLED')),
        totalAmount: parseFloat(po.total_amount),
        createdAt: po.created_at,
        expectedDate: po.expected_date,
        items: itemRows.map(i => ({
          id: i.id,
          productId: i.product_id,
          productName: i.productName,
          genericName: i.productName, // fallback if not joined
          quantity: i.quantity,
          unitCost: parseFloat(i.unit_price),
          lineTotal: parseFloat(i.unit_price) * i.quantity
        }))
      } 
    });
  } catch (err) {
    console.error('getPurchaseOrderById error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching purchase order' });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    await ensurePOItemsTable();
    
    const { supplierId, expectedDate, items, totalAmount } = req.body;
    
    if (!supplierId) return res.status(400).json({ success: false, message: 'Supplier ID is required.' });
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'At least one item is required.' });

    // Note: Use the supplier's actual primary key if the frontend passes the string 'SUP_XXX'
    let actualSupplierId = supplierId;
    if (typeof supplierId === 'string' && supplierId.startsWith('SUP_')) {
      actualSupplierId = parseInt(supplierId.replace('SUP_', ''), 10);
    }

    const [result] = await db.query(
      `INSERT INTO purchase_orders (tenant_id, supplier_id, status, total_amount, expected_date) 
       VALUES (?, ?, 'pending', ?, ?)`,
      [tenantId, actualSupplierId, totalAmount || 0, expectedDate || null]
    );
    
    const newPoId = result.insertId;
    
    for (let item of items) {
      await db.query(
        "INSERT INTO po_items (po_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [newPoId, item.productId, item.quantity, item.unitCost]
      );
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Purchase order created successfully.',
      data: { id: newPoId, poNumber: `PO-${newPoId}`, supplierId: actualSupplierId, status: 'DRAFT', totalAmount, expectedDate } 
    });
  } catch (err) {
    console.error('createPurchaseOrder error:', err);
    res.status(500).json({ success: false, message: 'Failed to create PO' });
  }
};

const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const poId = req.params.id;
    const { status } = req.body;

    if (!['DRAFT', 'SENT', 'CANCELLED'].includes(status)) {
       return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const dbStatus = status === 'DRAFT' ? 'pending' : status.toLowerCase();

    const [result] = await db.query(
      'UPDATE purchase_orders SET status = ? WHERE id = ? AND tenant_id = ? AND status != "received"',
      [dbStatus, poId, tenantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'PO not found or already received' });
    }

    res.json({ success: true, message: `Purchase order marked as ${status}` });
  } catch (err) {
    console.error('updatePurchaseOrderStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update PO status' });
  }
};

const receivePurchaseOrder = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const poId = req.params.id;
    const { batches } = req.body; // Array of { productId, batchNumber, expiryDate }

    // Check if PO exists and is not already received
    const [poRows] = await db.query('SELECT * FROM purchase_orders WHERE id = ? AND tenant_id = ?', [poId, tenantId]);
    if (poRows.length === 0) return res.status(404).json({ success: false, message: 'PO not found' });
    
    const po = poRows[0];
    if (po.status === 'received') return res.status(400).json({ success: false, message: 'PO is already received' });
    
    // Get PO items
    const [items] = await db.query('SELECT * FROM po_items WHERE po_id = ?', [poId]);
    if (items.length === 0) return res.status(400).json({ success: false, message: 'PO has no items' });

    const receivedDate = new Date().toISOString().split('T')[0];

    // For each item in PO, create an inventory batch and update product stock
    for (let item of items) {
      // Find matching batch info from request
      const batchInfo = batches ? batches.find(b => b.productId === item.product_id) : {};
      const batchNo = (batchInfo && batchInfo.batchNumber) ? batchInfo.batchNumber : `BATCH-${po.po_number || 'PO-'+po.id}-${item.product_id}`;
      const expiry = (batchInfo && batchInfo.expiryDate) ? batchInfo.expiryDate : null;
      
      // Insert into inventory_batches
      await db.query(
        `INSERT INTO inventory_batches 
         (tenant_id, product_id, batch_number, quantity, purchase_price, supplier_id, expiry_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tenantId, item.product_id, batchNo, item.quantity, item.unit_price, po.supplier_id, expiry || '2028-12-31']
      );
    }

    // Update PO status
    await db.query(
      'UPDATE purchase_orders SET status = "received" WHERE id = ?',
      [poId]
    );

    res.json({ success: true, message: 'Purchase order received and stock updated' });
  } catch (err) {
    console.error('receivePurchaseOrder error:', err);
    res.status(500).json({ success: false, message: 'Failed to receive PO' });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrder
};
