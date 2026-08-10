import CategoriesTable from '@/app/components/admin/CategoriesTable';

export default function CategoriesPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Product Categories</h1>
          <p className="text-slate-500 font-medium text-sm">Organize store items and beverages into custom classification menus for cashier navigation.</p>
        </div>
      </div>
      
      <CategoriesTable />
    </div>
  );
}
