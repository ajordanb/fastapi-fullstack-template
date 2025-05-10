import { requireRole } from '@/components/guards/routeGuards';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/_manager')({
  beforeLoad: requireRole(['admin', 'manager']), 
  component: ManagerLayout,
});

function ManagerLayout() {
  return (
    <div>
      <nav className="bg-blue-100 p-4">
        <h2>Manager Section</h2>
      </nav>
      <Outlet />
    </div>
  );
}