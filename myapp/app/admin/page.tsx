import DashboardStats from '../components/admin/DashboardStats';
import InventoryTable from '../components/admin/InventoryTable';

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Overview</h1>
      <DashboardStats />
      <InventoryTable />
    </div>
  );
}
