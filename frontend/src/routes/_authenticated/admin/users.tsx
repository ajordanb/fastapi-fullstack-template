import UserManagementGrid from '@/components/user/userManagementGrid.tsx';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersManagement,
});

function UsersManagement() {
  return (
    <div>
      <UserManagementGrid />
    </div>
  );
}