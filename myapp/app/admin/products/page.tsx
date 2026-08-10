import ProductsTable from '@/app/components/admin/ProductsTable';

export default function ProductsPage() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Products Management</h1>
          <p className="text-slate-500 font-medium text-sm">Manage your product items, pricing, statuses, and history logs.</p>
        </div>
      </div>
      
      <ProductsTable />
    </div>
  );
}
