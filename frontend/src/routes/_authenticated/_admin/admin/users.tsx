import UserManagementGrid from '@/components/user/userManagementGrid';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/_admin/admin/users')({
  component: UsersManagement,
});

function UsersManagement() {
  return (
    <div>
      <UserManagementGrid />
    </div>
  );
}