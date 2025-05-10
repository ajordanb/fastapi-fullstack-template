import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/unauthorized')({
  component: RouteComponent,
})

function RouteComponent() {
return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
      <p className="text-gray-600 mb-8">
        You don't have permission to access this page.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go back to home
      </Link>
    </div>
  );
}