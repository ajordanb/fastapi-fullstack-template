import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/_admin/users')({
  component: UsersManagement,
});

function UsersManagement() {
  return (
    <div>
      <h1>Users Dashboard</h1>
    </div>
  );
}