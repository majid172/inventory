import InventoryTable from '@/app/components/admin/InventoryTable';

export default function InventoryPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Inventory Management</h1>
          <p className="text-slate-500 font-medium text-sm">Manage your stock, track costs, and monitor expiry dates.</p>
        </div>
      </div>
      
      <InventoryTable />
    </div>
  );
}
