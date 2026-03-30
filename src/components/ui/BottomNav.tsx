import { NavLink } from 'react-router-dom';
import {
  Cog,
  AlertTriangle,
  Clock,
  User,
  BarChart3,
  Grid3X3,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../features/auth/auth.store';
import { useTranslation } from '../../i18n/useTranslation';
import type { UserRole } from '../../lib/constants';

interface TabConfig {
  path: string;
  labelKey: string;
  icon: LucideIcon;
}

const TABS_BY_ROLE: Record<UserRole, TabConfig[]> = {
  worker: [
    { path: '/machines', labelKey: 'nav.machines', icon: Cog },
    { path: '/defects', labelKey: 'nav.defects', icon: AlertTriangle },
    { path: '/downtime', labelKey: 'nav.downtime', icon: Clock },
    { path: '/profile', labelKey: 'nav.profile', icon: User },
  ],
  supervisor: [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: BarChart3 },
    { path: '/availability', labelKey: 'nav.availability', icon: Grid3X3 },
    { path: '/service-orders', labelKey: 'nav.serviceOrders', icon: Truck },
    { path: '/defects', labelKey: 'nav.defects', icon: AlertTriangle },
    { path: '/profile', labelKey: 'nav.profile', icon: User },
  ],
};

export default function BottomNav() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { t } = useTranslation();
  const role = currentUser?.role ?? 'worker';
  const tabs = TABS_BY_ROLE[role] ?? TABS_BY_ROLE.worker;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-slate-dark border-t border-border flex items-stretch z-40 safe-area-inset-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
      {tabs.map(({ path, labelKey, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            [
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-150 relative',
              isActive ? 'text-amber-primary' : 'text-text-muted',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-primary rounded-b-full" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
