import { requireRole } from '@/components/guards/routeGuards.tsx';
import { createFileRoute } from '@tanstack/react-router';
import {ManagerLayout} from "@/components/layouts/manager.tsx";

export const Route = createFileRoute('/_authenticated/manager/_layout')({
  beforeLoad: requireRole(['admin', 'manager']), 
  component: ManagerLayout,
});

