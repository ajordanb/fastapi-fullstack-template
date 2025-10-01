import { createFileRoute } from '@tanstack/react-router'
import { DramatiqDashboard } from '@/components/pages/dramatiq/dramatiqDashboard'

export const Route = createFileRoute('/_authenticated/admin/jobs')({
  component: JobsPage,

})

function JobsPage() {
  return <DramatiqDashboard />
}
