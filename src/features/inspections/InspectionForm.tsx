import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2 } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { MeterInput } from '../../components/ui/MeterInput';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ChecklistItem } from './ChecklistItem';
import { useInspectionTemplate, createInspection, getExistingTodayInspection } from './useInspections';
import { useMachine } from '../machines/useMachines';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { useTranslation } from '../../i18n/useTranslation';

interface ItemValue {
  result: string;
  notes: string;
}

export default function InspectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useTranslation();

  const machineId = Number(id);
  const machine = useMachine(machineId);
  const template = useInspectionTemplate(machine?.type);

  const [meterReading, setMeterReading] = useState<number | ''>('');
  const [itemValues, setItemValues] = useState<Record<string, ItemValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showFailPrompt, setShowFailPrompt] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [savedInspectionId, setSavedInspectionId] = useState<number | undefined>(undefined);
  const autoRedirectRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Pre-fill meter reading from machine
  useEffect(() => {
    if (machine && meterReading === '') {
      setMeterReading(machine.currentMeterHours);
    }
  }, [machine]);

  // Sorted items from template
  const sortedItems = useMemo(() => {
    if (!template?.items) return [];
    return [...template.items].sort((a, b) => a.order - b.order);
  }, [template]);

  // Initialise item values when template loads
  useEffect(() => {
    if (sortedItems.length === 0) return;
    setItemValues((prev) => {
      const next: Record<string, ItemValue> = {};
      for (const item of sortedItems) {
        next[item.id] = prev[item.id] ?? { result: '', notes: '' };
      }
      return next;
    });
  }, [sortedItems]);

  // Progress calculation
  const answeredCount = useMemo(
    () => Object.values(itemValues).filter((v) => v.result !== '').length,
    [itemValues]
  );
  const totalCount = sortedItems.length;
  const progressPct = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  // All required items answered?
  const allRequiredAnswered = useMemo(() => {
    if (sortedItems.length === 0) return false;
    return sortedItems
      .filter((item) => item.required)
      .every((item) => itemValues[item.id]?.result !== '' && itemValues[item.id]?.result !== undefined);
  }, [sortedItems, itemValues]);

  const canSubmit = allRequiredAnswered && meterReading !== '' && !submitting;

  function handleItemChange(itemId: string, value: ItemValue) {
    setItemValues((prev) => ({ ...prev, [itemId]: value }));
  }

  async function handleSubmit() {
    if (!canSubmit || !currentUser || !machine) return;

    setSubmitting(true);
    try {
      // Check for existing in-progress inspection today
      const existing = await getExistingTodayInspection(machineId);
      if (existing && existing.status === 'in-progress') {
        addToast(t('inspection.existingInProgress'), 'error');
        setSubmitting(false);
        return;
      }

      const items = sortedItems.map((item) => ({
        templateItemId: item.id,
        result: (itemValues[item.id]?.result ?? 'na') as 'pass' | 'fail' | 'na',
        notes: itemValues[item.id]?.notes ?? '',
      }));

      const inspectionId = await createInspection(
        machineId,
        currentUser.id!,
        machine.siteId,
        meterReading as number,
        items
      );

      setSavedInspectionId(inspectionId as number);

      const failCount = items.filter((i) => i.result === 'fail').length;
      if (failCount > 0) {
        setShowFailPrompt(true);
      } else {
        setShowCompletion(true);
        autoRedirectRef.current = setTimeout(() => {
          navigate(`/machines/${machineId}`);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to save inspection', err);
      addToast(t('toast.inspectionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFailPromptDismiss() {
    addToast(t('toast.inspectionSubmitted'), 'success');
    navigate(`/machines/${machineId}`);
  }

  function handleReportDefects() {
    addToast(t('toast.inspectionSubmitted'), 'success');
    const params = new URLSearchParams({ machineId: String(machineId) });
    if (savedInspectionId !== undefined) params.set('inspectionId', String(savedInspectionId));
    navigate(`/defects/new?${params.toString()}`);
  }

  // Loading states
  const isLoading = machine === undefined || template === undefined;
  const templateMissing = machine !== undefined && template === null;

  if (isLoading && !templateMissing) {
    return (
      <AnimatedPage>
        <PageHeader title={t('inspection.preStart')} showBack />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </AnimatedPage>
    );
  }

  if (templateMissing || (machine !== undefined && template === null)) {
    return (
      <AnimatedPage>
        <PageHeader title={t('inspection.preStart')} showBack />
        <EmptyState
          icon={ClipboardList}
          title={t('inspection.noTemplate')}
          description={`No active inspection template exists for ${machine?.type ?? 'this machine type'}.`}
          action={{ label: t('action.goBack'), onClick: () => navigate(-1) }}
        />
      </AnimatedPage>
    );
  }

  const failedItems = sortedItems.filter((item) => itemValues[item.id]?.result === 'fail');

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title={t('inspection.preStart')}
          showBack
          action={
            <span className="text-sm text-text-secondary font-medium">{machine?.code}</span>
          }
        />

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Progress bar */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary font-medium">
                {answeredCount} {t('inspection.of')} {totalCount} {t('inspection.itemsOf')}
              </span>
            </div>
            <ProgressBar
              value={progressPct}
              color={progressPct === 100 ? 'green' : 'gold'}
              size="sm"
              showLabel
            />
          </div>

          <div className="px-4 py-3 space-y-4">
            {/* Meter reading */}
            <MeterInput
              value={meterReading}
              onChange={setMeterReading}
              label={t('inspection.currentMeter')}
            />

            {/* Checklist items */}
            <div className="space-y-3">
              {sortedItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  value={itemValues[item.id] ?? { result: '', notes: '' }}
                  onChange={(val) => handleItemChange(item.id, val)}
                  machineId={machineId}
                  inspectionId={savedInspectionId}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Submit button — fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-obsidian border-t border-border px-4 py-4 safe-area-bottom">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            loading={submitting}
            onClick={handleSubmit}
          >
            {t('inspection.submitInspection')}
          </Button>
        </div>
      </div>

      {/* ── Completion celebration screen ──────────────────────────── */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/95 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center text-center max-w-xs">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <div className="w-20 h-20 rounded-full bg-emerald-950/40 flex items-center justify-center mb-5">
                  <CheckCircle2 size={48} className="text-status-available" />
                </div>
              </motion.div>
              <motion.h2
                className="text-text-primary font-semibold text-xl mb-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {t('inspection.complete')}
              </motion.h2>
              <motion.div
                className="space-y-1 mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <p className="text-text-secondary text-sm">{machine?.name}</p>
                <p className="text-text-muted text-xs font-mono tabular-nums">
                  {answeredCount} {t('inspection.itemsOf')} · {meterReading} hrs
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    if (autoRedirectRef.current) clearTimeout(autoRedirectRef.current);
                    navigate(`/machines/${machineId}`);
                  }}
                >
                  {t('inspection.backToMachine')}
                </Button>
              </motion.div>
              <motion.p
                className="text-text-muted text-[11px] mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {t('inspection.redirecting')}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failed items prompt modal */}
      {showFailPrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {failedItems.length} {failedItems.length !== 1 ? t('inspection.itemsFailedPlural') : t('inspection.itemsFailed')}
            </h2>
            <p className="text-sm text-text-secondary">
              {t('inspection.reportFailedItems')}
            </p>
            <ul className="space-y-1">
              {failedItems.map((item) => (
                <li key={item.id} className="text-sm text-red-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {item.label}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 pt-1">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleFailPromptDismiss}
              >
                {t('inspection.skip')}
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                onClick={handleReportDefects}
              >
                {t('inspection.reportDefects')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
