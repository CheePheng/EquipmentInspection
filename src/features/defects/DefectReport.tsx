import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { PhotoCapture } from '../../components/ui/PhotoCapture';
import { useMachines, useMachine } from '../machines/useMachines';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { useTranslation } from '../../i18n/useTranslation';
import { createDefect } from './useDefects';
import { DEFECT_CATEGORIES, SEVERITY_COLORS, MAX_PHOTOS_PER_DEFECT } from '../../lib/constants';

export default function DefectReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { t } = useTranslation();

  const paramMachineId = searchParams.get('machineId');
  const paramInspectionId = searchParams.get('inspectionId');

  const preselectedMachineId = paramMachineId ? parseInt(paramMachineId, 10) : null;
  const inspectionId = paramInspectionId ? parseInt(paramInspectionId, 10) : null;

  const allMachines = useMachines();
  const preselectedMachine = useMachine(preselectedMachineId ?? 0);

  const [machineId, setMachineId] = useState<number | null>(preselectedMachineId);
  const [severity, setSeverity] = useState('medium');
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [safeToOperate, setSafeToOperate] = useState('yes');
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

  const SEVERITY_OPTIONS = [
    { value: 'low', label: t('severity.low') },
    { value: 'medium', label: t('severity.medium') },
    { value: 'high', label: t('severity.high') },
    { value: 'critical', label: t('severity.critical') },
  ];

  const SAFE_OPTIONS = [
    { value: 'yes', label: t('label.yes') },
    { value: 'no', label: t('label.no') },
  ];

  const selectedMachineId = preselectedMachineId ?? machineId;
  const selectedMachine = preselectedMachineId
    ? preselectedMachine
    : allMachines?.find(m => m.id === machineId);

  const canSubmit = selectedMachineId !== null && category !== null && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !currentUser) return;
    if (!selectedMachine) return;

    setSubmitting(true);
    try {
      await createDefect(
        {
          machineId: selectedMachineId!,
          siteId: selectedMachine.siteId,
          inspectionId,
          category: category!,
          severity,
          description,
          safeToOperate: safeToOperate === 'yes',
          reportedBy: currentUser.id!,
        },
        photos
      );
      addToast(t('defect.reported'), 'success');
      navigate(-1);
    } catch {
      addToast(t('defect.reportFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader title={t('page.reportDefect')} showBack />

        <div className="px-4 py-4 space-y-6">
          {/* Machine selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('label.machine')}
            </label>
            {preselectedMachineId && preselectedMachine ? (
              <div className="bg-elevated border border-border rounded-xl px-4 py-3">
                <span className="text-text-primary font-medium">
                  {preselectedMachine.code}
                </span>
                {preselectedMachine.name && (
                  <span className="text-text-secondary text-sm ml-2">
                    — {preselectedMachine.name}
                  </span>
                )}
              </div>
            ) : (
              <select
                value={machineId ?? ''}
                onChange={e => setMachineId(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary text-sm appearance-none focus:outline-none focus:border-amber-primary transition-colors duration-150"
              >
                <option value="">{t('placeholder.selectMachine')}</option>
                {allMachines?.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('label.severity')}
            </label>
            <SegmentedControl
              options={SEVERITY_OPTIONS}
              value={severity}
              onChange={setSeverity}
            />
            {/* Color hint strip */}
            <div className="flex gap-1 mt-1">
              {SEVERITY_OPTIONS.map(opt => {
                const colors = SEVERITY_COLORS[opt.value as keyof typeof SEVERITY_COLORS];
                return (
                  <div
                    key={opt.value}
                    className={[
                      'flex-1 h-1 rounded-full',
                      severity === opt.value ? colors.bg : 'bg-border',
                    ].join(' ')}
                  />
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('label.category')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEFECT_CATEGORIES.map(cat => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={[
                      'px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 text-left min-h-[48px] border',
                      active
                        ? 'bg-amber-primary/20 text-amber-primary border-amber-primary/50'
                        : 'bg-elevated text-text-secondary border-border hover:border-border/80 hover:text-text-primary',
                    ].join(' ')}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('label.description')}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('placeholder.describeIssue')}
              rows={3}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-muted resize-none focus:outline-none focus:border-amber-primary transition-colors duration-150"
            />
          </div>

          {/* Safe to operate */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('label.safeToOperate')}?
            </label>
            <SegmentedControl
              options={SAFE_OPTIONS}
              value={safeToOperate}
              onChange={setSafeToOperate}
            />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('label.photos')}
            </label>
            <PhotoCapture
              photos={photos}
              onChange={setPhotos}
              maxPhotos={MAX_PHOTOS_PER_DEFECT}
            />
          </div>
        </div>

        {/* Submit button — fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-obsidian border-t border-border px-4 py-4">
          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
          >
            {t('action.reportDefect')}
          </Button>
        </div>
      </div>
    </AnimatedPage>
  );
}
