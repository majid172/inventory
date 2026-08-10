import OrdersTable from '@/app/components/admin/OrdersTable';

export default function OrdersPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Sales History</h1>
          <p className="text-slate-500 font-medium text-sm">Review POS customer purchase orders, discounts applied, total revenues, and payment methods.</p>
        </div>
      </div>
      
      <OrdersTable />
    </div>
  );
}
