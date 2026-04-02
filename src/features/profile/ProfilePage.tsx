import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Settings, LogOut, Activity } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../auth/auth.store';
import { useDocQuery, useCollectionQuery } from '../../db/useFirestoreQuery';
import { siteDoc, inspectionsRef, defectsRef, query, where } from '../../db/collections';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { useTranslation } from '../../i18n/useTranslation';

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const [pinRevealed, setPinRevealed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { t } = useTranslation();

  const siteRef = currentUser?.siteId ? siteDoc(currentUser.siteId) : null;
  const site = useDocQuery<any>(siteRef, [currentUser?.siteId]);

  const inspQ = useMemo(
    () => currentUser?.role === 'worker' && currentUser.id
      ? query(inspectionsRef(), where('operatorId', '==', currentUser.id))
      : null,
    [currentUser?.id, currentUser?.role],
  );
  const inspections = useCollectionQuery<any>(inspQ, [currentUser?.id, currentUser?.role]);
  const inspectionCount = inspections?.length ?? 0;

  const defQ = useMemo(
    () => currentUser?.role === 'worker' && currentUser.id
      ? query(defectsRef(), where('reportedBy', '==', currentUser.id))
      : null,
    [currentUser?.id, currentUser?.role],
  );
  const defectsArr = useCollectionQuery<any>(defQ, [currentUser?.id, currentUser?.role]);
  const defectCount = defectsArr?.length ?? 0;

  if (!currentUser) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const roleLabel = currentUser.role === 'supervisor' ? t('role.supervisor') : t('role.worker');

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen bg-obsidian pb-24">
        <PageHeader title={t('page.profile')} />

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
                {roleLabel}
              </Badge>

              {/* Site */}
              {site && (
                <p className="text-sm text-text-secondary">
                  {t('label.site')}: <span className="text-text-primary font-medium">{site.name}</span>
                </p>
              )}

              {/* PIN */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-text-secondary">{t('label.pin')}:</span>
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

          {/* Language toggle */}
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-secondary">{t('label.language')}</p>
              <LanguageToggle />
            </div>
          </Card>

          {/* Operator stats */}
          {currentUser.role === 'worker' && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 px-1">
                {t('profile.yourActivity')}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Card className="flex flex-col items-center py-4 gap-1">
                  <span className="text-3xl font-bold text-amber-primary">
                    {inspectionCount ?? '—'}
                  </span>
                  <span className="text-xs text-text-secondary text-center">
                    {t('profile.inspectionsCompleted')}
                  </span>
                </Card>
                <Card className="flex flex-col items-center py-4 gap-1">
                  <span className="text-3xl font-bold text-amber-primary">
                    {defectCount ?? '—'}
                  </span>
                  <span className="text-xs text-text-secondary text-center">
                    {t('profile.defectsReported')}
                  </span>
                </Card>
              </div>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate('/my-activity')}
              >
                <Activity size={18} />
                {t('action.viewActivity')}
              </Button>
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
              {t('page.settings')}
            </Button>
          )}

          {/* App info */}
          <Card className="mt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              {t('profile.appInfo')}
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{t('profile.version')}</span>
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
              {t('action.signOut')}
            </Button>
          </div>
        </div>
      </div>

      {/* Logout confirmation modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title={t('action.signOut')}
      >
        <p className="text-text-secondary text-sm mb-6">
          {t('profile.logOutConfirmMsg')}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setLogoutModalOpen(false)}
          >
            {t('action.cancel')}
          </Button>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            {t('action.signOut')}
          </Button>
        </div>
      </Modal>
    </AnimatedPage>
  );
}
