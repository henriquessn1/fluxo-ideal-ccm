import { useAuth } from './AuthContext';

export function usePrivateRoute(roles?: string[], requireAllRoles?: boolean) {
  const { isAuthenticated, isLoading, hasRole, hasAnyRole } = useAuth();

  if (isLoading) return { canAccess: false, isLoading: true };
  if (!isAuthenticated) return { canAccess: false, isLoading: false, reason: 'not_authenticated' };

  if (roles && roles.length > 0) {
    const hasPermission = requireAllRoles 
      ? roles.every(role => hasRole(role))
      : hasAnyRole(roles);
    
    if (!hasPermission) {
      return { canAccess: false, isLoading: false, reason: 'insufficient_permissions' };
    }
  }

  return { canAccess: true, isLoading: false };
}