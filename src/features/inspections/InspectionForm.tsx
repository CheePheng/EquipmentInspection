import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { MeterInput } from '../../components/ui/MeterInput';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ChecklistItem } from './ChecklistItem';
import { useInspectionTemplate, createInspection, getExistingTodayInspection } from './useInspections';
import { useMachine } from '../machines/useMachines';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';

interface ItemValue {
  result: string;
  notes: string;
}

export default function InspectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const addToast = useToastStore((s) => s.addToast);

  const machineId = Number(id);
  const machine = useMachine(machineId);
  const template = useInspectionTemplate(machine?.type);

  const [meterReading, setMeterReading] = useState<number | ''>('');
  const [itemValues, setItemValues] = useState<Record<string, ItemValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showFailPrompt, setShowFailPrompt] = useState(false);
  const [savedInspectionId, setSavedInspectionId] = useState<number | undefined>(undefined);

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
        addToast('An in-progress inspection already exists for today. Please complete it first.', 'error');
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
        addToast('Inspection completed successfully', 'success');
        navigate(`/machines/${machineId}`);
      }
    } catch (err) {
      console.error('Failed to save inspection', err);
      addToast('Failed to save inspection. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFailPromptDismiss() {
    addToast('Inspection completed successfully', 'success');
    navigate(`/machines/${machineId}`);
  }

  function handleReportDefects() {
    addToast('Inspection completed successfully', 'success');
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
        <PageHeader title="Pre-Start Inspection" showBack />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </AnimatedPage>
    );
  }

  if (templateMissing || (machine !== undefined && template === null)) {
    return (
      <AnimatedPage>
        <PageHeader title="Pre-Start Inspection" showBack />
        <EmptyState
          icon={ClipboardList}
          title="No template found"
          description={`No active inspection template exists for ${machine?.type ?? 'this machine type'}.`}
          action={{ label: 'Go Back', onClick: () => navigate(-1) }}
        />
      </AnimatedPage>
    );
  }

  const failedItems = sortedItems.filter((item) => itemValues[item.id]?.result === 'fail');

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title="Pre-Start Inspection"
          showBack
          action={
            <span className="text-sm text-text-secondary font-medium">{machine?.code}</span>
          }
        />

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Progress bar */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary">
                {answeredCount}/{totalCount} items completed
              </span>
              <span className="text-xs text-text-muted">{Math.round(progressPct)}%</span>
            </div>
            <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="px-4 py-3 space-y-4">
            {/* Meter reading */}
            <MeterInput
              value={meterReading}
              onChange={setMeterReading}
              label="Current Meter Reading"
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
            Submit Inspection
          </Button>
        </div>
      </div>

      {/* Failed items prompt modal */}
      {showFailPrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {failedItems.length} item{failedItems.length !== 1 ? 's' : ''} failed
            </h2>
            <p className="text-sm text-text-secondary">
              Would you like to report the failed items as defects?
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
                Skip
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                onClick={handleReportDefects}
              >
                Report Defects
              </Button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
