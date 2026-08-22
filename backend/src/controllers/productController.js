const db = require('../config/db');

// @desc    Get all medicines/products from database matching exact schema
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    if (db && db.query) {
      // 1. Query products JOINED with master_drug_catalog to get plan_tier_access, generic_name, dosage_form
      const sql = `
        SELECT 
          p.id,
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
        ORDER BY p.id ASC
      `;
      const [rows] = await db.query(sql);

      if (rows && Array.isArray(rows) && rows.length > 0) {
        const formatted = rows.map(r => ({
          id: r.id,
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
        return res.json({ success: true, count: formatted.length, data: formatted });
      }

      // 2. Fallback: If products table is empty for new store, query master_drug_catalog directly!
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
        return res.json({ success: true, count: formattedMaster.length, data: formattedMaster });
      }
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (error) {
    console.error('Database query error in getProducts:', error.message);
    return res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

// @desc    Create a new medicine in database according to exact schema
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
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
        (name, generic_name, dosage_form, strength, category_id, price, cost, tax_rate, status, rx_required, batch_number, expiry_date, manufacturer, rack_location, stock_quantity, min_reorder_level) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
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
      return res.status(201).json({ success: true, data: newRow[0] });
    }

    res.status(500).json({ success: false, message: 'Database pool unavailable' });
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
      const sql = `
        UPDATE products SET 
        name = ?, generic_name = ?, dosage_form = ?, strength = ?, category_id = ?, 
        price = ?, cost = ?, tax_rate = ?, status = ?, rx_required = ?, 
        batch_number = ?, expiry_date = ?, manufacturer = ?, rack_location = ?, 
        stock_quantity = ?, min_reorder_level = ? 
        WHERE id = ?
      `;

      await db.query(sql, [
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
      ]);

      const [updatedRow] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
      return res.json({ success: true, data: updatedRow[0] });
    }

    res.status(500).json({ success: false, message: 'Database pool unavailable' });
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
    if (db && db.query) {
      await db.query('DELETE FROM products WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Medicine deleted successfully' });
    }
    res.status(500).json({ success: false, message: 'Database pool unavailable' });
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
