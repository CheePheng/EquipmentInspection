import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useDefects } from './useDefects';
import { useMachines } from '../machines/useMachines';
import { useTranslation } from '../../i18n/useTranslation';
import { formatDate } from '../../lib/utils';

export default function BossDefectList() {
  const { t } = useTranslation();
  const machines = useMachines();
  const defects = useDefects();

  const machineMap = new Map(machines?.map(m => [m.id!, `${m.code} — ${m.name}`]));

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-20">
        <PageHeader title={t('page.defects')} />

        <div className="px-4 py-4">
          {defects === undefined ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : defects.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title={t('empty.defects')}
              description={t('empty.defectsDesc')}
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
              {defects.map(defect => (
                <motion.div
                  key={defect.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  }}
                >
                  <Card>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Badge variant={defect.severity as any}>
                        {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
                      </Badge>
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {formatDate(defect.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      {machineMap.get(defect.machineId) ?? `Machine #${defect.machineId}`}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
