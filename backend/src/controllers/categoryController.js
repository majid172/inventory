let categories = [
  { id: 1, categoryId: "CAT_001", name: "Hot Drinks", slug: "hot-drinks", productCount: 15, status: "ACTIVE" },
  { id: 2, categoryId: "CAT_002", name: "Cold Drinks", slug: "cold-drinks", productCount: 8, status: "ACTIVE" }
];

const getCategories = (req, res) => {
  res.json({ success: true, count: categories.length, data: categories });
};

const createCategory = (req, res) => {
  const newCat = {
    id: categories.length + 1,
    categoryId: `CAT_${String(categories.length + 1).padStart(3, '0')}`,
    ...req.body
  };
  categories.push(newCat);
  res.status(201).json({ success: true, data: newCat });
};

module.exports = {
  getCategories,
  createCategory
};
