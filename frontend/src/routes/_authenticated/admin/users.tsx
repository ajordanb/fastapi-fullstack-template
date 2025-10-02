import { UserDashboard } from '@/components/pages/user/userDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
});

function UsersPage() {
  return <UserDashboard />;
}

