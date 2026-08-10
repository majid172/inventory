import StockOutTable from '@/app/components/admin/StockOutTable';

export default function StockOutPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Stock Out Logs</h1>
          <p className="text-slate-500 font-medium text-sm">Review ingredient consumption details, dispatch reasons, and stock outflows.</p>
        </div>
      </div>
      
      <StockOutTable />
    </div>
  );
}
