import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/manager/reports')({
  component: Reports,
});

function Reports() {
  return (
    <div>
      <h1>Reports</h1>
      <p>Managers and admins can see this page</p>
    </div>
  );
}