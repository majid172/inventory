import PurchaseOrdersTable from '@/app/components/admin/PurchaseOrdersTable';

export default function PurchaseOrdersPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Purchase Orders</h1>
          <p className="text-slate-500 font-medium text-sm">Issue procurement orders, track supplier delivery states, and view total billing values.</p>
        </div>
      </div>
      
      <PurchaseOrdersTable />
    </div>
  );
}
