import StockInTable from '@/app/components/admin/StockInTable';

export default function StockInPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Stock In Logs</h1>
          <p className="text-slate-500 font-medium text-sm">Review ingredient incoming receipts, cost statements, and supplier tracking statements.</p>
        </div>
      </div>
      
      <StockInTable />
    </div>
  );
}
