const db = require('../config/db');

const getCategories = async (req, res, next) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new category in database
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { categoryId, name, slug, status } = req.body;
    
    const catId = categoryId || `CAT_${Date.now()}`;
    const catSlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : '');
    const catStatus = status || 'ACTIVE';

    const [result] = await db.query(
      'INSERT INTO categories (category_id, name, slug, status) VALUES (?, ?, ?, ?)',
      [catId, name, catSlug, catStatus]
    );

    const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      data: newCategory[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, status } = req.body;

    const catSlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : '');

    await db.query(
      'UPDATE categories SET name = ?, slug = ?, status = ? WHERE id = ?',
      [name, catSlug, status, id]
    );

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
