import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle, XCircle, AlertTriangle, Truck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { createServiceOrder } from '../service-orders/useServiceOrders';
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
import { useTranslation } from '../../i18n/useTranslation';
import { db } from '../../db/database';
import { formatDateTime, today } from '../../lib/utils';

export default function DefectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { t } = useTranslation();

  const CATEGORY_LABELS: Record<string, string> = {
    engine: t('category.engine'),
    hydraulic: t('category.hydraulic'),
    electrical: t('category.electrical'),
    structural: t('category.structural'),
    safety: t('category.safety'),
    'tires-tracks': t('category.tiresTracks'),
    'cab-controls': t('category.cabControls'),
    'lights-signals': t('category.lightsSignals'),
    'fluid-leaks': t('category.fluidLeaks'),
    other: t('category.other'),
  };

  const STATUS_LABELS: Record<string, string> = {
    open: t('defect.open'),
    acknowledged: t('defect.acknowledged'),
    'sent-out': t('defect.sentOut'),
    resolved: t('defect.resolved'),
    deferred: t('defect.deferred'),
  };

  const defectId = id ? parseInt(id, 10) : 0;
  const defect = useDefect(defectId);
  const photos = useDefectPhotos(defectId);
  const machine = useMachine(defect?.machineId ?? 0);

  const reporter = useLiveQuery(
    () => (defect?.reportedBy ? db.users.get(defect.reportedBy) : undefined),
    [defect?.reportedBy]
  );

  const linkedServiceOrder = useLiveQuery(
    () => db.serviceOrders.where('defectId').equals(defectId).first(),
    [defectId]
  );

  const canChangeStatus = currentUser?.role === 'supervisor';

  const [showSendForm, setShowSendForm] = useState(false);
  const [workshopName, setWorkshopName] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [sending, setSending] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateDefectStatus(defectId, newStatus);
      addToast(t('toast.defectUpdated'), 'success');
    } catch {
      addToast(t('toast.defectUpdateFailed'), 'error');
    }
  };

  const handleSendForService = async () => {
    if (!workshopName.trim() || !machine || !defect) return;
    setSending(true);
    try {
      await createServiceOrder({
        machineId: defect.machineId,
        defectId: defect.id!,
        siteId: defect.siteId,
        workshopName: workshopName.trim(),
        dateSent: today(),
        expectedReturnDate: expectedReturn || null,
        dateReturned: null,
        status: 'pending',
        notes: serviceNotes,
        repairSummary: '',
        cost: null,
      });
      await updateDefectStatus(defectId, 'sent-out');
      addToast(t('toast.serviceOrderCreated'), 'success');
      setShowSendForm(false);
      setWorkshopName('');
      setExpectedReturn('');
      setServiceNotes('');
    } catch {
      addToast(t('toast.serviceOrderFailed'), 'error');
    } finally {
      setSending(false);
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
          <PageHeader title={t('empty.defectNotFound')} showBack />
          <EmptyState
            icon={AlertTriangle}
            title={t('empty.defectNotFound')}
            description="This defect may have been removed."
            action={{ label: t('action.goBack'), onClick: () => navigate(-1) }}
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
              {t('label.machine')}
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
                <p className="text-xs text-text-muted">{t('label.severity')}</p>
                <Badge variant={defect.severity as any} className="text-sm px-3 py-1">
                  {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">{t('label.status')}</p>
                <Badge variant={defect.status as any} className="text-sm px-3 py-1">
                  {STATUS_LABELS[defect.status] ?? defect.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">{t('label.category')}</p>
                <span className="text-sm text-text-primary font-medium">
                  {CATEGORY_LABELS[defect.category] ?? defect.category}
                </span>
              </div>
            </div>
          </Card>

          {/* Safe to operate */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              {t('label.safeToOperate')}
            </p>
            <div className="flex items-center gap-2">
              {defect.safeToOperate ? (
                <>
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 font-medium">{t('label.safeYes')}</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-400 font-medium">{t('label.safeNo')}</span>
                </>
              )}
            </div>
          </Card>

          {/* Description */}
          {defect.description ? (
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                {t('label.description')}
              </p>
              <p className="text-sm text-text-primary leading-relaxed">{defect.description}</p>
            </Card>
          ) : null}

          {/* Photos */}
          {photoBlobs.length > 0 && (
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                {t('label.photos')} ({photoBlobs.length})
              </p>
              <PhotoGrid photos={photoBlobs} readOnly />
            </Card>
          )}

          {/* Reporter + timestamp */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              {t('label.reported')}
            </p>
            <p className="text-sm text-text-primary">
              {reporter ? reporter.name : `User #${defect.reportedBy}`}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {formatDateTime(defect.createdAt)}
            </p>
          </Card>

          {/* Linked Service Order */}
          {linkedServiceOrder && (
            <Card pressable onClick={() => navigate(`/service-orders/${linkedServiceOrder.id}`)}>
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-amber-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {t('label.linkedServiceOrder')} #{linkedServiceOrder.id}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {linkedServiceOrder.workshopName}
                  </p>
                </div>
                <Badge variant={linkedServiceOrder.status as any}>
                  {linkedServiceOrder.status === 'in-service' ? t('serviceOrder.inService') :
                   linkedServiceOrder.status.charAt(0).toUpperCase() + linkedServiceOrder.status.slice(1)}
                </Badge>
              </div>
            </Card>
          )}

          {/* Status actions (supervisor only) */}
          {canChangeStatus && defect.status !== 'resolved' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t('label.updateStatus')}
              </p>
              <div className="flex flex-col gap-2">
                {defect.status === 'open' && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => handleStatusChange('acknowledged')}
                  >
                    {t('action.acknowledge')}
                  </Button>
                )}
                {(defect.status === 'open' || defect.status === 'acknowledged') && !linkedServiceOrder && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setShowSendForm(true)}
                  >
                    {t('action.sendForService')}
                  </Button>
                )}
                {defect.status !== 'sent-out' && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => handleStatusChange('resolved')}
                  >
                    {t('action.markResolved')}
                  </Button>
                )}
                {defect.status === 'deferred' && (
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => handleStatusChange('open')}
                  >
                    {t('action.reopen')}
                  </Button>
                )}
                {defect.status !== 'deferred' && defect.status !== 'sent-out' && (
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => handleStatusChange('deferred')}
                  >
                    {t('action.defer')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send for Service Modal */}
      <Modal
        isOpen={showSendForm}
        onClose={() => setShowSendForm(false)}
        title={t('action.sendForService')}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              {t('label.workshop')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={workshopName}
              onChange={e => setWorkshopName(e.target.value)}
              placeholder={t('placeholder.enterWorkshop')}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              {t('label.expectedReturn')}
            </label>
            <input
              type="date"
              value={expectedReturn}
              onChange={e => setExpectedReturn(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-amber-primary transition-colors [color-scheme:dark]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              {t('label.notes')} <span className="text-text-muted text-xs">({t('misc.optional')})</span>
            </label>
            <textarea
              value={serviceNotes}
              onChange={e => setServiceNotes(e.target.value)}
              rows={2}
              placeholder={t('placeholder.additionalDetails')}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-amber-primary transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowSendForm(false)}
            >
              {t('action.cancel')}
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={!workshopName.trim() || sending}
              loading={sending}
              onClick={handleSendForService}
            >
              {t('action.createOrder')}
            </Button>
          </div>
        </div>
      </Modal>
    </AnimatedPage>
  );
}
