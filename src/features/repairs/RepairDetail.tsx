import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ClipboardList } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { useRepair, claimRepair, updateRepairStatus, addRepairNote, updatePartsNeeded } from './useRepairs';
import { useDefect, useDefectPhotos } from '../defects/useDefects';
import { useMachine } from '../machines/useMachines';
import { PhotoGrid } from '../defects/PhotoGrid';
import { db } from '../../db/database';
import { formatDateTime } from '../../lib/utils';
import { MACHINE_TYPE_LABELS } from '../../lib/constants';

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>();
  const repairId = Number(id);

  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const repair = useRepair(repairId);
  const defect = useDefect(repair?.defectId ?? 0);
  const photos = useDefectPhotos(repair?.defectId ?? 0);
  const machine = useMachine(repair?.machineId ?? 0);

  // Look up all users for displaying mechanic names in action notes
  const users = useLiveQuery(() => db.users.toArray());

  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [parts, setParts] = useState<string | null>(null); // null = not yet overridden by user
  const partsRef = useRef<HTMLTextAreaElement>(null);

  // ---- Guard: loading ----
  if (repair === undefined) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AnimatedPage>
    );
  }

  // ---- Guard: not found ----
  if (repair === null) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-obsidian">
          <PageHeader title="Repair Not Found" showBack />
          <EmptyState
            icon={ClipboardList}
            title="Repair not found"
            description="This repair record doesn't exist or was deleted."
          />
        </div>
      </AnimatedPage>
    );
  }

  const getUserName = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user?.name ?? `Mechanic #${userId}`;
  };

  // Parts value: user's local edit state takes priority, otherwise repair value
  const partsValue = parts !== null ? parts : (repair.partsNeeded ?? '');

  const handleClaimTask = async () => {
    if (!currentUser) return;
    setActionLoading(true);
    try {
      await claimRepair(repairId, currentUser.id!);
      addToast('Task claimed — assigned to you', 'success');
    } catch {
      addToast('Failed to claim task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      await updateRepairStatus(repairId, 'in-progress');
      addToast('Status updated to In Progress', 'success');
    } catch {
      addToast('Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkFixed = async () => {
    setActionLoading(true);
    try {
      await updateRepairStatus(repairId, 'completed', repair.defectId);
      addToast('Repair marked as fixed', 'success');
    } catch {
      addToast('Failed to mark as fixed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDefer = async () => {
    setActionLoading(true);
    try {
      await updateRepairStatus(repairId, 'deferred');
      addToast('Repair deferred', 'info');
    } catch {
      addToast('Failed to defer repair', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !currentUser) return;
    setSavingNote(true);
    try {
      await addRepairNote(repairId, noteText.trim(), currentUser.id!);
      setNoteText('');
      addToast('Note added', 'success');
    } catch {
      addToast('Failed to add note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handlePartsBlur = async () => {
    if (parts === null) return; // no change
    try {
      await updatePartsNeeded(repairId, parts);
    } catch {
      addToast('Failed to save parts info', 'error');
    }
  };

  const photoBlobs: Blob[] = (photos ?? []).map(p => p.data);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader title={`Repair #${repairId}`} showBack />

        <div className="px-4 pt-4 space-y-4">

          {/* Machine info */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Machine</p>
            <Card>
              {machine ? (
                <div className="space-y-1">
                  <p className="text-text-primary font-semibold">
                    <span className="text-amber-primary">{machine.code}</span>
                    {' — '}{machine.name}
                  </p>
                  <p className="text-text-secondary text-sm capitalize">
                    {MACHINE_TYPE_LABELS[machine.type] ?? machine.type}
                  </p>
                </div>
              ) : (
                <p className="text-text-secondary text-sm">Machine #{repair.machineId}</p>
              )}
            </Card>
          </section>

          {/* Defect summary */}
          {defect && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Defect</p>
              <Card>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={defect.severity as any}>{defect.severity}</Badge>
                  <Badge variant={defect.status as any}>{defect.status}</Badge>
                  <span className="ml-auto text-xs text-text-muted capitalize">{defect.category}</span>
                </div>
                {defect.description && (
                  <p className="text-text-secondary text-sm mt-1">{defect.description}</p>
                )}
                {!defect.safeToOperate && (
                  <p className="text-red-400 text-xs font-medium mt-2">Not safe to operate</p>
                )}
                {photoBlobs.length > 0 && (
                  <div className="mt-3">
                    <PhotoGrid photos={photoBlobs} readOnly />
                  </div>
                )}
              </Card>
            </section>
          )}

          {/* Status & actions */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Status</p>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={repair.status as any}>{repair.status}</Badge>
                {repair.completedAt && (
                  <span className="text-xs text-text-muted ml-auto">
                    Completed {formatDateTime(repair.completedAt)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {repair.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={handleClaimTask}
                  >
                    Claim Task
                  </Button>
                )}
                {repair.status === 'assigned' && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={handleStartWork}
                  >
                    Start Work
                  </Button>
                )}
                {repair.status === 'in-progress' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={actionLoading}
                      onClick={handleMarkFixed}
                    >
                      Mark Fixed
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={actionLoading}
                      onClick={handleDefer}
                    >
                      Defer
                    </Button>
                  </>
                )}
                {repair.status === 'completed' && (
                  <p className="text-emerald-400 text-sm font-medium">Repair completed</p>
                )}
                {repair.status === 'deferred' && (
                  <p className="text-text-muted text-sm">This repair has been deferred.</p>
                )}
              </div>
            </Card>
          </section>

          {/* Parts needed */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Parts Needed</p>
            <Card>
              <textarea
                ref={partsRef}
                rows={2}
                value={partsValue}
                onChange={e => setParts(e.target.value)}
                onBlur={handlePartsBlur}
                placeholder="List any parts required…"
                className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-muted resize-none outline-none"
              />
            </Card>
          </section>

          {/* Action notes */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Action Notes</p>

            {/* Existing notes */}
            {(repair.actionsTaken ?? []).length === 0 ? (
              <p className="text-text-muted text-sm px-1 mb-3">No notes yet.</p>
            ) : (
              <div className="space-y-2 mb-3">
                {[...(repair.actionsTaken ?? [])].reverse().map((action, i) => (
                  <Card key={i}>
                    <p className="text-text-primary text-sm">{action.note}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-text-muted text-xs">{getUserName(action.mechanicId)}</span>
                      <span className="text-text-muted text-xs">{formatDateTime(action.timestamp)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Add note */}
            {repair.status !== 'completed' && (
              <Card>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Describe the work done or observations…"
                  className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-muted resize-none outline-none mb-3"
                />
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  loading={savingNote}
                  disabled={!noteText.trim()}
                  onClick={handleAddNote}
                >
                  Add Note
                </Button>
              </Card>
            )}
          </section>

        </div>
      </div>
    </AnimatedPage>
  );
}
