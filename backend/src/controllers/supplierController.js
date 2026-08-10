let suppliers = [
  { id: 1, supplierId: "SUP_000", name: "Apple Inc", contactName: "Sarah Connor", email: "sarah.connor@apple.com", phone: "+1-555-0100", status: "ACTIVE" },
  { id: 2, supplierId: "SUP_001", name: "Nike Logistics", contactName: "Michael Scott", email: "michael.scott@nike.com", phone: "+1-555-0101", status: "ACTIVE" }
];

const getSuppliers = (req, res) => {
  res.json({ success: true, count: suppliers.length, data: suppliers });
};

const createSupplier = (req, res) => {
  const newSup = {
    id: suppliers.length + 1,
    supplierId: `SUP_${String(suppliers.length).padStart(3, '0')}`,
    ...req.body
  };
  suppliers.push(newSup);
  res.status(201).json({ success: true, data: newSup });
};

module.exports = {
  getSuppliers,
  createSupplier
};
