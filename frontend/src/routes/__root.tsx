import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanstackQueryLayout from '../integrations/tanstack-query/layout'

import type { QueryClient } from '@tanstack/react-query'
import type { AuthContextType } from '@/contexts/auth/model';
import {NotFoundPage} from "@/components/pages/misc/notFound.tsx";

interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthContextType;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <TanstackQueryLayout />
    </>
  ),
    notFoundComponent: () => <NotFoundPage/>,
})
