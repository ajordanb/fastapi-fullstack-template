import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import Layout from '@/components/layouts/dashboard';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) return null;
  
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

