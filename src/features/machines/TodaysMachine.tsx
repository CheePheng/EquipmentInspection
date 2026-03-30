import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Truck } from 'lucide-react';
import { db } from '../../db/database';
import { useAuthStore } from '../auth/auth.store';
import { MACHINE_TYPE_LABELS } from '../../lib/constants';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Badge } from '../../components/ui/Badge';
import { useTranslation } from '../../i18n/useTranslation';

export function TodaysMachine() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { t } = useTranslation();

  const machine = useLiveQuery(async () => {
    if (!currentUser) return null;

    // Try to find a machine assigned to this operator
    if (currentUser.id) {
      const assigned = await db.machines
        .where('assignedOperatorId')
        .equals(currentUser.id)
        .first();
      if (assigned) return assigned;
    }

    // Fallback: most recently inspected machine by this operator
    const latestInspection = await db.inspections
      .where('operatorId')
      .equals(currentUser.id!)
      .reverse()
      .sortBy('date')
      .then((arr) => arr[0]);

    if (latestInspection) {
      return db.machines.get(latestInspection.machineId) ?? null;
    }

    return null;
  }, [currentUser?.id]);

  // Only show for operators
  if (!currentUser || currentUser.role !== 'worker') return null;
  // Still loading or no machine found
  if (machine === undefined || machine === null) return null;

  return (
    <Card accent className="mb-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-primary/20 flex items-center justify-center flex-shrink-0">
            <Truck size={16} className="text-amber-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
              {t('label.yourMachine')}
            </p>
            <p className="text-text-primary font-semibold truncate">{machine.name}</p>
          </div>
        </div>
        <div className="flex-shrink-0 pt-0.5">
          <StatusIndicator state={machine.availabilityState} size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-amber-primary font-bold text-sm">{machine.code}</span>
        <Badge variant="default">{MACHINE_TYPE_LABELS[machine.type]}</Badge>
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/machines/${machine.id}/inspect`)}
          className="flex-1"
        >
          {t('action.startInspection')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/defects/new?machineId=${machine.id}`)}
          className="flex-1"
        >
          {t('action.reportDefect')}
        </Button>
      </div>
    </Card>
  );
}
