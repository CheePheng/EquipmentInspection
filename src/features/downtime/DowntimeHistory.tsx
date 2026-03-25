import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Plus, Timer } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useDowntimeEvents, stopDowntime } from './useDowntime';
import { useMachines } from '../machines/useMachines';
import { useToastStore } from '../../stores/toast.store';
import { DOWNTIME_CODE_LABELS } from '../../lib/constants';
import type { DowntimeCode } from '../../lib/constants';
import { formatDateTime, formatTimeAgo } from '../../lib/utils';
import type { DowntimeEvent } from '../../db/schemas/downtime.schema';

function formatDuration(startIso: string, endIso: string): string {
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();
  const totalMinutes = Math.max(0, Math.round((endMs - startMs) / 60000));
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function ElapsedTimer({ startIso }: { startIso: string }) {
  const [elapsed, setElapsed] = useState(() => formatDuration(startIso, new Date().toISOString()));

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(formatDuration(startIso, new Date().toISOString()));
    }, 30000);
    return () => clearInterval(id);
  }, [startIso]);

  return <span>{elapsed}</span>;
}

interface ActiveCardProps {
  event: DowntimeEvent;
  machineName: string;
  onStop: (id: number) => void;
  stopping: boolean;
}

function ActiveDowntimeCard({ event, machineName, onStop, stopping }: ActiveCardProps) {
  const label = DOWNTIME_CODE_LABELS[event.reasonCode as DowntimeCode] ?? event.reasonCode;

  return (
    <div className="bg-red-900/20 border border-red-800/60 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* pulsing red dot */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Active</span>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onStop(event.id!)}
          loading={stopping}
        >
          Stop
        </Button>
      </div>

      <p className="text-sm font-semibold text-text-primary mb-1">{machineName}</p>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <Badge variant="down">{label}</Badge>
      </div>

      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <Timer size={12} />
        <span>Started {formatTimeAgo(event.startTime)} · elapsed </span>
        <span className="font-mono text-red-300">
          <ElapsedTimer startIso={event.startTime} />
        </span>
      </div>
      {event.notes && (
        <p className="mt-2 text-xs text-text-secondary line-clamp-2">{event.notes}</p>
      )}
    </div>
  );
}

interface HistoryCardProps {
  event: DowntimeEvent;
  machineName: string;
}

function HistoryCard({ event, machineName }: HistoryCardProps) {
  const label = DOWNTIME_CODE_LABELS[event.reasonCode as DowntimeCode] ?? event.reasonCode;
  const duration = event.endTime ? formatDuration(event.startTime, event.endTime) : null;

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-text-primary">{machineName}</p>
        {duration && (
          <span className="text-xs font-mono text-text-muted flex-shrink-0">{duration}</span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <Badge variant="default">{label}</Badge>
      </div>

      <div className="space-y-0.5 text-xs text-text-secondary">
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>{formatDateTime(event.startTime)}</span>
          {event.endTime && <span>→ {formatDateTime(event.endTime)}</span>}
        </div>
      </div>

      {event.notes && (
        <p className="mt-2 text-xs text-text-secondary line-clamp-2">{event.notes}</p>
      )}
    </Card>
  );
}

export default function DowntimeHistory() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [stoppingId, setStoppingId] = useState<number | null>(null);
  const [machineFilter, setMachineFilter] = useState<string>('');

  const machines = useMachines();
  const machineId = machineFilter ? Number(machineFilter) : undefined;
  const events = useDowntimeEvents({ machineId });

  const machineMap = new Map(machines?.map(m => [m.id!, { code: m.code, name: m.name }]));

  function getMachineName(id: number): string {
    const m = machineMap.get(id);
    return m ? `${m.code} — ${m.name}` : `Machine #${id}`;
  }

  async function handleStop(eventId: number) {
    setStoppingId(eventId);
    try {
      await stopDowntime(eventId);
      addToast('Downtime stopped', 'success');
    } catch {
      addToast('Failed to stop downtime', 'error');
    } finally {
      setStoppingId(null);
    }
  }

  const activeEvents = events?.filter(e => !e.endTime) ?? [];
  const historyEvents = events?.filter(e => !!e.endTime) ?? [];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader
          title="Downtime"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/downtime/log')}
            >
              <Plus size={16} />
              Log
            </Button>
          }
        />

        {/* Machine filter */}
        {machines && machines.length > 0 && (
          <div className="px-4 pt-4">
            <select
              value={machineFilter}
              onChange={e => setMachineFilter(e.target.value)}
              className="w-full bg-slate-dark border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary appearance-none focus:outline-none focus:border-amber-primary transition-colors"
            >
              <option value="">All machines</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {events === undefined ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No downtime recorded"
            description="Log a downtime event when a machine is out of service."
            action={{
              label: 'Log Downtime',
              onClick: () => navigate('/downtime/log'),
            }}
          />
        ) : (
          <div className="px-4 py-4 space-y-6">
            {/* Active downtime section */}
            {activeEvents.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Active ({activeEvents.length})
                </h2>
                <div className="space-y-3">
                  {activeEvents.map(event => (
                    <ActiveDowntimeCard
                      key={event.id}
                      event={event}
                      machineName={getMachineName(event.machineId)}
                      onStop={handleStop}
                      stopping={stoppingId === event.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* History section */}
            {historyEvents.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  History ({historyEvents.length})
                </h2>
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.04 } },
                  }}
                >
                  {historyEvents.map(event => (
                    <motion.div
                      key={event.id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                      }}
                    >
                      <HistoryCard
                        event={event}
                        machineName={getMachineName(event.machineId)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* FAB for logging downtime */}
      <button
        onClick={() => navigate('/downtime/log')}
        aria-label="Log downtime"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-amber-primary text-obsidian shadow-lg flex items-center justify-center hover:bg-amber-hover active:scale-95 transition-all duration-150 z-30"
      >
        <Plus size={24} />
      </button>
    </AnimatedPage>
  );
}
