import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/auth.store';
import type { UserRole } from '../../lib/constants';

interface RoleGuardProps {
  children: ReactNode;
  roles?: UserRole[];
}

export default function RoleGuard({ children, roles }: RoleGuardProps) {
  const currentUser = useAuthStore((s) => s.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    // Redirect to role-appropriate home
    switch (currentUser.role) {
      case 'worker':
        return <Navigate to="/machines" replace />;
      case 'supervisor':
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
