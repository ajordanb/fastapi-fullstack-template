import { requireRole } from '@/components/guards/routeGuards';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: requireRole('admin'),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div>
      <nav className="bg-red-100 p-4">
        <h2>Admin Section</h2>
      </nav>
      <Outlet />
    </div>
  );
}