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
    
    // Fallback generated category_id if not provided
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

module.exports = {
  getCategories,
  createCategory
};

