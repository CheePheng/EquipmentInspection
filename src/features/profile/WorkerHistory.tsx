import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { ClipboardCheck, AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../auth/auth.store';
import { db } from '../../db/database';
import { useTranslation } from '../../i18n/useTranslation';
import { listVariants, cardVariants } from '../../lib/motion';
import { formatDate } from '../../lib/utils';
import type { Inspection } from '../../db/schemas/inspection.schema';
import type { Defect } from '../../db/schemas/defect.schema';

const SEVERITY_VARIANTS: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

const DEFECT_STATUS_VARIANTS: Record<string, string> = {
  open: 'open',
  acknowledged: 'acknowledged',
  'sent-out': 'sent-out',
  resolved: 'resolved',
  deferred: 'deferred',
};

const INSPECTION_STATUS_VARIANTS: Record<string, string> = {
  'in-progress': 'acknowledged',
  completed: 'resolved',
  failed: 'open',
};

export default function WorkerHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [tab, setTab] = useState<'inspections' | 'defects'>('inspections');

  const machines = useLiveQuery(() => db.machines.toArray(), []);
  const machineMap = new Map(machines?.map((m) => [m.id!, m.code]));

  const inspections = useLiveQuery<Inspection[]>(
    () =>
      currentUser?.id
        ? db.inspections
            .where('operatorId')
            .equals(currentUser.id)
            .reverse()
            .sortBy('date')
        : Promise.resolve([] as Inspection[]),
    [currentUser?.id]
  );

  const defects = useLiveQuery<Defect[]>(
    () =>
      currentUser?.id
        ? db.defects
            .where('reportedBy')
            .equals(currentUser.id)
            .reverse()
            .sortBy('createdAt')
        : Promise.resolve([] as Defect[]),
    [currentUser?.id]
  );

  const SEVERITY_LABELS: Record<string, string> = {
    low: t('severity.low'),
    medium: t('severity.medium'),
    high: t('severity.high'),
    critical: t('severity.critical'),
  };

  const DEFECT_STATUS_LABELS: Record<string, string> = {
    open: t('defect.open'),
    acknowledged: t('defect.acknowledged'),
    'sent-out': t('defect.sentOut'),
    resolved: t('defect.resolved'),
    deferred: t('defect.deferred'),
  };

  const INSPECTION_STATUS_LABELS: Record<string, string> = {
    'in-progress': t('defect.acknowledged'),
    completed: t('label.completed'),
    failed: t('defect.open'),
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-20">
        <PageHeader title={t('page.myActivity')} />

        <div className="px-4 pt-4 pb-1">
          <div className="flex gap-2 mb-4">
            {(['inspections', 'defects'] as const).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setTab(tabKey)}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150',
                  tab === tabKey
                    ? 'bg-amber-primary text-obsidian'
                    : 'bg-elevated text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {tabKey === 'inspections' ? t('label.inspection') : t('nav.defects')}
              </button>
            ))}
          </div>

          {tab === 'inspections' && (
            <>
              {inspections === undefined ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" />
                </div>
              ) : inspections.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title={t('empty.inspections')}
                  description={t('empty.inspectionsDesc')}
                />
              ) : (
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={listVariants}
                >
                  {inspections.map((inspection) => (
                    <motion.div key={inspection.id} variants={cardVariants}>
                      <Card
                        pressable
                        onClick={() => navigate(`/machines/${inspection.machineId}`)}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="font-mono text-amber-primary font-semibold text-sm">
                            {machineMap.get(inspection.machineId) ?? `#${inspection.machineId}`}
                          </span>
                          <span className="text-xs text-text-muted flex-shrink-0">
                            {formatDate(inspection.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={INSPECTION_STATUS_VARIANTS[inspection.status] as any}>
                            {INSPECTION_STATUS_LABELS[inspection.status] ?? inspection.status}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          {tab === 'defects' && (
            <>
              {defects === undefined ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" />
                </div>
              ) : defects.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title={t('empty.myDefects')}
                  description={t('empty.myDefectsDesc')}
                />
              ) : (
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={listVariants}
                >
                  {defects.map((defect) => (
                    <motion.div key={defect.id} variants={cardVariants}>
                      <Card
                        pressable
                        onClick={() => navigate(`/defects/${defect.id}`)}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="font-mono text-amber-primary font-semibold text-sm">
                            {machineMap.get(defect.machineId) ?? `#${defect.machineId}`}
                          </span>
                          <span className="text-xs text-text-muted flex-shrink-0">
                            {formatDate(defect.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={SEVERITY_VARIANTS[defect.severity] ?? 'default'}>
                            {SEVERITY_LABELS[defect.severity] ?? defect.severity}
                          </Badge>
                          <Badge variant={DEFECT_STATUS_VARIANTS[defect.status] as any}>
                            {DEFECT_STATUS_LABELS[defect.status] ?? defect.status}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
