import UserManagementGrid from '@/components/pages/user/userManagementGrid.tsx';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UserManagementGrid,
});

