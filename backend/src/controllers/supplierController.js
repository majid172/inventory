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

const getSuppliers = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const [rows] = await db.query('SELECT * FROM suppliers WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
    
    // Map to frontend expected format
    const formattedSuppliers = rows.map(r => ({
      id: r.id,
      supplier_id: 'SUP_' + String(r.id).padStart(3, '0'),
      name: r.name,
      contact_name: r.contact_person || r.contact_name || '',
      email: r.email || '',
      phone: r.phone || '',
      status: r.is_active ? 'ACTIVE' : 'INACTIVE',
      due_amount: r.due_amount
    }));
    
    res.json({ success: true, count: formattedSuppliers.length, data: formattedSuppliers });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ success: false, message: 'Server error fetching suppliers' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const { name, contact_name, email, phone, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }
    
    const is_active = status === 'INACTIVE' ? 0 : 1;
    
    const [result] = await db.query(
      'INSERT INTO suppliers (tenant_id, name, contact_person, email, phone, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [tenantId, name, contact_name || null, email || null, phone || null, is_active]
    );
    
    const newSupplier = {
      id: result.insertId,
      supplier_id: 'SUP_' + String(result.insertId).padStart(3, '0'),
      name,
      contact_name,
      email,
      phone,
      status: is_active ? 'ACTIVE' : 'INACTIVE'
    };
    
    res.status(201).json({ success: true, data: newSupplier });
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ success: false, message: 'Server error creating supplier' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const { id } = req.params;
    const { name, contact_name, email, phone, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }
    
    const is_active = status === 'INACTIVE' ? 0 : 1;
    
    await db.query(
      'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, is_active = ? WHERE id = ? AND tenant_id = ?',
      [name, contact_name || null, email || null, phone || null, is_active, id, tenantId]
    );
    
    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({ success: false, message: 'Server error updating supplier' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const { id } = req.params;
    
    // Check if supplier is used in purchase orders or batches
    const [poRows] = await db.query('SELECT id FROM purchase_orders WHERE supplier_id = ? AND tenant_id = ? LIMIT 1', [id, tenantId]);
    if (poRows.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete supplier because it is linked to purchase orders.' });
    }

    const [result] = await db.query('DELETE FROM suppliers WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ success: false, message: 'Server error deleting supplier' });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
