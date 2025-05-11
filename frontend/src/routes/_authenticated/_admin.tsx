import { requireRole } from '@/components/guards/routeGuards';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: requireRole('admin'),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}