import WastageTable from '@/app/components/admin/WastageTable';

export default function WastagePage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Wastage Auditing</h1>
          <p className="text-slate-500 font-medium text-sm">Review ingredient loss logs, expired foods, damaged shipments, and spelling audit logs.</p>
        </div>
      </div>
      
      <WastageTable />
    </div>
  );
}
