import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { SlidersHorizontal, Wrench } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../auth/auth.store';
import { useToastStore } from '../../stores/toast.store';
import { useRepairs, claimRepair, updateRepairStatus } from './useRepairs';
import { db } from '../../db/database';
import { formatTimeAgo } from '../../lib/utils';
import type { Repair } from '../../db/schemas/repair.schema';

// ---- RepairCard sub-component with its own live queries for machine/defect ----

interface RepairCardProps {
  repair: Repair;
  onClaim: () => void;
  onMarkFixed: () => void;
  onClick: () => void;
}

function RepairCard({ repair, onClaim, onMarkFixed, onClick }: RepairCardProps) {
  const machine = useLiveQuery(() => db.machines.get(repair.machineId), [repair.machineId]);
  const defect = useLiveQuery(
    () => db.defects.get(repair.defectId),
    [repair.defectId]
  );

  const priorityVariant = repair.priority as any;
  const statusVariant = repair.status as any;

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClaim();
  };

  const handleMarkFixed = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkFixed();
  };

  return (
    <Card pressable onClick={onClick} accent={repair.priority === 'critical'}>
      {/* Top row: priority + status badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant={priorityVariant}>{repair.priority}</Badge>
        <Badge variant={statusVariant}>{repair.status}</Badge>
        <span className="ml-auto text-xs text-text-muted">{formatTimeAgo(repair.createdAt)}</span>
      </div>

      {/* Machine info */}
      <p className="text-text-primary font-semibold text-sm truncate">
        {machine ? `${machine.code} — ${machine.name}` : `Machine #${repair.machineId}`}
      </p>

      {/* Defect description */}
      {defect && (
        <p className="text-text-secondary text-sm mt-1 line-clamp-2">{defect.description || defect.category}</p>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        {repair.status === 'pending' && !repair.mechanicId && (
          <Button size="sm" variant="secondary" onClick={handleClaim}>
            Claim
          </Button>
        )}
        {repair.status === 'in-progress' && (
          <Button size="sm" variant="primary" onClick={handleMarkFixed}>
            Mark Fixed
          </Button>
        )}
      </div>
    </Card>
  );
}

// ---- Main WorkQueue page ----

const FILTER_SECTIONS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'assigned', label: 'Assigned' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'deferred', label: 'Deferred' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
];

type QuickTab = 'all' | 'mine';

export default function WorkQueue() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({
    status: [],
    priority: [],
  });
  const [activeTab, setActiveTab] = useState<QuickTab>('all');

  const repairs = useRepairs({
    status: filterValues.status.length ? filterValues.status : undefined,
    mechanicId: activeTab === 'mine' && currentUser ? currentUser.id : undefined,
  });

  // Apply priority filter client-side after the hook result (priority filter not supported in hook directly)
  const filteredRepairs = repairs
    ? filterValues.priority.length
      ? repairs.filter(r => filterValues.priority.includes(r.priority))
      : repairs
    : undefined;

  const handleClaim = async (repair: Repair) => {
    if (!currentUser) return;
    try {
      await claimRepair(repair.id!, currentUser.id!);
      addToast('Task claimed successfully', 'success');
    } catch {
      addToast('Failed to claim task', 'error');
    }
  };

  const handleMarkFixed = async (repair: Repair) => {
    if (!currentUser) return;
    try {
      await updateRepairStatus(repair.id!, 'completed', repair.defectId);
      addToast('Repair marked as fixed', 'success');
    } catch {
      addToast('Failed to update repair', 'error');
    }
  };

  const activeFiltersCount =
    filterValues.status.length + filterValues.priority.length;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader
          title="Repair Queue"
          action={
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              className="relative flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors duration-150"
            >
              <SlidersHorizontal size={20} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-primary text-obsidian text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          }
        />

        {/* Quick filter tabs */}
        <div className="flex px-4 pt-3 pb-1 gap-2">
          {(['all', 'mine'] as QuickTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'flex-1 h-9 rounded-xl text-sm font-medium transition-colors duration-150',
                activeTab === tab
                  ? 'bg-amber-primary text-obsidian'
                  : 'bg-elevated text-text-secondary hover:bg-border',
              ].join(' ')}
            >
              {tab === 'all' ? 'All Tasks' : 'My Tasks'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 pt-3 space-y-3">
          {filteredRepairs === undefined ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredRepairs.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No repairs in queue"
              description={
                activeTab === 'mine'
                  ? "You haven't claimed any tasks yet."
                  : 'No repairs match the current filters.'
              }
              action={
                activeFiltersCount > 0
                  ? {
                      label: 'Clear Filters',
                      onClick: () => setFilterValues({ status: [], priority: [] }),
                    }
                  : undefined
              }
            />
          ) : (
            filteredRepairs.map((repair, index) => (
              <motion.div
                key={repair.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2, ease: 'easeOut' }}
              >
                <RepairCard
                  repair={repair}
                  onClick={() => navigate(`/repairs/${repair.id}`)}
                  onClaim={() => handleClaim(repair)}
                  onMarkFixed={() => handleMarkFixed(repair)}
                />
              </motion.div>
            ))
          )}
        </div>

        <FilterDrawer
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          title="Filter Repairs"
          sections={FILTER_SECTIONS}
          values={filterValues}
          onChange={setFilterValues}
        />
      </div>
    </AnimatedPage>
  );
}
