import { createFileRoute, Outlet } from '@tanstack/react-router';
import Layout from '@/components/layouts/dashboard';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}