import IngredientsTable from '@/app/components/admin/IngredientsTable';

export default function IngredientsPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Ingredients Inventory</h1>
          <p className="text-slate-500 font-medium text-sm">Manage raw materials, track stock levels, measurement units, and set up supplier reorder points.</p>
        </div>
      </div>
      
      <IngredientsTable />
    </div>
  );
}
