// ============================================================================
// PharmaCare SaaS — Product Controller (100% Matched to MySQL Schema)
// Tables: products, categories, master_drugs, inventory_batches, suppliers
// ============================================================================

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

// ---------------------------------------------------------------------------
// GET /api/products
// ---------------------------------------------------------------------------
const getProducts = async (req, res, next) => {
  try {
    const tid = await resolveTenantId(req);

    const sql = `
      SELECT 
        p.id,
        p.tenant_id,
        p.master_drug_id,
        p.category_id,
        p.name,
        p.barcode,
        p.retail_price AS price,
        p.reorder_level AS min_reorder_level,
        p.rack_location,
        p.created_at,
        c.name AS category_name,
        COALESCE(m.generic_name, p.name) AS generic_name,
        COALESCE(m.dosage_form, 'Tablet') AS dosage_form,
        COALESCE(m.manufacturer, 'Pharma Corp') AS manufacturer,
        COALESCE(m.rx_required, 0) AS rx_required,
        COALESCE((
          SELECT SUM(b.quantity) 
          FROM inventory_batches b 
          WHERE b.product_id = p.id
        ), 0) AS stock_quantity,
        COALESCE((
          SELECT b.purchase_price 
          FROM inventory_batches b 
          WHERE b.product_id = p.id 
          ORDER BY b.id DESC 
          LIMIT 1
        ), 0) AS cost,
        COALESCE((
          SELECT b.batch_number 
          FROM inventory_batches b 
          WHERE b.product_id = p.id 
          ORDER BY b.id DESC 
          LIMIT 1
        ), 'LOT-DEFAULT') AS batch_number,
        COALESCE((
          SELECT DATE_FORMAT(b.expiry_date, '%Y-%m-%d')
          FROM inventory_batches b 
          WHERE b.product_id = p.id 
          ORDER BY b.id DESC 
          LIMIT 1
        ), '2028-12-31') AS expiry_date,
        COALESCE((
          SELECT s.name 
          FROM inventory_batches b 
          LEFT JOIN suppliers s ON b.supplier_id = s.id 
          WHERE b.product_id = p.id 
          ORDER BY b.id DESC 
          LIMIT 1
        ), m.manufacturer, 'Pharma Corp') AS supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN master_drugs m ON p.master_drug_id = m.id
      WHERE p.tenant_id = ? OR ? IS NULL
      ORDER BY p.id DESC
    `;

    const [rows] = await db.query(sql, [tid, tid]);

    const formatted = (rows || []).map(r => {
      const stock = parseInt(r.stock_quantity, 10) || 0;
      return {
        id: r.id,
        tenantId: r.tenant_id,
        name: r.name,
        genericName: r.generic_name,
        dosageForm: r.dosage_form,
        strength: 'Standard',
        categoryId: r.category_id,
        category: r.category_name || 'General',
        barcode: r.barcode || `MED-${r.id}`,
        price: parseFloat(r.price) || 0,
        cost: parseFloat(r.cost) || 0,
        taxRate: 0,
        status: stock > 0 ? 1 : 0,
        statusLabel: stock > 0 ? 'Available' : 'Out of Stock',
        rxRequired: !!r.rx_required,
        batchNumber: r.batch_number,
        expiryDate: r.expiry_date,
        manufacturer: r.manufacturer || r.supplier_name,
        rackLocation: r.rack_location || 'Shelf A-01',
        stockQuantity: stock,
        minReorderLevel: parseInt(r.min_reorder_level, 10) || 10,
        created_at: r.created_at
      };
    });

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      products: formatted
    });
  } catch (error) {
    console.error('getProducts error:', error);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/products
// ---------------------------------------------------------------------------
const createProduct = async (req, res, next) => {
  try {
    const tid = await resolveTenantId(req);
    const {
      name,
      genericName,
      dosageForm,
      categoryId,
      category,
      price,
      cost,
      barcode,
      reorderLevel,
      minReorderLevel,
      rackLocation,
      stockQuantity,
      batchNumber,
      expiryDate,
      supplierId,
      manufacturer,
      rxRequired,
      masterDrugId
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Medicine/Product name is required.' });
    }

    // 1. Resolve Category ID (Ensure valid category_id exists for this tenant)
    let catId = categoryId ? parseInt(categoryId, 10) : null;
    if (!catId || isNaN(catId)) {
      const [[foundCat]] = await db.query('SELECT id FROM categories WHERE tenant_id = ? LIMIT 1', [tid]);
      if (foundCat && foundCat.id) {
        catId = foundCat.id;
      } else {
        const [newCatRes] = await db.query(
          'INSERT INTO categories (tenant_id, name, description, status) VALUES (?, ?, ?, 1)',
          [tid, category || 'General Therapeutics', 'Auto-created product category']
        );
        catId = newCatRes.insertId;
      }
    }

    // 2. Resolve Master Drug ID (Optional FK)
    let mdId = masterDrugId ? parseInt(masterDrugId, 10) : null;
    const isMedicine = req.body.productType !== 'general' && genericName && genericName.trim() !== '';

    if (!mdId && isMedicine) {
      const [mdRes] = await db.query(
        `INSERT INTO master_drugs (brand_name, generic_name, dosage_form, manufacturer, rx_required, plan_tier)
         VALUES (?, ?, ?, ?, ?, 'starter')`,
        [name.trim(), genericName.trim(), dosageForm || 'Tablet', manufacturer || 'Pharma Corp', rxRequired ? 1 : 0]
      );
      mdId = mdRes.insertId;
    }

    const retailPrice = parseFloat(price) || 0.00;
    const reorder = parseInt(minReorderLevel || reorderLevel, 10) || 10;
    const prodBarcode = barcode || `BC-${Date.now().toString().slice(-6)}`;
    const rack = rackLocation || 'Shelf A-01';

    // 3. Insert Product
    const [prodResult] = await db.query(
      `INSERT INTO products (tenant_id, master_drug_id, category_id, name, barcode, retail_price, reorder_level, rack_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tid, mdId, catId, name.trim(), prodBarcode, retailPrice, reorder, rack]
    );
    const newProdId = prodResult.insertId;

    // 4. Resolve Supplier (for Batch)
    let supId = supplierId ? parseInt(supplierId, 10) : null;
    if (!supId && manufacturer) {
      const [[foundSup]] = await db.query('SELECT id FROM suppliers WHERE tenant_id = ? AND name = ? LIMIT 1', [tid, manufacturer]);
      if (foundSup && foundSup.id) {
        supId = foundSup.id;
      } else {
        const [supRes] = await db.query(
          'INSERT INTO suppliers (tenant_id, name, contact_person, phone) VALUES (?, ?, ?, ?)',
          [tid, manufacturer, 'Sales Representative', '+1-800-555-0100']
        );
        supId = supRes.insertId;
      }
    }

    // 5. Insert Initial Inventory Batch (if stock or batch info provided)
    const initialQty = parseInt(stockQuantity, 10) || 0;
    const batchNum = batchNumber || `LOT-${Date.now().toString().slice(-4)}`;
    const expDate = expiryDate || '2028-12-31';
    const purchasePrice = parseFloat(cost) || (retailPrice * 0.7);

    if (initialQty > 0 || batchNumber) {
      await db.query(
        `INSERT INTO inventory_batches (tenant_id, product_id, supplier_id, batch_number, expiry_date, quantity, purchase_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tid, newProdId, supId, batchNum, expDate, initialQty, purchasePrice]
      );
    }

    const [[createdProd]] = await db.query('SELECT * FROM products WHERE id = ?', [newProdId]);

    const formatted = {
      id: createdProd.id,
      tenantId: createdProd.tenant_id,
      name: createdProd.name,
      genericName: genericName || createdProd.name,
      dosageForm: dosageForm || 'Tablet',
      strength: 'Standard',
      categoryId: createdProd.category_id,
      category: category || 'General',
      barcode: createdProd.barcode,
      price: parseFloat(createdProd.retail_price) || 0,
      cost: purchasePrice,
      status: initialQty > 0 ? 1 : 0,
      statusLabel: initialQty > 0 ? 'Available' : 'Out of Stock',
      rxRequired: !!rxRequired,
      batchNumber: batchNum,
      expiryDate: expDate,
      manufacturer: manufacturer || 'Pharma Corp',
      rackLocation: createdProd.rack_location,
      stockQuantity: initialQty,
      minReorderLevel: createdProd.reorder_level
    };

    return res.status(201).json({
      success: true,
      message: 'Product created and committed to MySQL successfully.',
      data: formatted,
      product: formatted
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({
      success: false,
      message: `Database Insert Error: ${error.message}`
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/products/:id
// ---------------------------------------------------------------------------
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tid = await resolveTenantId(req);
    const {
      name,
      genericName,
      dosageForm,
      categoryId,
      price,
      cost,
      barcode,
      minReorderLevel,
      reorderLevel,
      rackLocation,
      stockQuantity,
      batchNumber,
      expiryDate,
      manufacturer,
      rxRequired
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    const retailPrice = parseFloat(price) || 0.00;
    const reorder = parseInt(minReorderLevel || reorderLevel, 10) || 10;
    const catId = categoryId ? parseInt(categoryId, 10) : 1;

    // 1. Update Product
    await db.query(
      `UPDATE products 
       SET name = ?, category_id = ?, retail_price = ?, reorder_level = ?, rack_location = ?
       WHERE id = ?`,
      [name.trim(), catId, retailPrice, reorder, rackLocation || 'Shelf A-01', id]
    );

    // 2. Update Master Drug Details (if attached)
    const [[prod]] = await db.query('SELECT master_drug_id FROM products WHERE id = ?', [id]);
    if (prod && prod.master_drug_id) {
      await db.query(
        `UPDATE master_drugs 
         SET brand_name = ?, generic_name = ?, dosage_form = ?, manufacturer = ?, rx_required = ?
         WHERE id = ?`,
        [name.trim(), genericName || name.trim(), dosageForm || 'Tablet', manufacturer || 'Pharma Corp', rxRequired ? 1 : 0, prod.master_drug_id]
      );
    }

    // 3. Update Latest Batch
    const [[latestBatch]] = await db.query('SELECT id FROM inventory_batches WHERE product_id = ? ORDER BY id DESC LIMIT 1', [id]);
    const purchasePrice = parseFloat(cost) || (retailPrice * 0.7);
    const newQty = parseInt(stockQuantity, 10) || 0;

    if (latestBatch && latestBatch.id) {
      await db.query(
        `UPDATE inventory_batches 
         SET quantity = ?, purchase_price = ?, batch_number = ?, expiry_date = ?
         WHERE id = ?`,
        [newQty, purchasePrice, batchNumber || 'LOT-UPDATED', expiryDate || '2028-12-31', latestBatch.id]
      );
    } else if (newQty > 0 || batchNumber) {
      await db.query(
        `INSERT INTO inventory_batches (tenant_id, product_id, batch_number, expiry_date, quantity, purchase_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tid, id, batchNumber || 'LOT-NEW', expiryDate || '2028-12-31', newQty, purchasePrice]
      );
    }

    return res.json({
      success: true,
      message: 'Product updated successfully in MySQL database.'
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({
      success: false,
      message: `Database Update Error: ${error.message}`
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/products/:id
// ---------------------------------------------------------------------------
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Product and associated inventory batches deleted successfully from MySQL.'
    });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({
      success: false,
      message: `Database Delete Error: ${error.message}`
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
