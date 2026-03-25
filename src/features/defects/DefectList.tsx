import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import type { FilterSection } from '../../components/ui/FilterDrawer';
import { useDefects } from './useDefects';
import { useMachines } from '../machines/useMachines';
import { formatTimeAgo } from '../../lib/utils';
import type { Defect } from '../../lib/types';

const FILTER_SECTIONS: FilterSection[] = [
  {
    key: 'severity',
    label: 'Severity',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'fixed', label: 'Fixed' },
      { value: 'deferred', label: 'Deferred' },
    ],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  engine: 'Engine',
  hydraulic: 'Hydraulic',
  electrical: 'Electrical',
  structural: 'Structural',
  safety: 'Safety',
  'tires-tracks': 'Tires/Tracks',
  'cab-controls': 'Cab/Controls',
  'lights-signals': 'Lights/Signals',
  'fluid-leaks': 'Fluid Leaks',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  fixed: 'Fixed',
  deferred: 'Deferred',
};

function DefectCard({ defect, machineName }: { defect: Defect; machineName: string }) {
  const navigate = useNavigate();

  return (
    <Card pressable onClick={() => navigate(`/defects/${defect.id}`)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={defect.severity as any}>
            {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
          </Badge>
          <Badge variant={defect.status as any}>
            {STATUS_LABELS[defect.status] ?? defect.status}
          </Badge>
        </div>
        <span className="text-xs text-text-muted flex-shrink-0">
          {formatTimeAgo(defect.createdAt)}
        </span>
      </div>

      <p className="text-sm font-medium text-text-primary mb-1">{machineName}</p>
      <p className="text-xs text-text-secondary mb-1">
        {CATEGORY_LABELS[defect.category] ?? defect.category}
      </p>
      {defect.description && (
        <p className="text-sm text-text-secondary line-clamp-2 mt-1">{defect.description}</p>
      )}
    </Card>
  );
}

export default function DefectList() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({
    severity: [],
    status: [],
  });

  const machines = useMachines();
  const defects = useDefects({
    severity: filterValues.severity.length ? filterValues.severity : undefined,
    status: filterValues.status.length ? filterValues.status : undefined,
  });

  const machineMap = new Map(machines?.map(m => [m.id!, `${m.code} — ${m.name}`]));

  const hasActiveFilters = Object.values(filterValues).some(v => v.length > 0);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-20">
        <PageHeader
          title="Defects"
          action={
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              className={[
                'relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150',
                hasActiveFilters
                  ? 'text-amber-primary hover:bg-amber-primary/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-elevated',
              ].join(' ')}
            >
              <SlidersHorizontal size={20} />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-primary" />
              )}
            </button>
          }
        />

        <div className="px-4 py-4">
          {defects === undefined ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : defects.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No defects found"
              description={
                hasActiveFilters
                  ? 'No defects match the current filters.'
                  : 'No defects have been reported yet.'
              }
              action={
                hasActiveFilters
                  ? undefined
                  : {
                      label: 'Report Defect',
                      onClick: () => navigate('/defects/new'),
                    }
              }
            />
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.04 },
                },
              }}
            >
              {defects.map(defect => (
                <motion.div
                  key={defect.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  }}
                >
                  <DefectCard
                    defect={defect}
                    machineName={machineMap.get(defect.machineId) ?? `Machine #${defect.machineId}`}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <FilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Defects"
        sections={FILTER_SECTIONS}
        values={filterValues}
        onChange={setFilterValues}
      />
    </AnimatedPage>
  );
}
