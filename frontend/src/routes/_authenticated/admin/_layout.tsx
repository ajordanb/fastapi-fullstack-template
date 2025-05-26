import { requireRole } from '@/components/guards/routeGuards.tsx';
import { createFileRoute } from '@tanstack/react-router';
import {AdminLayout} from "@/components/layouts/admin.tsx";

export const Route = createFileRoute('/_authenticated/admin/_layout')({
  beforeLoad: requireRole('admin'),
  component: AdminLayout,
});
