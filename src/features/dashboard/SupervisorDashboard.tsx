import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  AlertTriangle,
  XCircle,
  ClipboardCheck,
  Calendar,
  LayoutGrid,
  Wrench,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';

import { useAuthStore } from '../auth/auth.store';
import { useDashboardData } from './useDashboardData';
import { DOWNTIME_CODE_LABELS } from '../../lib/constants';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { KpiCard } from '../../components/ui/KpiCard';
import { Card } from '../../components/ui/Card';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Skeleton } from '../../components/ui/Skeleton';
import { chartColors, severityChartColors, tooltipStyle, axisTickStyle, gridStyle } from '../../lib/chart-theme';

// ─── Greeting helper ─────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Severity config ─────────────────────────────────────────────────────────
const severityConfig = [
  { key: 'critical', label: 'Critical', color: severityChartColors.critical, tw: 'bg-status-critical', textTw: 'text-status-critical' },
  { key: 'high',     label: 'High',     color: severityChartColors.high,     tw: 'bg-orange-500',      textTw: 'text-orange-400' },
  { key: 'medium',   label: 'Medium',   color: severityChartColors.medium,   tw: 'bg-status-warning',  textTw: 'text-status-warning' },
  { key: 'low',      label: 'Low',      color: severityChartColors.low,      tw: 'bg-status-deferred', textTw: 'text-status-deferred' },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────
export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const data = useDashboardData();
  const [alertDismissed, setAlertDismissed] = useState(false);

  const greeting = `${getGreeting()}, ${currentUser?.name?.split(' ')[0] ?? 'Supervisor'}`;

  // Loading state — use skeletons instead of spinner
  if (data === undefined) {
    return (
      <AnimatedPage>
        <div className="flex flex-col min-h-screen bg-obsidian">
          <PageHeader title="Dashboard" />
          <div className="px-4 pt-4 space-y-6">
            <Skeleton count={2} />
            <Skeleton.KpiRow />
            <Skeleton.Card count={2} />
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // ─── Chart data ─────────────────────────────────────────────────────────────
  const downtimeChartData = Object.entries(data.downtimeByCode)
    .map(([code, hours]) => ({
      code,
      label: DOWNTIME_CODE_LABELS[code as keyof typeof DOWNTIME_CODE_LABELS] ?? code,
      hours: Math.round(hours * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8);

  const complianceChartData = data.complianceData.map(d => ({
    ...d,
    day: format(parseISO(d.date), 'EEE'),
  }));

  const maxSeverityCount = Math.max(
    1,
    ...severityConfig.map(s => data.defectsBySeverity[s.key] ?? 0)
  );

  const showAlert = !alertDismissed && (data.criticalDefects > 0 || data.machinesDown > 0);

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen bg-obsidian pb-24">
        <PageHeader title="Dashboard" />

        <div className="px-4 pt-4 space-y-6">
          {/* ── Greeting ───────────────────────────────────────────────────── */}
          <div>
            <p className="text-text-secondary text-sm">{greeting}</p>
            <p className="text-text-primary text-lg font-semibold leading-tight mt-0.5">
              Here's your operation overview
            </p>
          </div>

          {/* ── KPI Grid (2×2 — no scroll needed) ────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              value={data.criticalDefects}
              label="Critical Defects"
              color="red"
              icon={AlertTriangle}
              onClick={() => navigate('/defects')}
            />
            <KpiCard
              value={data.machinesDown}
              label="Machines Down"
              color="red"
              icon={XCircle}
              onClick={() => navigate('/availability')}
            />
            <KpiCard
              value={data.inspectionRate}
              label="Inspections Today"
              color={data.inspectionRate >= 80 ? 'green' : 'amber'}
              icon={ClipboardCheck}
              suffix="%"
              onClick={() => navigate('/machines')}
            />
            <KpiCard
              value={data.overdueMaintenanceCount}
              label="Overdue Maint."
              color="amber"
              icon={Calendar}
              onClick={() => navigate('/maintenance')}
            />
          </div>

          {/* ── Alert Band ────────────────────────────────────────────────── */}
          {showAlert && (
            <AlertBanner
              severity="critical"
              title={[
                data.criticalDefects > 0 ? `${data.criticalDefects} critical defect${data.criticalDefects > 1 ? 's' : ''}` : '',
                data.machinesDown > 0 ? `${data.machinesDown} machine${data.machinesDown > 1 ? 's' : ''} down` : '',
              ].filter(Boolean).join(' · ')}
              description="Requires immediate attention"
              action={{ label: 'View Details', onClick: () => navigate('/defects') }}
              onDismiss={() => setAlertDismissed(true)}
            />
          )}

          {/* ── Downtime by Code ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Downtime by Reason
            </h2>
            <Card>
              {downtimeChartData.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-8">
                  No completed downtime events recorded.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, downtimeChartData.length * 40)}>
                  <BarChart
                    data={downtimeChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      {...gridStyle}
                      horizontal={false}
                      vertical={true}
                    />
                    <XAxis
                      type="number"
                      tick={axisTickStyle}
                      axisLine={false}
                      tickLine={false}
                      unit=" h"
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={120}
                      tick={axisTickStyle}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: '#334155', opacity: 0.3 }}
                      formatter={(value) => [`${value} hrs`, 'Downtime']}
                    />
                    <Bar
                      dataKey="hours"
                      fill={chartColors.primary}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </section>

          {/* ── Inspection Compliance ──────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Inspection Compliance (7 Days)
            </h2>
            <Card>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={complianceChartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={axisTickStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={axisTickStyle}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}%`, 'Compliance']}
                  />
                  <ReferenceLine
                    y={80}
                    stroke={chartColors.text}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    label={{ value: '80% target', fill: chartColors.text, fontSize: 10, position: 'right' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    fill="url(#amberGradient)"
                    dot={false}
                    activeDot={{ fill: chartColors.primary, r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </section>

          {/* ── Defects by Severity ────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Defects by Severity
            </h2>
            <Card>
              <div className="space-y-3">
                {severityConfig.map(({ key, label, tw, textTw }) => {
                  const count = data.defectsBySeverity[key] ?? 0;
                  const pct = Math.round((count / maxSeverityCount) * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                          {label}
                        </span>
                        <span className={`text-xs font-bold font-mono tabular-nums ${textTw}`}>
                          {count}
                        </span>
                      </div>
                      <div className="h-2 bg-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${tw}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: AlertTriangle, label: 'Defects', count: data.totalDefectsOpen, path: '/defects' },
                { icon: LayoutGrid, label: 'Availability', count: data.machinesDown, path: '/availability' },
                { icon: Wrench, label: 'Maintenance', count: data.overdueMaintenanceCount, path: '/maintenance' },
              ].map(({ icon: Icon, label, count, path }) => (
                <Card
                  key={path}
                  tier="action"
                  compact
                  pressable
                  onClick={() => navigate(path)}
                >
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Icon size={20} className="text-text-secondary" />
                    <span className="text-xs font-medium text-text-primary">{label}</span>
                    <span className="text-xs font-mono font-semibold text-amber-primary tabular-nums">{count}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
}
