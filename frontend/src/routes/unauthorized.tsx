import { createFileRoute } from '@tanstack/react-router'
import {UnauthorizedRouteComponent} from "@/components/pages/misc/unauthorized.tsx";

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedRouteComponent,
})

