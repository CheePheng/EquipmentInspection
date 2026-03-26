import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Eye, EyeOff, Settings, LogOut } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../auth/auth.store';
import { db } from '../../db/database';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeVariant(role: string) {
  if (role === 'supervisor') return 'available' as const;
  return 'default' as const;
}

function getRoleLabel(role: string): string {
  if (role === 'supervisor') return 'Supervisor';
  return 'Worker';
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const [pinRevealed, setPinRevealed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const site = useLiveQuery(
    () => (currentUser?.siteId ? db.sites.get(currentUser.siteId) : undefined),
    [currentUser?.siteId]
  );

  const inspectionCount = useLiveQuery(
    () =>
      currentUser?.role === 'worker' && currentUser.id
        ? db.inspections.where('operatorId').equals(currentUser.id).count()
        : Promise.resolve(0),
    [currentUser?.id, currentUser?.role]
  );

  const defectCount = useLiveQuery(
    () =>
      currentUser?.role === 'worker' && currentUser.id
        ? db.defects.where('reportedBy').equals(currentUser.id).count()
        : Promise.resolve(0),
    [currentUser?.id, currentUser?.role]
  );

  if (!currentUser) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen bg-obsidian pb-24">
        <PageHeader title="Profile" />

        <div className="flex flex-col gap-4 p-4">
          {/* User info card */}
          <Card>
            <div className="flex flex-col items-center gap-3 py-2">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-amber-primary flex items-center justify-center text-obsidian text-2xl font-bold select-none">
                {getInitials(currentUser.name)}
              </div>

              {/* Name */}
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">{currentUser.name}</p>
              </div>

              {/* Role badge */}
              <Badge variant={getRoleBadgeVariant(currentUser.role)}>
                {getRoleLabel(currentUser.role)}
              </Badge>

              {/* Site */}
              {site && (
                <p className="text-sm text-text-secondary">
                  Site: <span className="text-text-primary font-medium">{site.name}</span>
                </p>
              )}

              {/* PIN */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-text-secondary">PIN:</span>
                <span className="text-sm font-mono text-text-primary tracking-widest">
                  {pinRevealed ? currentUser.pin : '••••'}
                </span>
                <button
                  onClick={() => setPinRevealed((v) => !v)}
                  aria-label={pinRevealed ? 'Hide PIN' : 'Reveal PIN'}
                  className="text-text-muted hover:text-amber-primary transition-colors duration-150"
                >
                  {pinRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </Card>

          {/* Operator stats */}
          {currentUser.role === 'worker' && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 px-1">
                Your Activity
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Card className="flex flex-col items-center py-4 gap-1">
                  <span className="text-3xl font-bold text-amber-primary">
                    {inspectionCount ?? '—'}
                  </span>
                  <span className="text-xs text-text-secondary text-center">
                    Inspections Completed
                  </span>
                </Card>
                <Card className="flex flex-col items-center py-4 gap-1">
                  <span className="text-3xl font-bold text-amber-primary">
                    {defectCount ?? '—'}
                  </span>
                  <span className="text-xs text-text-secondary text-center">
                    Defects Reported
                  </span>
                </Card>
              </div>
            </div>
          )}

          {/* Supervisor: go to settings */}
          {currentUser.role === 'supervisor' && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} />
              Settings
            </Button>
          )}

          {/* App info */}
          <Card className="mt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              App Info
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Version</span>
                <span className="text-text-primary font-medium">CCT FieldOps v1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Mode</span>
                <span className="text-text-primary font-medium">Offline-first PWA</span>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <div className="mt-2">
            <Button
              variant="danger"
              fullWidth
              onClick={() => setLogoutModalOpen(true)}
            >
              <LogOut size={18} />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Logout confirmation modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Log Out"
      >
        <p className="text-text-secondary text-sm mb-6">
          Are you sure you want to log out? You will need your PIN to log back in.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setLogoutModalOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </Modal>
    </AnimatedPage>
  );
}
