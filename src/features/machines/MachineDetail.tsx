import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ClipboardCheck,
  AlertTriangle,
  Wrench,
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
import { db } from '../../db/database';
import { useAuthStore } from '../auth/auth.store';
import { MACHINE_TYPE_LABELS } from '../../lib/constants';
import { formatMeterHours, formatTimeAgo } from '../../lib/utils';
import { useMachine, useMachineTimeline } from './useMachines';

const timelineIcons = {
  inspection: ClipboardCheck,
  defect: AlertTriangle,
  repair: Wrench,
  downtime: Clock,
};

const timelineColors = {
  inspection: 'text-emerald-400',
  defect: 'text-orange-400',
  repair: 'text-blue-400',
  downtime: 'text-red-400',
};

const timelineLabels = {
  inspection: 'Inspection',
  defect: 'Defect reported',
  repair: 'Repair logged',
  downtime: 'Downtime event',
};

function timelineRoute(type: string, id: number): string {
  switch (type) {
    case 'inspection': return `/inspections/${id}`;
    case 'defect': return `/defects/${id}`;
    case 'repair': return `/repairs/${id}`;
    case 'downtime': return `/downtime/${id}`;
    default: return '/';
  }
}

export default function MachineDetail() {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = Number(idParam);
  const currentUser = useAuthStore((s) => s.currentUser);

  const machine = useMachine(id);
  const timeline = useMachineTimeline(id);

  const site = useLiveQuery(async () => {
    if (!machine?.siteId) return undefined;
    return db.sites.get(machine.siteId);
  }, [machine?.siteId]);

  const isLoading = machine === undefined || timeline === undefined;
  const role = currentUser?.role;

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
              title="Machine not found"
              description="This machine may have been removed."
              action={{ label: 'Back to Machines', onClick: () => navigate('/machines') }}
            />
          </div>
        )}

        {!isLoading && machine && (
          <div className="p-4 space-y-4">
            {/* Machine info card */}
            <Card>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-semibold text-lg leading-tight truncate">
                    {machine.name}
                  </p>
                  <p className="font-mono text-amber-primary font-bold text-base mt-0.5">
                    {machine.code}
                  </p>
                </div>
                <div className="flex-shrink-0 pt-0.5">
                  <StatusIndicator state={machine.availabilityState} size="md" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <p className="text-text-muted text-xs uppercase tracking-wide font-medium">Type</p>
                  <Badge variant="default">{MACHINE_TYPE_LABELS[machine.type]}</Badge>
                </div>
                <div className="space-y-0.5">
                  <p className="text-text-muted text-xs uppercase tracking-wide font-medium">Meter Hours</p>
                  <p className="text-text-primary font-mono text-sm font-semibold">
                    {formatMeterHours(machine.currentMeterHours)}
                  </p>
                </div>
                {site && (
                  <div className="col-span-2 space-y-0.5">
                    <p className="text-text-muted text-xs uppercase tracking-wide font-medium">Site</p>
                    <p className="text-text-primary text-sm">{site.name}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Action buttons — contextual by role */}
            <div className="flex flex-wrap gap-2">
              {(role === 'operator' || role === 'supervisor') && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/machines/${machine.id}/inspect`)}
                >
                  Start Inspection
                </Button>
              )}
              {(role === 'operator' || role === 'mechanic' || role === 'supervisor') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/defects/new?machineId=${machine.id}`)}
                >
                  Report Defect
                </Button>
              )}
              {(role === 'operator' || role === 'mechanic' || role === 'supervisor') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/downtime/new?machineId=${machine.id}`)}
                >
                  Log Downtime
                </Button>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-text-primary font-semibold text-base mb-3">Recent Activity</h2>

              {timeline.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title="No activity yet"
                  description="Inspections, defects, repairs and downtime will appear here."
                />
              ) : (
                <div className="space-y-2">
                  {timeline.map((item) => {
                    const Icon = timelineIcons[item.type];
                    const color = timelineColors[item.type];
                    const label = timelineLabels[item.type];

                    return (
                      <Card
                        key={`${item.type}-${item.id}`}
                        pressable
                        onClick={() => navigate(timelineRoute(item.type, item.id))}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                              'bg-slate-800',
                              color,
                            ].join(' ')}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary text-sm font-medium">{label}</p>
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
                            {item.type === 'repair' && (
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
                          <span className="text-text-muted text-xs flex-shrink-0">
                            {formatTimeAgo(item.date)}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
