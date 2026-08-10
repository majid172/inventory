import SuppliersTable from '@/app/components/admin/SuppliersTable';

export default function SuppliersPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Suppliers Directory</h1>
          <p className="text-slate-500 font-medium text-sm">Manage active suppliers, contact details, email logs, and fulfillment status indicators.</p>
        </div>
      </div>
      
      <SuppliersTable />
    </div>
  );
}
