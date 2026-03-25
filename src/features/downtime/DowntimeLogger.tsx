import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useMachines } from '../machines/useMachines';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { logDowntime } from './useDowntime';
import { DOWNTIME_CODES, DOWNTIME_CODE_LABELS } from '../../lib/constants';
import type { DowntimeCode } from '../../lib/constants';
import { format } from 'date-fns';

function localNow(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

export default function DowntimeLogger() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramMachineId = searchParams.get('machineId');

  const machines = useMachines();
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [machineId, setMachineId] = useState<string>(paramMachineId ?? '');
  const [reasonCode, setReasonCode] = useState<DowntimeCode | ''>('');
  const [startTime, setStartTime] = useState<string>(localNow());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      addToast('Downtime logged', 'success');
      navigate(-1);
    } catch {
      addToast('Failed to log downtime', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!machines) {
    return (
      <AnimatedPage>
        <PageHeader title="Log Downtime" showBack />
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      </AnimatedPage>
    );
  }

  const canSubmit = !!machineId && !!reasonCode && !submitting;

  return (
    <AnimatedPage>
      <PageHeader title="Log Downtime" showBack />
      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-24">

        {/* Machine selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            Machine <span className="text-status-critical">*</span>
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
              <option value="">Select a machine…</option>
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
            Reason Code <span className="text-status-critical">*</span>
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
                  {DOWNTIME_CODE_LABELS[code]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            Start Time
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
            Notes <span className="text-text-muted text-xs">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional details…"
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
            Log Downtime
          </Button>
        </div>
      </form>
    </AnimatedPage>
  );
}
