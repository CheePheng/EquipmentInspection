import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useServiceOrder, updateServiceOrderStatus } from './useServiceOrders';
import { useMachine } from '../machines/useMachines';
import { useToastStore } from '../../stores/toast.store';
import { formatDate } from '../../lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  'in-service': 'In Service',
  returned: 'Returned',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_VARIANTS: Record<string, string> = {
  pending: 'open',
  'in-service': 'acknowledged',
  returned: 'service-due',
  completed: 'resolved',
  cancelled: 'deferred',
};

export default function ServiceOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const orderId = id ? parseInt(id, 10) : 0;
  const order = useServiceOrder(orderId);
  const machine = useMachine(order?.machineId ?? 0);

  const [repairSummary, setRepairSummary] = useState('');
  const [costInput, setCostInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (
    newStatus: string,
    extra?: Record<string, unknown>
  ) => {
    setLoading(true);
    try {
      await updateServiceOrderStatus(orderId, newStatus as any, extra as any);
      addToast(`Order marked as ${STATUS_LABELS[newStatus] ?? newStatus}`, 'success');
    } catch {
      addToast('Failed to update service order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const cost = costInput ? parseFloat(costInput) : null;
    handleStatusChange('completed', {
      repairSummary: repairSummary.trim(),
      cost: isNaN(cost as number) ? null : cost,
    });
  };

  if (order === undefined) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AnimatedPage>
    );
  }

  if (order === null) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-obsidian">
          <PageHeader title="Service Order Not Found" showBack />
          <EmptyState
            icon={AlertTriangle}
            title="Service order not found"
            description="This service order may have been removed."
            action={{ label: 'Go Back', onClick: () => navigate(-1) }}
          />
        </div>
      </AnimatedPage>
    );
  }

  const daysElapsed = differenceInDays(new Date(), parseISO(order.dateSent));
  const isActiveOrder = !['completed', 'cancelled'].includes(order.status);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-20">
        <PageHeader title={`Service Order #${order.id}`} showBack />

        <div className="px-4 py-4 space-y-4">
          {/* Machine info */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
              Machine
            </p>
            {machine ? (
              <p className="text-text-primary font-medium">
                <span className="font-mono text-amber-primary">{machine.code}</span>
                {machine.name && (
                  <span className="text-text-secondary font-normal"> — {machine.name}</span>
                )}
              </p>
            ) : (
              <p className="text-text-secondary text-sm font-mono">
                Machine #{order.machineId}
              </p>
            )}
          </Card>

          {/* Status + Workshop */}
          <Card>
            <div className="flex items-start gap-6 flex-wrap">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">Status</p>
                <Badge variant={STATUS_VARIANTS[order.status] as any} className="text-sm px-3 py-1">
                  {STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">Workshop</p>
                <p className="text-sm text-text-primary font-medium">{order.workshopName}</p>
              </div>
            </div>
          </Card>

          {/* Timeline dates */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Timeline
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">Date Sent</span>
                <span className="text-sm text-text-primary font-mono">
                  {formatDate(order.dateSent)}
                </span>
              </div>
              {order.expectedReturnDate && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Expected Return</span>
                  <span className="text-sm text-text-primary font-mono">
                    {formatDate(order.expectedReturnDate)}
                  </span>
                </div>
              )}
              {order.dateReturned && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Date Returned</span>
                  <span className="text-sm text-text-primary font-mono">
                    {formatDate(order.dateReturned)}
                  </span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Completed</span>
                  <span className="text-sm text-text-primary font-mono">
                    {formatDate(order.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Days elapsed */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
              Days Elapsed
            </p>
            <p className="text-2xl font-mono font-bold text-amber-primary">
              {daysElapsed}
              <span className="text-sm text-text-muted font-normal ml-1">days</span>
            </p>
          </Card>

          {/* Notes */}
          {order.notes && order.notes.trim() !== '' && (
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Notes
              </p>
              <p className="text-sm text-text-primary leading-relaxed">{order.notes}</p>
            </Card>
          )}

          {/* Repair Summary */}
          {order.repairSummary &&
            order.repairSummary.trim() !== '' &&
            (order.status === 'returned' || order.status === 'completed') && (
              <Card>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Repair Summary
                </p>
                <p className="text-sm text-text-primary leading-relaxed">
                  {order.repairSummary}
                </p>
              </Card>
            )}

          {/* Cost */}
          {order.cost !== null && order.cost !== undefined && (
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                Cost
              </p>
              <p className="text-lg font-mono font-semibold text-text-primary">
                ${order.cost.toLocaleString()}
              </p>
            </Card>
          )}

          {/* Action buttons */}
          {isActiveOrder && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Actions
              </p>

              {order.status === 'pending' && (
                <Button
                  variant="primary"
                  fullWidth
                  loading={loading}
                  onClick={() => handleStatusChange('in-service')}
                >
                  Mark In Service
                </Button>
              )}

              {order.status === 'in-service' && (
                <Button
                  variant="primary"
                  fullWidth
                  loading={loading}
                  onClick={() => handleStatusChange('returned')}
                >
                  Mark Returned
                </Button>
              )}

              {order.status === 'returned' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">
                      Repair Summary
                    </label>
                    <textarea
                      className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-amber-primary transition-colors duration-150"
                      rows={3}
                      placeholder="Describe the repairs performed..."
                      value={repairSummary}
                      onChange={e => setRepairSummary(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">
                      Cost (optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-primary transition-colors duration-150"
                      placeholder="0.00"
                      value={costInput}
                      onChange={e => setCostInput(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={loading}
                    onClick={handleComplete}
                  >
                    Confirm Complete
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                fullWidth
                loading={loading}
                onClick={() => handleStatusChange('cancelled')}
              >
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
