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
  { id: 1, supplier_id: "SUP_001", name: "GSK Pharmaceuticals Ltd.", contact_name: "Sarah Connor", email: "orders@gskpharma.com", phone: "+1-800-555-0100", status: "ACTIVE" },
  { id: 2, supplier_id: "SUP_002", name: "Pfizer Wholesale Corp", contact_name: "Michael Vance", email: "supply@pfizer.com", phone: "+1-800-555-0101", status: "ACTIVE" },
  { id: 3, supplier_id: "SUP_003", name: "Novartis Health Distribution", contact_name: "Patricia Lee", email: "logistics@novartis.com", phone: "+1-800-555-0102", status: "ACTIVE" },
  { id: 4, supplier_id: "SUP_004", name: "McKesson Medical-Surgical", contact_name: "James Thorne", email: "support@mckesson.com", phone: "+1-800-555-0103", status: "ACTIVE" },
  { id: 5, supplier_id: "SUP_005", name: "Bayer Healthcare Direct", contact_name: "Elena Rostova", email: "b2b@bayer.com", phone: "+1-800-555-0104", status: "ACTIVE" }
]);

export function useAdminSuppliers() {
  const addSupplier = (sup: Partial<AdminSupplier>) => {
    const supId = `SUP_${String(suppliers.value.length + 1).padStart(3, '0')}`;
    suppliers.value.push({
      id: suppliers.value.length + 1,
      supplier_id: supId,
      name: sup.name || 'New Pharma Distributor',
      contact_name: sup.contact_name || 'John Doe',
      email: sup.email || 'contact@distributor.com',
      phone: sup.phone || '+1-800-555-0000',
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
