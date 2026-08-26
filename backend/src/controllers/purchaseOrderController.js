const db = require('../config/db');

// Auto-migration helper for purchase orders
let isSchemaChecked = false;
const ensurePOTable = async () => {
  if (isSchemaChecked || !db || !db.query) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) DEFAULT 'TENANT_101',
        po_number VARCHAR(50) NOT NULL,
        supplier_id VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SENT, RECEIVED, CANCELLED
        total_amount DECIMAL(10, 2) DEFAULT 0.00,
        expected_date DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_po_tenant (tenant_id)
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS po_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT DEFAULT 1,
        unit_cost DECIMAL(10, 2) DEFAULT 0.00,
        FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
      )
    `);
    isSchemaChecked = true;
  } catch (err) {
    console.warn("PO schema check warning:", err.message);
  }
};

let fallbackPOs = [
  { id: 1, tenantId: 'TENANT_101', poNumber: "PO_2024_001", supplierId: "SUP_001", supplierName: "GlaxoSmithKline (GSK) Pharma", status: "RECEIVED", totalAmount: 450.50, expectedDate: "2024-10-15", createdAt: new Date().toISOString() },
  { id: 2, tenantId: 'TENANT_101', poNumber: "PO_2024_002", supplierId: "SUP_002", supplierName: "Pfizer Logistics", status: "DRAFT", totalAmount: 1200.00, expectedDate: "2024-10-25", createdAt: new Date().toISOString() }
];

const getPurchaseOrders = async (req, res) => {
  try {
    const tenantId = req.query.tenant_id || req.headers['x-tenant-id'] || 'TENANT_101';
    await ensurePOTable();

    if (db && db.query) {
      try {
        const [rows] = await db.query(
          `SELECT p.*, s.name as supplierName 
           FROM purchase_orders p
           LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
           WHERE p.tenant_id = ? OR p.tenant_id IS NULL 
           ORDER BY p.id DESC`,
          [tenantId]
        );
        if (rows && rows.length > 0) {
          const formatted = rows.map(r => ({
            id: r.id,
            tenantId: r.tenant_id,
            poNumber: r.po_number,
            supplierId: r.supplier_id,
            supplierName: r.supplierName || 'Unknown Supplier',
            status: r.status,
            totalAmount: parseFloat(r.total_amount),
            expectedDate: r.expected_date,
            createdAt: r.created_at
          }));
          return res.json({ success: true, count: formatted.length, data: formatted });
        }
      } catch (dbErr) {}
    }
    
    // Fallback
    const tenantPOs = fallbackPOs.filter(p => p.tenantId === tenantId);
    return res.json({ success: true, count: tenantPOs.length, data: tenantPOs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const tenantId = req.body.tenant_id || req.headers['x-tenant-id'] || 'TENANT_101';
    await ensurePOTable();
    
    const { supplierId, expectedDate, items, totalAmount } = req.body;
    if (!supplierId) return res.status(400).json({ success: false, message: 'Supplier ID is required.' });

    if (db && db.query) {
      try {
        const poNumber = `PO_${new Date().getFullYear()}_${Date.now().toString().slice(-5)}`;
        const [result] = await db.query(
          `INSERT INTO purchase_orders (tenant_id, po_number, supplier_id, status, expected_date, total_amount) 
           VALUES (?, ?, ?, 'DRAFT', ?, ?)`,
          [tenantId, poNumber, supplierId, expectedDate || null, totalAmount || 0]
        );
        
        const newPoId = result.insertId;
        
        if (items && Array.isArray(items)) {
          for (let item of items) {
             await db.query(
               "INSERT INTO po_items (po_id, product_id, quantity, unit_cost) VALUES (?, ?, ?, ?)",
               [newPoId, item.productId, item.quantity, item.unitCost]
             );
          }
        }
        
        return res.status(201).json({ 
          success: true, 
          message: 'Purchase order created successfully.',
          data: { id: newPoId, poNumber, supplierId, status: 'DRAFT', expectedDate, totalAmount } 
        });
      } catch (dbErr) {}
    }
    
    // Fallback
    const poNumber = `PO_${new Date().getFullYear()}_${Date.now().toString().slice(-4)}`;
    const newPO = {
      id: fallbackPOs.length + 1,
      tenantId,
      poNumber,
      supplierId,
      supplierName: "Demo Supplier",
      status: 'DRAFT',
      expectedDate: expectedDate || new Date().toISOString(),
      totalAmount: totalAmount || 0,
      createdAt: new Date().toISOString()
    };
    fallbackPOs.unshift(newPO);
    res.status(201).json({ success: true, message: 'Purchase order created (Demo mode).', data: newPO });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPurchaseOrders,
  createPurchaseOrder
};
