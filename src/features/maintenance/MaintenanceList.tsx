import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, AlertTriangle, Clock } from 'lucide-react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useMaintenanceSchedules } from './useMaintenance';
import type { MaintenanceStatus } from './useMaintenance';
import { formatDate, formatMeterHours, today } from '../../lib/utils';
import { useTranslation } from '../../i18n/useTranslation';

type FilterTab = 'all' | 'due-soon' | 'overdue';

// Compute a human-readable due info string
function getDueInfo(
  dueDate: string | null,
  dueHours: number | null,
  meterHours: number,
  status: MaintenanceStatus
): string {
  const todayStr = today();

  if (status === 'overdue') {
    if (dueDate && dueDate <= todayStr) {
      const days = differenceInCalendarDays(new Date(), parseISO(dueDate));
      if (days === 0) return 'Due today (date)';
      return `Overdue by ${days} day${days !== 1 ? 's' : ''}`;
    }
    if (dueHours !== null && dueHours <= meterHours) {
      const over = Math.round(meterHours - dueHours);
      return `Overdue by ${over.toLocaleString()} hrs`;
    }
  }

  const parts: string[] = [];
  if (dueDate) {
    const days = differenceInCalendarDays(parseISO(dueDate), new Date());
    if (days === 0) parts.push('Due today');
    else if (days === 1) parts.push('Due tomorrow');
    else parts.push(`Due in ${days} days`);
  }
  if (dueHours !== null) {
    const remaining = Math.round(dueHours - meterHours);
    if (remaining > 0) parts.push(`Due at ${formatMeterHours(dueHours)} (${remaining.toLocaleString()} hrs left)`);
    else parts.push(`Due at ${formatMeterHours(dueHours)}`);
  }

  return parts.join(' · ') || 'Schedule OK';
}

const STATUS_BADGE_VARIANT: Record<MaintenanceStatus, 'critical' | 'medium' | 'available'> = {
  overdue: 'critical',
  'due-soon': 'medium',
  ok: 'available',
};

type ScheduleWithMachine = Awaited<ReturnType<typeof useMaintenanceSchedules>> extends (infer T)[] | undefined ? T : never;

function MaintenanceCard({ item }: { item: ScheduleWithMachine }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const statusLabel: Record<MaintenanceStatus, string> = {
    overdue: t('maintenance.overdue'),
    'due-soon': t('maintenance.dueSoon'),
    ok: t('maintenance.ok'),
  };
  const machine = item.machine;
  const meterHours = machine?.currentMeterHours ?? 0;
  const dueInfo = getDueInfo(item.dueDate, item.dueHours, meterHours, item.maintenanceStatus);
  const isOverdue = item.maintenanceStatus === 'overdue';

  return (
    <Card pressable accent={isOverdue} onClick={() => navigate(`/maintenance/${item.id}`)}>
      {/* Top row: machine + status badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-text-primary font-semibold text-sm leading-tight">
          {machine
            ? <><span className="text-amber-primary">{machine.code}</span>{' — '}{machine.name}</>
            : `Machine #${item.machineId}`}
        </p>
        <Badge variant={STATUS_BADGE_VARIANT[item.maintenanceStatus as MaintenanceStatus]}>
          {statusLabel[item.maintenanceStatus as MaintenanceStatus]}
        </Badge>
      </div>

      {/* Service type */}
      <p className="text-text-secondary text-sm mb-2">{item.serviceType}</p>

      {/* Due info */}
      <div className="flex items-center gap-1.5 text-xs">
        {isOverdue
          ? <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
          : <Clock size={13} className="text-text-muted flex-shrink-0" />}
        <span className={isOverdue ? 'text-red-400 font-medium' : 'text-text-muted'}>
          {dueInfo}
        </span>
      </div>

      {/* Last completed */}
      {item.lastCompletedDate && (
        <p className="text-xs text-text-muted mt-1.5">
          Last done: {formatDate(item.lastCompletedDate)}
          {item.lastCompletedHours !== null && item.lastCompletedHours !== undefined
            ? ` at ${formatMeterHours(item.lastCompletedHours)}`
            : ''}
        </p>
      )}
    </Card>
  );
}

export default function MaintenanceList() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const schedules = useMaintenanceSchedules();
  const { t } = useTranslation();

  const filtered = schedules
    ? activeTab === 'all'
      ? schedules
      : schedules.filter(s => s.maintenanceStatus === activeTab)
    : undefined;

  const overdueCnt = schedules?.filter(s => s.maintenanceStatus === 'overdue').length ?? 0;
  const dueSoonCnt = schedules?.filter(s => s.maintenanceStatus === 'due-soon').length ?? 0;

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: t('label.all'), count: schedules?.length },
    { key: 'due-soon', label: t('maintenance.dueSoon'), count: dueSoonCnt },
    { key: 'overdue', label: t('maintenance.overdue'), count: overdueCnt },
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader title={t('page.maintenance')} />

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-colors duration-150',
                activeTab === tab.key
                  ? 'bg-amber-primary text-obsidian'
                  : 'bg-elevated text-text-secondary hover:bg-border',
              ].join(' ')}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={[
                    'text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full',
                    activeTab === tab.key
                      ? 'bg-obsidian/30 text-obsidian'
                      : tab.key === 'overdue'
                        ? 'bg-red-900/60 text-red-300'
                        : tab.key === 'due-soon'
                          ? 'bg-amber-primary/20 text-amber-primary'
                          : 'bg-border text-text-muted',
                  ].join(' ')}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 pt-3">
          {filtered === undefined ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title={
                activeTab === 'overdue'
                  ? 'No overdue services'
                  : activeTab === 'due-soon'
                    ? 'Nothing due soon'
                    : 'No maintenance schedules'
              }
              description={
                activeTab === 'all'
                  ? 'No active maintenance schedules found.'
                  : 'All services are up to date.'
              }
            />
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  }}
                >
                  <MaintenanceCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
