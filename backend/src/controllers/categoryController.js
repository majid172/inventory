// ============================================================================
// PharmaCare SaaS — Category Controller (Strict Multi-Tenant Scoped)
// ============================================================================

const db = require('../config/db');

// Helper to strictly resolve authenticated tenant_id
const resolveTenantId = async (req) => {
  if (req.tenantId && req.tenantId !== 'SYSTEM') {
    return parseInt(req.tenantId, 10);
  }
  if (req.user && req.user.tenantId && req.user.tenantId !== 'SYSTEM') {
    return parseInt(req.user.tenantId, 10);
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
// GET /api/categories — Strictly return categories for the current tenant
// ---------------------------------------------------------------------------
const getCategories = async (req, res, next) => {
  try {
    const tid = await resolveTenantId(req);
    const sql = `
      SELECT 
        c.id,
        c.tenant_id,
        c.name,
        c.description,
        COALESCE(c.status, 1) AS status,
        COALESCE((
          SELECT COUNT(*) 
          FROM products p 
          WHERE p.category_id = c.id AND p.tenant_id = c.tenant_id
        ), 0) AS product_count 
      FROM categories c 
      WHERE c.tenant_id = ?
      ORDER BY c.id DESC
    `;
    const [categories] = await db.query(sql, [tid]);

    const formatted = (categories || []).map(cat => {
      const statusInt = parseInt(cat.status, 10) === 0 ? 0 : 1;
      return {
        id: cat.id,
        tenant_id: cat.tenant_id,
        category_id: `CAT_${cat.id}`,
        categoryId: `CAT_${cat.id}`,
        name: cat.name,
        slug: cat.name ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
        description: cat.description || '',
        status: statusInt,
        statusLabel: statusInt === 1 ? 'ACTIVE' : 'INACTIVE',
        product_count: parseInt(cat.product_count, 10) || 0
      };
    });

    return res.json({
      success: true,
      tenantId: tid,
      count: formatted.length,
      data: formatted,
      categories: formatted
    });
  } catch (error) {
    console.error('getCategories error:', error);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/categories — Store category with authenticated tenant_id
// ---------------------------------------------------------------------------
const createCategory = async (req, res, next) => {
  try {
    const tid = await resolveTenantId(req);
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const statusInt = (status === 0 || status === '0' || status === 'INACTIVE') ? 0 : 1;

    const [result] = await db.query(
      'INSERT INTO categories (tenant_id, name, description, status) VALUES (?, ?, ?, ?)',
      [tid, name.trim(), description || '', statusInt]
    );

    const [[newCat]] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    const formatted = {
      id: newCat.id,
      tenant_id: newCat.tenant_id,
      category_id: `CAT_${newCat.id}`,
      categoryId: `CAT_${newCat.id}`,
      name: newCat.name,
      slug: newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newCat.description || '',
      status: parseInt(newCat.status, 10),
      statusLabel: parseInt(newCat.status, 10) === 1 ? 'ACTIVE' : 'INACTIVE',
      product_count: 0
    };

    return res.status(201).json({
      success: true,
      message: 'Category created successfully in MySQL.',
      data: formatted,
      category: formatted
    });
  } catch (error) {
    console.error('createCategory error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to insert category: ${error.message}`
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/categories/:id — Strictly update only this tenant's category
// ---------------------------------------------------------------------------
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tid = await resolveTenantId(req);
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const statusInt = (status === 0 || status === '0' || status === 'INACTIVE') ? 0 : 1;

    await db.query(
      'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [name.trim(), description || '', statusInt, id, tid]
    );

    const [[updatedCat]] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    if (!updatedCat) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or does not belong to this tenant.'
      });
    }

    const formatted = {
      id: updatedCat.id,
      tenant_id: updatedCat.tenant_id,
      category_id: `CAT_${updatedCat.id}`,
      categoryId: `CAT_${updatedCat.id}`,
      name: updatedCat.name,
      slug: updatedCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: updatedCat.description || '',
      status: parseInt(updatedCat.status, 10),
      statusLabel: parseInt(updatedCat.status, 10) === 1 ? 'ACTIVE' : 'INACTIVE',
      product_count: 0
    };

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      data: formatted,
      category: formatted
    });
  } catch (error) {
    console.error('updateCategory error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to update category: ${error.message}`
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/categories/:id — Strictly delete only this tenant's category
// ---------------------------------------------------------------------------
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tid = await resolveTenantId(req);

    await db.query('DELETE FROM categories WHERE id = ? AND tenant_id = ?', [id, tid]);

    return res.json({
      success: true,
      message: 'Category deleted successfully from MySQL.'
    });
  } catch (error) {
    console.error('deleteCategory error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete category: ${error.message}`
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
