import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { PhotoGrid } from './PhotoGrid';
import { useDefect, useDefectPhotos, updateDefectStatus } from './useDefects';
import { useMachine } from '../machines/useMachines';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { db } from '../../db/database';
import { formatDateTime } from '../../lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  engine: 'Engine',
  hydraulic: 'Hydraulic',
  electrical: 'Electrical',
  structural: 'Structural',
  safety: 'Safety',
  'tires-tracks': 'Tires/Tracks',
  'cab-controls': 'Cab/Controls',
  'lights-signals': 'Lights/Signals',
  'fluid-leaks': 'Fluid Leaks',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  'sent-out': 'Sent for Service',
  resolved: 'Resolved',
  deferred: 'Deferred',
};

export default function DefectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const defectId = id ? parseInt(id, 10) : 0;
  const defect = useDefect(defectId);
  const photos = useDefectPhotos(defectId);
  const machine = useMachine(defect?.machineId ?? 0);

  const reporter = useLiveQuery(
    () => (defect?.reportedBy ? db.users.get(defect.reportedBy) : undefined),
    [defect?.reportedBy]
  );

  const canChangeStatus = currentUser?.role === 'supervisor';

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateDefectStatus(defectId, newStatus);
      addToast(`Defect marked as ${STATUS_LABELS[newStatus] ?? newStatus}`, 'success');
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  if (defect === undefined) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AnimatedPage>
    );
  }

  if (defect === null) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-obsidian">
          <PageHeader title="Defect Not Found" showBack />
          <EmptyState
            icon={AlertTriangle}
            title="Defect not found"
            description="This defect may have been removed."
            action={{ label: 'Go Back', onClick: () => navigate(-1) }}
          />
        </div>
      </AnimatedPage>
    );
  }

  const photoBlobs = photos?.map(p => p.data) ?? [];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-20">
        <PageHeader title={`Defect #${defect.id}`} showBack />

        <div className="px-4 py-4 space-y-4">
          {/* Machine info */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
              Machine
            </p>
            {machine ? (
              <p className="text-text-primary font-medium">
                {machine.code}
                {machine.name && (
                  <span className="text-text-secondary font-normal"> — {machine.name}</span>
                )}
              </p>
            ) : (
              <p className="text-text-secondary text-sm">Machine #{defect.machineId}</p>
            )}
          </Card>

          {/* Severity + Status */}
          <Card>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">Severity</p>
                <Badge variant={defect.severity as any} className="text-sm px-3 py-1">
                  {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">Status</p>
                <Badge variant={defect.status as any} className="text-sm px-3 py-1">
                  {STATUS_LABELS[defect.status] ?? defect.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">Category</p>
                <span className="text-sm text-text-primary font-medium">
                  {CATEGORY_LABELS[defect.category] ?? defect.category}
                </span>
              </div>
            </div>
          </Card>

          {/* Safe to operate */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Safe to Operate
            </p>
            <div className="flex items-center gap-2">
              {defect.safeToOperate ? (
                <>
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 font-medium">Yes — Safe to operate</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-400 font-medium">No — Do not operate</span>
                </>
              )}
            </div>
          </Card>

          {/* Description */}
          {defect.description ? (
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Description
              </p>
              <p className="text-sm text-text-primary leading-relaxed">{defect.description}</p>
            </Card>
          ) : null}

          {/* Photos */}
          {photoBlobs.length > 0 && (
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                Photos ({photoBlobs.length})
              </p>
              <PhotoGrid photos={photoBlobs} readOnly />
            </Card>
          )}

          {/* Reporter + timestamp */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Reported
            </p>
            <p className="text-sm text-text-primary">
              {reporter ? reporter.name : `User #${defect.reportedBy}`}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {formatDateTime(defect.createdAt)}
            </p>
          </Card>

          {/* Status actions (supervisor only) */}
          {canChangeStatus && defect.status !== 'resolved' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Update Status
              </p>
              <div className="flex flex-col gap-2">
                {defect.status === 'open' && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => handleStatusChange('acknowledged')}
                  >
                    Acknowledge
                  </Button>
                )}
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleStatusChange('resolved')}
                >
                  Mark Resolved
                </Button>
                {defect.status !== 'deferred' && (
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => handleStatusChange('deferred')}
                  >
                    Defer
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
