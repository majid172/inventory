import { ref } from 'vue';

export interface AdminSupplier {
  id: number;
  supplier_id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const suppliers = ref<AdminSupplier[]>([
  { id: 1, supplier_id: "SUP_001", name: "Farm Co-op", contact_name: "Sarah Connor", email: "sarah@farmcoop.com", phone: "+1-555-0100", status: "ACTIVE" },
  { id: 2, supplier_id: "SUP_002", name: "Dairy Fresh Inc.", contact_name: "Michael Scott", email: "michael@dairyfresh.com", phone: "+1-555-0101", status: "ACTIVE" },
  { id: 3, supplier_id: "SUP_003", name: "Oat Organic Ltd.", contact_name: "Pam Beesly", email: "pam@oatorganic.com", phone: "+1-555-0102", status: "ACTIVE" },
  { id: 4, supplier_id: "SUP_004", name: "Eco Pack Co.", contact_name: "Jim Halpert", email: "jim@ecopack.com", phone: "+1-555-0103", status: "ACTIVE" }
]);

export function useAdminSuppliers() {
  const addSupplier = (sup: Partial<AdminSupplier>) => {
    const supId = `SUP_${String(suppliers.value.length + 1).padStart(3, '0')}`;
    suppliers.value.push({
      id: suppliers.value.length + 1,
      supplier_id: supId,
      name: sup.name || 'New Supplier Co.',
      contact_name: sup.contact_name || 'John Doe',
      email: sup.email || 'contact@supplier.com',
      phone: sup.phone || '+1-555-0000',
      status: sup.status || 'ACTIVE'
    });
  };

  const deleteSupplier = (id: number) => {
    suppliers.value = suppliers.value.filter(s => s.id !== id);
  };

  return {
    suppliers,
    addSupplier,
    deleteSupplier
  };
}
