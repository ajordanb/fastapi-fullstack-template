import { RoleDashboard } from '@/components/pages/role/roleDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/roles')({
  component: RolesPage,
});

function RolesPage() {
  return <RoleDashboard />;
}
