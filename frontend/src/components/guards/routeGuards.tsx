import { redirect } from '@tanstack/react-router';

interface RouteContext {
  auth: {
    isAuthenticated: boolean;
    hasRole: (requiredRoles: string | string[]) => boolean;
    hasScope: (requiredScopes: string | string[]) => boolean;
  };
}

export function requireAuth({ context, location }: { context: RouteContext; location: any }) {
  if (!context.auth.isAuthenticated) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    });
  }
}

export function requireRole(requiredRoles: string | string[]) {
  return ({ context, location }: { context: RouteContext; location: any }) => {
    requireAuth({ context, location });
    if (!context.auth.hasRole(requiredRoles)) {
      throw redirect({
        to: '/unauthorized',
        search: {
          from: location.href,
        },
      });
    }
  };
}

export function requireScope(requiredScopes: string | string[]) {
  return ({ context, location }: { context: RouteContext; location: any }) => {
    requireAuth({ context, location }); // First check if authenticated
    
    if (!context.auth.hasScope(requiredScopes)) {
      throw redirect({
        to: '/unauthorized',
        search: {
          from: location.href,
        },
      });
    }
  };
}