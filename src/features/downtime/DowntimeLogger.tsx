import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useMachines } from '../machines/useMachines';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { useTranslation } from '../../i18n/useTranslation';
import { logDowntime } from './useDowntime';
import { DOWNTIME_CODES } from '../../lib/constants';
import type { DowntimeCode } from '../../lib/constants';
import { format } from 'date-fns';

function localNow(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

export default function DowntimeLogger() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramMachineId = searchParams.get('machineId');
  const { t } = useTranslation();

  const machines = useMachines();
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [machineId, setMachineId] = useState<string>(paramMachineId ?? '');
  const [reasonCode, setReasonCode] = useState<DowntimeCode | ''>('');
  const [startTime, setStartTime] = useState<string>(localNow());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const DOWNTIME_LABELS: Record<string, string> = {
    mechanical: t('downtime.mechanical'),
    hydraulic: t('downtime.hydraulic'),
    electrical: t('downtime.electrical'),
    'tire-track': t('downtime.tireTrack'),
    'waiting-parts': t('downtime.waitingParts'),
    'scheduled-service': t('downtime.scheduledService'),
    'weather-access': t('downtime.weatherAccess'),
    other: t('downtime.other'),
  };

  const selectedMachine = machines?.find(m => m.id === Number(machineId));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!machineId || !reasonCode || !currentUser?.id) return;

    const machine = machines?.find(m => m.id === Number(machineId));
    if (!machine) return;

    setSubmitting(true);
    try {
      await logDowntime({
        machineId: Number(machineId),
        siteId: machine.siteId,
        defectId: null,
        reasonCode: reasonCode as DowntimeCode,
        notes,
        loggedBy: currentUser.id,
        startTime: new Date(startTime).toISOString(),
      });
      addToast(t('toast.downtimeLogged'), 'success');
      navigate(-1);
    } catch {
      addToast(t('toast.downtimeFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!machines) {
    return (
      <AnimatedPage>
        <PageHeader title={t('page.logDowntime')} showBack />
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      </AnimatedPage>
    );
  }

  const canSubmit = !!machineId && !!reasonCode && !submitting;

  return (
    <AnimatedPage>
      <PageHeader title={t('page.logDowntime')} showBack />
      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-24">

        {/* Machine selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            {t('label.machine')} <span className="text-status-critical">*</span>
          </label>
          {paramMachineId && selectedMachine ? (
            <div className="bg-slate-dark border border-border rounded-xl px-4 py-3 text-text-primary">
              <span className="font-mono text-amber-primary mr-2">{selectedMachine.code}</span>
              <span>{selectedMachine.name}</span>
            </div>
          ) : (
            <select
              value={machineId}
              onChange={e => setMachineId(e.target.value)}
              required
              className="w-full bg-slate-dark border border-border rounded-xl px-4 py-3 text-text-primary appearance-none focus:outline-none focus:border-amber-primary transition-colors"
            >
              <option value="">{t('placeholder.selectMachine')}</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Reason code chip grid */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            {t('label.reasonCode')} <span className="text-status-critical">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DOWNTIME_CODES.map(code => {
              const active = reasonCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setReasonCode(active ? '' : code)}
                  className={[
                    'px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150 border',
                    active
                      ? 'bg-amber-primary text-obsidian border-amber-primary'
                      : 'bg-slate-dark text-text-primary border-border hover:border-amber-primary/50 hover:bg-elevated',
                  ].join(' ')}
                >
                  {DOWNTIME_LABELS[code] ?? code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            {t('label.startTime')}
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full bg-slate-dark border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-amber-primary transition-colors [color-scheme:dark]"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            {t('label.notes')} <span className="text-text-muted text-xs">({t('misc.optional')})</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder={t('placeholder.additionalDetails')}
            className="w-full bg-slate-dark border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-amber-primary transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-obsidian border-t border-border">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!canSubmit}
            loading={submitting}
          >
            {t('action.logDowntime')}
          </Button>
        </div>
      </form>
    </AnimatedPage>
  );
}
