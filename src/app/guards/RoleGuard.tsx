import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/auth.store';
import type { UserRole } from '../../lib/constants';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function RoleGuard({ children, roles }: RoleGuardProps) {
  const { isAuthenticated, currentUser } = useAuthStore();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    // Redirect to role-appropriate home
    switch (currentUser.role) {
      case 'operator':
        return <Navigate to="/machines" replace />;
      case 'mechanic':
        return <Navigate to="/repairs" replace />;
      case 'supervisor':
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
