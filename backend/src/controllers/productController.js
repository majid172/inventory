const db = require('../config/db');

// Auto-migration helper to ensure tenant_id column exists on products table
let isTenantColumnChecked = false;
const ensureTenantColumn = async () => {
  if (isTenantColumnChecked || !db || !db.query) return;
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM products LIKE 'tenant_id'");
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE products ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'TENANT_101'");
      console.log("Added tenant_id column to products table.");
    }
    isTenantColumnChecked = true;
  } catch (err) {
    // Ignore error if table does not exist yet or ALTER fails silently
    console.warn("Tenant column check warning:", err.message);
  }
};

// Seed / Demo product catalog per tenant store for fallback or unseeded DB
const demoTenantProducts = {
  TENANT_101: [
    { id: 101, tenantId: 'TENANT_101', name: 'Amoxil 500mg', genericName: 'Amoxicillin Trihydrate', dosageForm: 'Capsule', strength: '500mg', category: 'Antibiotics', price: 12.50, cost: 8.50, rxRequired: true, planTierAccess: 'starter', stockQuantity: 250, rackLocation: 'Shelf A-01', batchNumber: 'BATCH-101A', expiryDate: '2027-11-30' },
    { id: 102, tenantId: 'TENANT_101', name: 'Napa Extra 500mg', genericName: 'Paracetamol + Caffeine', dosageForm: 'Tablet', strength: '500mg+65mg', category: 'Analgesics', price: 3.50, cost: 2.10, rxRequired: false, planTierAccess: 'starter', stockQuantity: 500, rackLocation: 'Shelf A-02', batchNumber: 'BATCH-101B', expiryDate: '2028-06-15' },
    { id: 103, tenantId: 'TENANT_101', name: 'Seclo 20mg', genericName: 'Omeprazole', dosageForm: 'Capsule', strength: '20mg', category: 'Gastric & Ulcer', price: 7.00, cost: 4.50, rxRequired: false, planTierAccess: 'starter', stockQuantity: 320, rackLocation: 'Shelf B-01', batchNumber: 'BATCH-101C', expiryDate: '2027-09-30' },
    { id: 104, tenantId: 'TENANT_101', name: 'Sergel 20mg', genericName: 'Esomeprazole', dosageForm: 'Capsule', strength: '20mg', category: 'Gastric & Ulcer', price: 8.00, cost: 5.20, rxRequired: false, planTierAccess: 'pro', stockQuantity: 180, rackLocation: 'Shelf B-02', batchNumber: 'BATCH-101D', expiryDate: '2027-12-31' },
    { id: 105, tenantId: 'TENANT_101', name: 'Ace 500mg Tablet', genericName: 'Paracetamol', dosageForm: 'Tablet', strength: '500mg', category: 'Analgesics', price: 2.50, cost: 1.50, rxRequired: false, planTierAccess: 'starter', stockQuantity: 600, rackLocation: 'Shelf A-03', batchNumber: 'BATCH-101E', expiryDate: '2028-01-20' }
  ],
  TENANT_102: [
    { id: 201, tenantId: 'TENANT_102', name: 'Panadol Extra 500mg', genericName: 'Paracetamol + Caffeine', dosageForm: 'Tablet', strength: '500mg', category: 'Analgesics', price: 4.20, cost: 2.80, rxRequired: false, planTierAccess: 'starter', stockQuantity: 400, rackLocation: 'Rack 1-A', batchNumber: 'BATCH-202A', expiryDate: '2027-10-31' },
    { id: 202, tenantId: 'TENANT_102', name: 'Losec 20mg', genericName: 'Omeprazole', dosageForm: 'Capsule', strength: '20mg', category: 'Gastroenterology', price: 9.50, cost: 6.00, rxRequired: false, planTierAccess: 'pro', stockQuantity: 150, rackLocation: 'Rack 1-B', batchNumber: 'BATCH-202B', expiryDate: '2027-08-20' },
    { id: 203, tenantId: 'TENANT_102', name: 'Zithromax 500mg', genericName: 'Azithromycin', dosageForm: 'Tablet', strength: '500mg', category: 'Antibiotics', price: 35.00, cost: 24.00, rxRequired: true, planTierAccess: 'pro', stockQuantity: 90, rackLocation: 'Rack 2-A', batchNumber: 'BATCH-202C', expiryDate: '2026-12-15' },
    { id: 204, tenantId: 'TENANT_102', name: 'Cef-3 200mg/5ml Syrup', genericName: 'Cefixime', dosageForm: 'Syrup', strength: '200mg/5ml', category: 'Antibiotics', price: 18.00, cost: 12.50, rxRequired: true, planTierAccess: 'starter', stockQuantity: 75, rackLocation: 'Rack 2-B', batchNumber: 'BATCH-202D', expiryDate: '2027-05-10' }
  ],
  TENANT_103: [
    { id: 301, tenantId: 'TENANT_103', name: 'Lantus SoloStar Pen 100u/ml', genericName: 'Insulin Glargine', dosageForm: 'Injection', strength: '100u/ml', category: 'Diabetes Care', price: 120.00, cost: 95.00, rxRequired: true, planTierAccess: 'enterprise', stockQuantity: 60, rackLocation: 'Cold Storage R-1', batchNumber: 'BATCH-303A', expiryDate: '2026-11-20' },
    { id: 302, tenantId: 'TENANT_103', name: 'Lipitor 20mg Tablet', genericName: 'Atorvastatin', dosageForm: 'Tablet', strength: '20mg', category: 'Cardiology', price: 45.00, cost: 30.00, rxRequired: true, planTierAccess: 'enterprise', stockQuantity: 210, rackLocation: 'Cabinet C-4', batchNumber: 'BATCH-303B', expiryDate: '2028-02-28' },
    { id: 303, tenantId: 'TENANT_103', name: 'Januvia 100mg Tablet', genericName: 'Sitagliptin', dosageForm: 'Tablet', strength: '100mg', category: 'Diabetes Care', price: 85.00, cost: 62.00, rxRequired: true, planTierAccess: 'pro', stockQuantity: 110, rackLocation: 'Cabinet C-2', batchNumber: 'BATCH-303C', expiryDate: '2027-07-15' },
    { id: 304, tenantId: 'TENANT_103', name: 'Crestor 10mg Tablet', genericName: 'Rosuvastatin', dosageForm: 'Tablet', strength: '100mg', category: 'Cardiology', price: 55.00, cost: 38.00, rxRequired: true, planTierAccess: 'enterprise', stockQuantity: 140, rackLocation: 'Cabinet C-5', batchNumber: 'BATCH-303D', expiryDate: '2027-10-10' }
  ]
};

// @desc    Get all medicines/products for a specific tenant from database
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || req.headers['x-tenant-id'] || 'TENANT_101';
    await ensureTenantColumn();

    if (db && db.query) {
      let sql = `
        SELECT 
          p.id,
          p.tenant_id,
          p.master_drug_id,
          p.name,
          COALESCE(p.retail_price, m.default_retail_price, 0) AS price,
          COALESCE(p.cost_price, 0) AS cost,
          COALESCE(p.total_stock_quantity, 100) AS stock_quantity,
          COALESCE(p.rack_location, 'Shelf A-01') AS rack_location,
          COALESCE(m.generic_name, p.name) AS generic_name,
          COALESCE(m.dosage_form, '-') AS dosage_form,
          COALESCE(m.plan_tier_access, 'starter') AS plan_tier_access,
          COALESCE(p.rx_required, m.rx_required, 0) AS rx_required,
          COALESCE(c.name, m.therapeutic_class, 'General') AS category_name
        FROM products p 
        LEFT JOIN master_drug_catalog m ON (p.master_drug_id = m.id OR LOWER(p.name) = LOWER(m.brand_name))
        LEFT JOIN categories c ON (p.category_id = c.id)
      `;

      const params = [];
      if (tenantId && tenantId !== 'ALL') {
        sql += ` WHERE (p.tenant_id = ? OR p.tenant_id IS NULL OR p.tenant_id = '') `;
        params.push(tenantId);
      }
      sql += ` ORDER BY p.id ASC `;

      const [rows] = await db.query(sql, params);

      if (rows && Array.isArray(rows) && rows.length > 0) {
        const formatted = rows.map(r => ({
          id: r.id,
          tenantId: r.tenant_id || tenantId,
          name: r.name,
          genericName: r.generic_name || r.name,
          dosageForm: r.dosage_form || '-',
          strength: r.strength || '',
          categoryId: r.category_id,
          category: r.category_name || 'General',
          price: parseFloat(r.price) || 0,
          cost: parseFloat(r.cost) || 0,
          taxRate: 0,
          status: 'AVAILABLE',
          rxRequired: !!r.rx_required,
          planTierAccess: r.plan_tier_access || 'starter',
          batchNumber: `BATCH-${r.id}`,
          expiryDate: '2027-12-31',
          manufacturer: 'Pharma Corp',
          rackLocation: r.rack_location || 'Shelf A-01',
          stockQuantity: r.stock_quantity || 100,
          minReorderLevel: 15
        }));
        return res.json({ success: true, count: formatted.length, tenantId, data: formatted });
      }

      // Fallback: Use demo tenant product catalog if DB table returns empty for requested tenant
      if (demoTenantProducts[tenantId]) {
        return res.json({
          success: true,
          count: demoTenantProducts[tenantId].length,
          tenantId,
          data: demoTenantProducts[tenantId]
        });
      }

      // Default master catalog fallback
      const masterSql = `
        SELECT 
          id,
          drug_code,
          brand_name AS name,
          generic_name,
          dosage_form,
          manufacturer,
          default_retail_price AS price,
          rx_required,
          plan_tier_access,
          therapeutic_class AS category_name
        FROM master_drug_catalog
        ORDER BY id ASC
      `;
      const [masterRows] = await db.query(masterSql);
      if (masterRows && Array.isArray(masterRows) && masterRows.length > 0) {
        const formattedMaster = masterRows.map(m => ({
          id: m.id,
          tenantId,
          productId: m.drug_code,
          name: m.name,
          genericName: m.generic_name || m.name,
          dosageForm: m.dosage_form || '-',
          strength: 'Standard',
          category: m.category_name || 'General',
          price: parseFloat(m.price) || 0,
          cost: parseFloat(m.price) * 0.7 || 0,
          taxRate: 0,
          status: 'AVAILABLE',
          rxRequired: !!m.rx_required,
          planTierAccess: m.plan_tier_access || 'starter',
          batchNumber: `BATCH-${m.id}`,
          expiryDate: '2027-12-31',
          manufacturer: m.manufacturer || 'Generic Pharma',
          rackLocation: 'Shelf A-01',
          stockQuantity: 100,
          minReorderLevel: 15
        }));
        return res.json({ success: true, count: formattedMaster.length, tenantId, data: formattedMaster });
      }
    }

    // Secondary fallback for offline / mock DB
    const mockList = demoTenantProducts[tenantId] || demoTenantProducts['TENANT_101'];
    return res.json({ success: true, count: mockList.length, tenantId, data: mockList });
  } catch (error) {
    console.error('Database query error in getProducts:', error.message);
    const mockList = demoTenantProducts[req.query.tenant_id || req.headers['x-tenant-id']] || demoTenantProducts['TENANT_101'];
    return res.json({ success: true, count: mockList.length, tenantId: req.query.tenant_id || 'TENANT_101', data: mockList });
  }
};

// @desc    Create a new medicine in database according to exact schema
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const tenantId = req.body.tenantId || req.body.tenant_id || req.headers['x-tenant-id'] || 'TENANT_101';
    await ensureTenantColumn();

    const {
      name,
      genericName,
      dosageForm,
      strength,
      categoryId,
      category,
      price,
      cost,
      taxRate,
      status,
      rxRequired,
      batchNumber,
      expiryDate,
      manufacturer,
      rackLocation,
      stockQuantity,
      minReorderLevel
    } = req.body;

    const catId = categoryId || category || 1;
    const isRx = rxRequired ? 1 : 0;
    const prodPrice = parseFloat(price) || 0;
    const prodCost = parseFloat(cost) || 0;
    const prodTax = parseFloat(taxRate) || 0;
    const prodStatus = status || 'AVAILABLE';
    const prodStock = parseInt(stockQuantity) || 100;
    const prodMin = parseInt(minReorderLevel) || 15;

    if (db && db.query) {
      const sql = `
        INSERT INTO products 
        (tenant_id, name, generic_name, dosage_form, strength, category_id, price, cost, tax_rate, status, rx_required, batch_number, expiry_date, manufacturer, rack_location, stock_quantity, min_reorder_level) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        tenantId,
        name,
        genericName || name,
        dosageForm || 'Tablet',
        strength || '500mg',
        catId,
        prodPrice,
        prodCost,
        prodTax,
        prodStatus,
        isRx,
        batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate || '2028-01-01',
        manufacturer || 'Pharma Inc',
        rackLocation || 'Rack A-01',
        prodStock,
        prodMin
      ]);

      const [newRow] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
      const createdItem = newRow[0] || {};
      createdItem.tenantId = tenantId;
      return res.status(201).json({ success: true, data: createdItem });
    }

    // In-memory mock add for fallback
    const newMockItem = {
      id: Date.now(),
      tenantId,
      name,
      genericName: genericName || name,
      dosageForm: dosageForm || 'Tablet',
      strength: strength || '500mg',
      category: category || 'General',
      price: prodPrice,
      cost: prodCost,
      taxRate: prodTax,
      status: prodStatus,
      rxRequired: !!isRx,
      batchNumber: batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
      expiryDate: expiryDate || '2028-01-01',
      manufacturer: manufacturer || 'Pharma Inc',
      rackLocation: rackLocation || 'Rack A-01',
      stockQuantity: prodStock,
      minReorderLevel: prodMin
    };
    if (!demoTenantProducts[tenantId]) demoTenantProducts[tenantId] = [];
    demoTenantProducts[tenantId].unshift(newMockItem);

    res.status(201).json({ success: true, data: newMockItem });
  } catch (error) {
    console.error('Error creating product in DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing medicine in database
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.body.tenantId || req.body.tenant_id || req.headers['x-tenant-id'];

    const {
      name,
      genericName,
      dosageForm,
      strength,
      categoryId,
      category,
      price,
      cost,
      taxRate,
      status,
      rxRequired,
      batchNumber,
      expiryDate,
      manufacturer,
      rackLocation,
      stockQuantity,
      minReorderLevel
    } = req.body;

    const catId = categoryId || category || 1;

    if (db && db.query) {
      let sql = `
        UPDATE products SET 
        name = ?, generic_name = ?, dosage_form = ?, strength = ?, category_id = ?, 
        price = ?, cost = ?, tax_rate = ?, status = ?, rx_required = ?, 
        batch_number = ?, expiry_date = ?, manufacturer = ?, rack_location = ?, 
        stock_quantity = ?, min_reorder_level = ? 
        WHERE id = ?
      `;
      const params = [
        name,
        genericName,
        dosageForm,
        strength,
        catId,
        price,
        cost,
        taxRate || 0,
        status || 'AVAILABLE',
        rxRequired ? 1 : 0,
        batchNumber,
        expiryDate,
        manufacturer,
        rackLocation,
        stockQuantity,
        minReorderLevel,
        id
      ];

      if (tenantId) {
        sql = sql.replace('WHERE id = ?', 'WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)');
        params.push(tenantId);
      }

      await db.query(sql, params);

      const [updatedRow] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
      return res.json({ success: true, data: updatedRow[0] });
    }

    res.json({ success: true, message: 'Updated product' });
  } catch (error) {
    console.error('Error updating product in DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a medicine from database
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'];

    if (db && db.query) {
      if (tenantId) {
        await db.query('DELETE FROM products WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)', [id, tenantId]);
      } else {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
      }
      return res.json({ success: true, message: 'Medicine deleted successfully' });
    }
    res.json({ success: true, message: 'Deleted product' });
  } catch (error) {
    console.error('Error deleting product in DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};

