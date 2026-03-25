import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  AlertTriangle,
  XCircle,
  ClipboardCheck,
  Calendar,
  ChevronRight,
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
} from 'recharts';

import { useAuthStore } from '../auth/auth.store';
import { useDashboardData } from './useDashboardData';
import { DOWNTIME_CODE_LABELS } from '../../lib/constants';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { KpiCard } from '../../components/ui/KpiCard';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

// ─── Chart theme ────────────────────────────────────────────────────────────
const chartColors = {
  amber: '#F59E0B',
  amberFaded: '#F59E0B40',
  text: '#94A3B8',
  grid: '#334155',
  tooltip: '#1A2332',
};

// ─── Greeting helper ─────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Severity config ─────────────────────────────────────────────────────────
const severityConfig = [
  { key: 'critical', label: 'Critical', color: '#EF4444' },
  { key: 'high',     label: 'High',     color: '#F97316' },
  { key: 'medium',   label: 'Medium',   color: '#F59E0B' },
  { key: 'low',      label: 'Low',      color: '#64748B' },
] as const;

// ─── Custom Tooltip for charts ────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: chartColors.tooltip,
  border: `1px solid ${chartColors.grid}`,
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: 12,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const data = useDashboardData();

  const greeting = `${getGreeting()}, ${currentUser?.name?.split(' ')[0] ?? 'Supervisor'}`;

  // Loading state
  if (data === undefined) {
    return (
      <AnimatedPage>
        <div className="flex flex-col min-h-screen bg-obsidian">
          <PageHeader title="Dashboard" />
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // ─── Downtime chart data ──────────────────────────────────────────────────
  const downtimeChartData = Object.entries(data.downtimeByCode)
    .map(([code, hours]) => ({
      code,
      label: DOWNTIME_CODE_LABELS[code as keyof typeof DOWNTIME_CODE_LABELS] ?? code,
      hours: Math.round(hours * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8);

  // ─── Compliance chart data ────────────────────────────────────────────────
  const complianceChartData = data.complianceData.map(d => ({
    ...d,
    day: format(parseISO(d.date), 'EEE'),
  }));

  // ─── Severity chart data ──────────────────────────────────────────────────
  const maxSeverityCount = Math.max(
    1,
    ...severityConfig.map(s => data.defectsBySeverity[s.key] ?? 0)
  );

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen bg-obsidian pb-24">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <PageHeader title="Dashboard" />

        <div className="px-4 pt-4 space-y-6">
          {/* ── Greeting ───────────────────────────────────────────────────── */}
          <div>
            <p className="text-text-secondary text-sm">{greeting}</p>
            <p className="text-text-primary text-lg font-semibold leading-tight mt-0.5">
              Here's your operation overview
            </p>
          </div>

          {/* ── KPI Strip ──────────────────────────────────────────────────── */}
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            <div className="flex-shrink-0 w-36">
              <KpiCard
                value={data.criticalDefects}
                label="Critical Defects"
                color="red"
                icon={AlertTriangle}
                onClick={() => navigate('/defects')}
              />
            </div>
            <div className="flex-shrink-0 w-36">
              <KpiCard
                value={data.machinesDown}
                label="Machines Down"
                color="red"
                icon={XCircle}
                onClick={() => navigate('/availability')}
              />
            </div>
            <div className="flex-shrink-0 w-36">
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate('/inspections')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/inspections'); }}
                className="bg-slate-dark border border-border rounded-xl p-4 cursor-pointer transition-all duration-150 hover:border-border/60 hover:bg-elevated active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={[
                    'text-2xl font-bold',
                    data.inspectionRate >= 80 ? 'text-status-available' : 'text-amber-primary',
                  ].join(' ')}>
                    {data.inspectionRate}%
                  </div>
                  <ClipboardCheck
                    size={20}
                    className={data.inspectionRate >= 80 ? 'text-status-available' : 'text-amber-primary'}
                    strokeWidth={2}
                  />
                </div>
                <p className="text-xs text-text-secondary uppercase tracking-wide mt-1 font-medium">
                  Inspections Today
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {data.inspectionsToday}/{data.activeMachines} machines
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 w-36">
              <KpiCard
                value={data.overdueMaintenanceCount}
                label="Overdue Maint."
                color="amber"
                icon={Calendar}
                onClick={() => navigate('/maintenance')}
              />
            </div>
          </div>

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
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: chartColors.text, fontSize: 11 }}
                      axisLine={{ stroke: chartColors.grid }}
                      tickLine={false}
                      unit=" h"
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={120}
                      tick={{ fill: chartColors.text, fontSize: 11 }}
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
                      fill={chartColors.amber}
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
                      <stop offset="5%" stopColor={chartColors.amber} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={chartColors.amber} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: chartColors.text, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.grid }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: chartColors.text, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}%`, 'Compliance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke={chartColors.amber}
                    strokeWidth={2}
                    fill="url(#amberGradient)"
                    dot={{ fill: chartColors.amber, r: 3, strokeWidth: 0 }}
                    activeDot={{ fill: chartColors.amber, r: 5, strokeWidth: 0 }}
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
                {severityConfig.map(({ key, label, color }) => {
                  const count = data.defectsBySeverity[key] ?? 0;
                  const pct = Math.round((count / maxSeverityCount) * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                          {label}
                        </span>
                        <span className="text-xs font-bold" style={{ color }}>
                          {count}
                        </span>
                      </div>
                      <div className="h-2 bg-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          {/* ── Quick Links ────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { label: 'View All Defects', sub: `${data.totalDefectsOpen} open`, path: '/defects' },
                { label: 'Availability Board', sub: `${data.machinesDown} down`, path: '/availability' },
                { label: 'Maintenance Due', sub: `${data.overdueMaintenanceCount} overdue`, path: '/maintenance' },
              ].map(({ label, sub, path }) => (
                <Card
                  key={path}
                  pressable
                  onClick={() => navigate(path)}
                  className="!py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary text-sm font-medium">{label}</p>
                      <p className="text-text-secondary text-xs mt-0.5">{sub}</p>
                    </div>
                    <ChevronRight size={18} className="text-text-secondary flex-shrink-0" />
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
