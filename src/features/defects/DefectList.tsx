import { useState, useMemo } from 'react';
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
import { useDefects } from './useDefects';
import { useMachines } from '../machines/useMachines';
import { useTranslation } from '../../i18n/useTranslation';
import { formatTimeAgo } from '../../lib/utils';
import type { Defect } from '../../lib/types';

function DefectCard({ defect, machineName }: { defect: Defect; machineName: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const STATUS_LABELS: Record<string, string> = {
    open: t('defect.open'),
    acknowledged: t('defect.acknowledged'),
    'sent-out': t('defect.sentOut'),
    resolved: t('defect.resolved'),
    deferred: t('defect.deferred'),
  };

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

      <p className="text-sm font-medium text-text-primary">{machineName}</p>
    </Card>
  );
}

export default function DefectList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const filterSections = useMemo(() => [
    {
      key: 'severity',
      label: t('filter.severity'),
      options: [
        { value: 'low', label: t('severity.low') },
        { value: 'medium', label: t('severity.medium') },
        { value: 'high', label: t('severity.high') },
        { value: 'critical', label: t('severity.critical') },
      ],
    },
    {
      key: 'status',
      label: t('filter.status'),
      options: [
        { value: 'open', label: t('defect.open') },
        { value: 'acknowledged', label: t('defect.acknowledged') },
        { value: 'sent-out', label: t('defect.sentOut') },
        { value: 'resolved', label: t('defect.resolved') },
        { value: 'deferred', label: t('defect.deferred') },
      ],
    },
  ], [t]);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-20">
        <PageHeader
          title={t('page.defects')}
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
              title={t('empty.defects')}
              description={
                hasActiveFilters
                  ? t('empty.defectsFilterDesc')
                  : t('empty.defectsDesc')
              }
              action={
                hasActiveFilters
                  ? undefined
                  : {
                      label: t('action.reportDefect'),
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
                    machineName={machineMap.get(defect.machineId) ?? `${t('label.machineHash')} #${defect.machineId}`}
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
        title={t('filter.title')}
        sections={filterSections}
        values={filterValues}
        onChange={setFilterValues}
      />
    </AnimatedPage>
  );
}
