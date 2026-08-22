const db = require('../config/db');

// @desc    Get all medicines/products from database matching exact schema
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    if (db && db.query) {
      const sql = `
        SELECT p.*, c.name AS category_name, c.id AS cat_code 
        FROM products p 
        LEFT JOIN categories c ON (p.category_id = c.id OR p.category_id = c.id)
        ORDER BY p.id ASC
      `;
      const [rows] = await db.query(sql);

      if (rows && Array.isArray(rows)) {
        const formatted = rows.map(r => ({
          id: r.id,
          name: r.name,
          genericName: r.generic_name || r.name,
          dosageForm: r.dosage_form || 'Tablet',
          strength: r.strength || '',
          categoryId: r.category_id,
          category: r.category_name || r.category_id || 'General',
          price: parseFloat(r.price) || 0,
          cost: parseFloat(r.cost) || 0,
          taxRate: parseFloat(r.tax_rate) || 0,
          status: r.status || 'AVAILABLE',
          rxRequired: !!r.rx_required,
          batchNumber: r.batch_number || `BATCH-${r.id}`,
          expiryDate: r.expiry_date ? String(r.expiry_date).split('T')[0] : '2027-12-31',
          manufacturer: r.manufacturer || 'Pharma Corp',
          rackLocation: r.rack_location || 'Rack A-01',
          stockQuantity: r.stock_quantity || 100,
          minReorderLevel: r.min_reorder_level || 15
        }));
        return res.json({ success: true, count: formatted.length, data: formatted });
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
