import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { MeterInput } from '../../components/ui/MeterInput';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { useMachine } from '../machines/useMachines';
import {
  useMaintenanceSchedule,
  useMaintenanceEvents,
  recordMaintenance,
  getMaintenanceStatus,
} from './useMaintenance';
import type { MaintenanceStatus } from './useMaintenance';
import { db } from '../../db/database';
import { formatDate, formatDateTime, formatMeterHours } from '../../lib/utils';

const STATUS_BADGE_VARIANT: Record<MaintenanceStatus, 'critical' | 'medium' | 'available'> = {
  overdue: 'critical',
  'due-soon': 'medium',
  ok: 'available',
};

const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  overdue: 'Overdue',
  'due-soon': 'Due Soon',
  ok: 'Up to Date',
};

export default function MaintenanceDetail() {
  const { id } = useParams<{ id: string }>();
  const scheduleId = Number(id);

  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const schedule = useMaintenanceSchedule(scheduleId);
  const machine = useMachine(schedule?.machineId ?? 0);
  const events = useMaintenanceEvents(scheduleId);
  const users = useLiveQuery(() => db.users.toArray());

  const [formOpen, setFormOpen] = useState(false);
  const [meterReading, setMeterReading] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Loading state
  if (schedule === undefined) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not found
  if (schedule === null) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-obsidian">
          <PageHeader title="Not Found" showBack />
          <EmptyState
            icon={CalendarClock}
            title="Schedule not found"
            description="This maintenance schedule doesn't exist or was removed."
          />
        </div>
      </AnimatedPage>
    );
  }

  const meterHours = machine?.currentMeterHours ?? 0;
  const status = getMaintenanceStatus(schedule, meterHours);

  const getUserName = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user?.name ?? `User #${userId}`;
  };

  const handleSubmit = async () => {
    if (!currentUser || meterReading === '') return;
    setSubmitting(true);
    try {
      await recordMaintenance(
        scheduleId,
        schedule.machineId,
        currentUser.id!,
        meterReading as number,
        notes.trim(),
        schedule.serviceType
      );
      addToast('Maintenance recorded successfully', 'success');
      setMeterReading('');
      setNotes('');
      setFormOpen(false);
    } catch {
      addToast('Failed to record maintenance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader title={schedule.serviceType} showBack />

        <div className="px-4 pt-4 space-y-4">

          {/* Schedule info card */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Schedule Info
            </p>
            <Card>
              {/* Machine */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-text-primary font-semibold text-sm">
                    {machine
                      ? <><span className="text-amber-primary">{machine.code}</span>{' — '}{machine.name}</>
                      : `Machine #${schedule.machineId}`}
                  </p>
                  {machine && (
                    <p className="text-text-secondary text-xs mt-0.5 capitalize">{machine.type}</p>
                  )}
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[status]}>
                  {STATUS_LABEL[status]}
                </Badge>
              </div>

              {/* Service type */}
              <p className="text-text-secondary text-sm mb-3">{schedule.serviceType}</p>

              {/* Interval info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {schedule.intervalDays && (
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Interval</p>
                    <p className="text-text-primary font-medium">Every {schedule.intervalDays} days</p>
                  </div>
                )}
                {schedule.intervalHours && (
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Hour Interval</p>
                    <p className="text-text-primary font-medium">Every {schedule.intervalHours.toLocaleString()} hrs</p>
                  </div>
                )}
                {schedule.dueDate && (
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Due Date</p>
                    <p className={[
                      'font-medium',
                      status === 'overdue' ? 'text-red-400' : status === 'due-soon' ? 'text-amber-primary' : 'text-text-primary',
                    ].join(' ')}>
                      {formatDate(schedule.dueDate)}
                    </p>
                  </div>
                )}
                {schedule.dueHours !== null && schedule.dueHours !== undefined && (
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Due Hours</p>
                    <p className={[
                      'font-medium',
                      status === 'overdue' && schedule.dueHours <= meterHours ? 'text-red-400' : 'text-text-primary',
                    ].join(' ')}>
                      {formatMeterHours(schedule.dueHours)}
                    </p>
                  </div>
                )}
                {machine && (
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Current Hours</p>
                    <p className="text-text-primary font-medium">{formatMeterHours(meterHours)}</p>
                  </div>
                )}
                {schedule.lastCompletedDate && (
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Last Completed</p>
                    <p className="text-text-primary font-medium">{formatDate(schedule.lastCompletedDate)}</p>
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* Record Completion section */}
          <section>
            <button
              type="button"
              onClick={() => setFormOpen(prev => !prev)}
              className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 hover:text-text-secondary transition-colors"
            >
              <span>Record Completion</span>
              {formOpen
                ? <ChevronUp size={16} />
                : <ChevronDown size={16} />}
            </button>

            {formOpen && (
              <Card>
                <div className="space-y-4">
                  <MeterInput
                    label="Current Meter Reading"
                    value={meterReading}
                    onChange={setMeterReading}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-text-secondary">
                      Notes <span className="text-text-muted font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Describe the work done, parts used, observations…"
                      className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none outline-none focus:border-amber-primary transition-colors duration-150"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={submitting}
                    disabled={meterReading === '' || !currentUser}
                    onClick={handleSubmit}
                  >
                    Save Completion
                  </Button>
                </div>
              </Card>
            )}

            {!formOpen && (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="w-full h-11 rounded-xl bg-elevated border border-border text-sm font-medium text-text-secondary hover:bg-border hover:text-text-primary transition-colors duration-150 flex items-center justify-center gap-2"
              >
                <CalendarClock size={16} />
                Log Service
              </button>
            )}
          </section>

          {/* History section */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Service History
            </p>

            {events === undefined ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-text-muted text-sm px-1">No service history recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {events.map(event => (
                  <Card key={event.id}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-text-primary text-sm font-medium">
                        {formatDateTime(event.completedAt)}
                      </p>
                      <span className="text-xs text-amber-primary font-medium flex-shrink-0">
                        {formatMeterHours(event.meterReading)}
                      </span>
                    </div>
                    <p className="text-text-secondary text-xs mb-1">
                      By {getUserName(event.completedBy)}
                    </p>
                    {event.notes && (
                      <p className="text-text-secondary text-sm mt-2 border-t border-border pt-2">
                        {event.notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </AnimatedPage>
  );
}
