import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import {
  ClipboardCheck,
  AlertTriangle,
  Clock,
  Cpu,
} from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { useDocQuery } from '../../db/useFirestoreQuery';
import { siteDoc } from '../../db/collections';
import { useAuthStore } from '../auth/auth.store';
import { MACHINE_TYPE_LABELS } from '../../lib/constants';
import { formatMeterHours, formatTimeAgo, formatDate } from '../../lib/utils';
import { useMachine, useMachineTimeline } from './useMachines';
import { useActiveServiceOrder } from '../service-orders/useServiceOrders';
import { useTranslation } from '../../i18n/useTranslation';

const timelineIcons = {
  inspection: ClipboardCheck,
  defect: AlertTriangle,
  downtime: Clock,
};

const timelineColors = {
  inspection: 'text-emerald-400',
  defect: 'text-orange-400',
  downtime: 'text-red-400',
};

// Label keys for timeline types — resolved with t() in render
const timelineLabelKeys = {
  inspection: 'label.inspection',
  defect: 'label.defect',
  downtime: 'label.downtime',
} as const;

function timelineRoute(type: string, id: number): string {
  switch (type) {
    case 'inspection': return `/inspections/${id}`;
    case 'defect': return `/defects/${id}`;
    case 'downtime': return `/downtime/${id}`;
    default: return '/';
  }
}

function formatDateHeader(iso: string, t: (key: string) => string): string {
  const date = parseISO(iso);
  if (isToday(date)) return t('date.today');
  if (isYesterday(date)) return t('date.yesterday');
  return format(date, 'EEE, dd MMM');
}

function groupByDate<T extends { date: string }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item.date.slice(0, 10); // YYYY-MM-DD
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

export default function MachineDetail() {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = Number(idParam);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { t } = useTranslation();

  const machine = useMachine(id);
  const timeline = useMachineTimeline(id);

  const siteRef = machine?.siteId ? siteDoc(machine.siteId) : null;
  const site = useDocQuery<any>(siteRef, [machine?.siteId]);

  const isLoading = machine === undefined || timeline === undefined;
  const role = currentUser?.role;
  const activeServiceOrder = useActiveServiceOrder(id);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader
          title={machine?.code ?? '...'}
          showBack
        />

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && !machine && (
          <div className="p-4">
            <EmptyState
              icon={Cpu}
              title={t('empty.machineNotFound')}
              description={t('empty.machineRemoved')}
              action={{ label: t('nav.machines'), onClick: () => navigate('/machines') }}
            />
          </div>
        )}

        {!isLoading && machine && (
          <div className="p-4 space-y-4">
            {/* Out for Service banner */}
            {activeServiceOrder && (
              <AlertBanner
                severity="warning"
                title={`${t('machine.outForServiceAt')} ${activeServiceOrder.workshopName}`}
                description={`${t('machine.sentOn')} ${formatDate(activeServiceOrder.dateSent)}`}
                action={{
                  label: t('action.viewOrder'),
                  onClick: () => navigate(`/service-orders/${activeServiceOrder.id}`),
                }}
              />
            )}

            {/* ── Hero Section ──────────────────────────────────────────── */}
            <Card tier="hero">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-amber-primary font-bold text-xs uppercase tracking-widest">
                    {machine.code}
                  </p>
                  <p className="text-text-primary font-semibold text-xl leading-tight mt-1 truncate">
                    {machine.name}
                  </p>
                  <Badge variant="default" className="mt-2">{MACHINE_TYPE_LABELS[machine.type as keyof typeof MACHINE_TYPE_LABELS]}</Badge>
                </div>
                <div className="flex-shrink-0 pt-1">
                  <StatusIndicator state={machine.availabilityState} size="md" />
                </div>
              </div>

              {/* Stat strip */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-text-muted text-[10px] uppercase tracking-wide font-medium">{t('label.meterHours')}</p>
                  <p className="text-text-primary font-mono text-sm font-bold tabular-nums mt-0.5">
                    {formatMeterHours(machine.currentMeterHours)}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-[10px] uppercase tracking-wide font-medium">
                    {timeline.length > 0 ? t('label.lastActivity') : t('label.activity')}
                  </p>
                  <p className="text-text-primary text-sm font-semibold mt-0.5">
                    {timeline.length > 0 ? formatTimeAgo(timeline[0].date) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-[10px] uppercase tracking-wide font-medium">{t('label.site')}</p>
                  <p className="text-text-primary text-sm font-semibold mt-0.5 truncate">
                    {site?.name ?? '—'}
                  </p>
                </div>
              </div>
            </Card>

            {/* ── Action Buttons (2-column grid) ───────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              {(role === 'worker' || role === 'supervisor') && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/machines/${machine.id}/inspect`)}
                  className="w-full"
                >
                  <ClipboardCheck size={16} className="mr-1.5" />
                  {t('action.startInspection')}
                </Button>
              )}
              {(role === 'worker' || role === 'supervisor') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/defects/new?machineId=${machine.id}`)}
                  className="w-full"
                >
                  <AlertTriangle size={16} className="mr-1.5" />
                  {t('action.reportDefect')}
                </Button>
              )}
              {(role === 'worker' || role === 'supervisor') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/downtime/new?machineId=${machine.id}`)}
                  className="w-full"
                >
                  <Clock size={16} className="mr-1.5" />
                  {t('action.logDowntime')}
                </Button>
              )}
            </div>

            {/* ── Timeline (date-grouped) ──────────────────────────────── */}
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
                {t('label.activity')}
              </h2>

              {timeline.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title={t('empty.timeline')}
                  description={t('empty.timelineDesc')}
                />
              ) : (
                <div className="space-y-4">
                  {[...groupByDate(timeline)].map(([dateKey, items]) => (
                    <div key={dateKey}>
                      {/* Date header */}
                      <p className="text-text-muted text-xs font-medium uppercase tracking-wide mb-2">
                        {formatDateHeader(items[0].date, t)}
                      </p>

                      {/* Timeline items with connecting line */}
                      <div className="relative pl-5">
                        {/* Vertical connector */}
                        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

                        <div className="space-y-2">
                          {items.map((item) => {
                            const Icon = timelineIcons[item.type];
                            const color = timelineColors[item.type];
                            const labelKey = timelineLabelKeys[item.type];

                            return (
                              <div key={`${item.type}-${item.id}`} className="relative">
                                {/* Dot on the line */}
                                <div className={`absolute -left-5 top-3 w-[7px] h-[7px] rounded-full ring-2 ring-obsidian ${color.replace('text-', 'bg-')}`} />

                                <Card
                                  pressable
                                  onClick={() => navigate(timelineRoute(item.type, item.id))}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={[
                                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                        'bg-elevated-high',
                                        color,
                                      ].join(' ')}
                                    >
                                      <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-text-primary text-sm font-medium">{t(labelKey)}</p>
                                      {item.type === 'defect' && item.data.description && (
                                        <p className="text-text-muted text-xs truncate mt-0.5">
                                          {item.data.description}
                                        </p>
                                      )}
                                      {item.type === 'inspection' && (
                                        <p className="text-text-muted text-xs mt-0.5 capitalize">
                                          {item.data.status}
                                        </p>
                                      )}
                                      {item.type === 'downtime' && item.data.reasonCode && (
                                        <p className="text-text-muted text-xs mt-0.5">
                                          {item.data.reasonCode}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-text-muted text-xs flex-shrink-0 font-mono tabular-nums">
                                      {formatTimeAgo(item.date)}
                                    </span>
                                  </div>
                                </Card>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
