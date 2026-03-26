import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, Database, Users, ClipboardList, Activity, Cpu } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { db } from '../../db/database';
import {
  DOWNTIME_CODES,
  DOWNTIME_CODE_LABELS,
  MACHINE_TYPE_LABELS,
} from '../../lib/constants';
import type { DowntimeCode, MachineType } from '../../lib/constants';

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SettingsPage() {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const [swStatus, setSwStatus] = useState<string>('Unknown');

  // Fetch storage estimate on mount
  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorageInfo({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwStatus(reg ? 'Registered' : 'Not registered');
      });
    } else {
      setSwStatus('Not supported');
    }
  }, []);

  const templates = useLiveQuery(() => db.inspectionTemplates.toArray(), []);
  const users = useLiveQuery(() => db.users.toArray(), []);
  const sites = useLiveQuery(() => db.sites.toArray(), []);

  // Build site id → name map
  const siteMap: Record<number, string> = {};
  if (sites) {
    for (const s of sites) {
      if (s.id !== undefined) siteMap[s.id] = s.name;
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await db.delete();
      window.location.reload();
    } catch {
      setResetting(false);
    }
  }

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen bg-obsidian pb-24">
        <PageHeader title="Settings" showBack />

        <div className="flex flex-col gap-6 p-4">

          {/* ── Data Management ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Database size={15} className="text-text-muted" />
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Data Management
              </p>
            </div>
            <Card>
              <p className="text-sm text-text-secondary mb-4">
                Deletes all local data and re-seeds the database on next load. This
                cannot be undone.
              </p>
              <Button
                variant="danger"
                fullWidth
                onClick={() => setResetModalOpen(true)}
              >
                <AlertTriangle size={16} />
                Reset All Data
              </Button>
            </Card>
          </section>

          {/* ── Inspection Templates ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={15} className="text-text-muted" />
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Inspection Templates
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {templates && templates.length > 0 ? (
                templates.map((t) => (
                  <Card key={t.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {MACHINE_TYPE_LABELS[t.machineType as MachineType] ?? t.machineType}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {t.items.length} checklist item{t.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant={t.isActive ? 'available' : 'deferred'}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-sm text-text-muted text-center">No templates found.</p>
                </Card>
              )}
            </div>
          </section>

          {/* ── Downtime Codes ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={15} className="text-text-muted" />
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Downtime Codes
              </p>
            </div>
            <Card>
              <div className="flex flex-col divide-y divide-border">
                {DOWNTIME_CODES.map((code) => (
                  <div key={code} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <span className="text-sm text-text-primary">
                      {DOWNTIME_CODE_LABELS[code as DowntimeCode]}
                    </span>
                    <span className="text-xs font-mono text-text-muted">{code}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* ── Users ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-text-muted" />
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Users
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {users && users.length > 0 ? (
                users.map((u) => (
                  <Card key={u.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{u.name}</p>
                        {u.siteId && siteMap[u.siteId] && (
                          <p className="text-xs text-text-muted mt-0.5">
                            {siteMap[u.siteId]}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          u.role === 'supervisor'
                            ? 'available'
                            : 'default'
                        }
                      >
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-sm text-text-muted text-center">No users found.</p>
                </Card>
              )}
            </div>
          </section>

          {/* ── App Info ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={15} className="text-text-muted" />
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                App Info
              </p>
            </div>
            <Card>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Version</span>
                  <span className="text-text-primary font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Service Worker</span>
                  <span className="text-text-primary font-medium">{swStatus}</span>
                </div>
                {storageInfo ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Storage Used</span>
                      <span className="text-text-primary font-medium">
                        {formatBytes(storageInfo.usage)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Storage Quota</span>
                      <span className="text-text-primary font-medium">
                        {formatBytes(storageInfo.quota)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Storage</span>
                    <span className="text-text-muted font-medium">Unavailable</span>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* Reset confirmation modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => !resetting && setResetModalOpen(false)}
        title="Reset All Data"
      >
        <div className="flex items-start gap-3 mb-4 p-3 bg-red-900/20 border border-red-800/40 rounded-xl">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            This will permanently delete all inspections, defects, repairs, and other
            records from this device. The database will be re-seeded with default data
            on next load.
          </p>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          This action cannot be undone. Are you sure?
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            disabled={resetting}
            onClick={() => setResetModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={resetting}
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </Modal>
    </AnimatedPage>
  );
}
