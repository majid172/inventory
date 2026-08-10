import ReportsTable from '@/app/components/admin/ReportsTable';

export default function ReportsPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Reports Management</h1>
          <p className="text-slate-500 font-medium text-sm">Review generated shift reports, sales analytics logs, and audit statements.</p>
        </div>
      </div>
      
      <ReportsTable />
    </div>
  );
}
