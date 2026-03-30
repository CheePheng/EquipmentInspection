import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useServiceOrders } from './useServiceOrders';
import { useMachines } from '../machines/useMachines';
import { useTranslation } from '../../i18n/useTranslation';
import { listVariants, cardVariants } from '../../lib/motion';
import { formatDate } from '../../lib/utils';
import type { ServiceOrder } from '../../db/schemas/service-order.schema';

const STATUS_VARIANTS: Record<string, string> = {
  pending: 'open',
  'in-service': 'acknowledged',
  returned: 'service-due',
  completed: 'resolved',
  cancelled: 'deferred',
};

const ACTIVE_STATUSES = new Set(['pending', 'in-service', 'returned']);

function ServiceOrderCard({
  order,
  machineCode,
}: {
  order: ServiceOrder;
  machineCode: string;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const STATUS_LABELS: Record<string, string> = {
    pending: t('serviceOrder.pending'),
    'in-service': t('serviceOrder.inService'),
    returned: t('serviceOrder.returned'),
    completed: t('serviceOrder.completed'),
    cancelled: t('serviceOrder.cancelled'),
  };

  const daysElapsed = differenceInDays(new Date(), parseISO(order.dateSent));

  return (
    <Card pressable onClick={() => navigate(`/service-orders/${order.id}`)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="font-mono text-amber-primary font-semibold text-sm">
          {machineCode}
        </span>
        <span className="font-mono text-xs text-text-muted flex-shrink-0">
          {daysElapsed}{t('misc.days')}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-2">{order.workshopName}</p>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant={STATUS_VARIANTS[order.status] as any}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
        <span className="text-xs text-text-muted">
          {t('label.dateSent')} {formatDate(order.dateSent)}
        </span>
      </div>
    </Card>
  );
}

export default function ServiceOrderList() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'active' | 'completed' | 'all'>('active');
  const allOrders = useServiceOrders();
  const machines = useMachines();

  const machineMap = new Map(machines?.map(m => [m.id!, m.code]));

  const filteredOrders = allOrders?.filter(order => {
    if (tab === 'active') return ACTIVE_STATUSES.has(order.status);
    if (tab === 'completed') return order.status === 'completed' || order.status === 'cancelled';
    return true;
  });

  const tabClass = (active: boolean) =>
    [
      'flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
      active
        ? 'bg-elevated text-amber-primary'
        : 'text-text-muted hover:text-text-primary',
    ].join(' ');

  const emptyDescription =
    tab === 'active'
      ? t('empty.serviceOrdersActive')
      : tab === 'completed'
      ? t('empty.serviceOrdersCompleted')
      : t('empty.serviceOrdersAll');

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-20">
        <PageHeader title={t('page.serviceOrders')} />

        <div className="px-4 pt-3 pb-1">
          <div className="flex gap-1 bg-slate-dark rounded-xl p-1">
            <button
              type="button"
              className={tabClass(tab === 'active')}
              onClick={() => setTab('active')}
            >
              {t('label.active')}
            </button>
            <button
              type="button"
              className={tabClass(tab === 'completed')}
              onClick={() => setTab('completed')}
            >
              {t('label.completed')}
            </button>
            <button
              type="button"
              className={tabClass(tab === 'all')}
              onClick={() => setTab('all')}
            >
              {t('label.all')}
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          {filteredOrders === undefined ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t('empty.serviceOrders')}
              description={emptyDescription}
            />
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={listVariants}
            >
              {filteredOrders.map(order => (
                <motion.div key={order.id} variants={cardVariants}>
                  <ServiceOrderCard
                    order={order}
                    machineCode={machineMap.get(order.machineId) ?? `Machine #${order.machineId}`}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
