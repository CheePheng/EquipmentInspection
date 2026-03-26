import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { SiteFilterBar } from '../../components/ui/SiteFilterBar';
import { useAvailabilityBoard } from './useAvailability';
import { useSites } from './useMachines';
import {
  AVAILABILITY_STATE_COLORS,
  type AvailabilityState,
} from '../../lib/constants';
import { formatMeterHours } from '../../lib/utils';
import { listVariants, cardVariants } from '../../lib/motion';

// Display order: most critical first
const GROUP_ORDER: AvailabilityState[] = [
  'down', 'out-for-service', 'service-due', 'available',
];

const STATE_LABELS: Record<AvailabilityState, string> = {
  'down': 'Down',
  'out-for-service': 'Out for Service',
  'service-due': 'Service Due',
  'available': 'Available',
};

// Summary KPI labels (shorter)
const KPI_LABELS: Record<AvailabilityState, string> = {
  'down': 'Down',
  'out-for-service': 'Out for Service',
  'service-due': 'Service Due',
  'available': 'Available',
};

// Section left-border accent colors per state
const STATE_BORDER: Record<AvailabilityState, string> = {
  'down': 'border-l-red-500',
  'out-for-service': 'border-l-orange-500',
  'service-due': 'border-l-amber-400',
  'available': 'border-l-emerald-500',
};

// Section background tint per state
const STATE_SECTION_BG: Record<AvailabilityState, string> = {
  'down': 'bg-red-950/20',
  'out-for-service': 'bg-orange-950/20',
  'service-due': 'bg-amber-950/20',
  'available': 'bg-emerald-950/20',
};

// cardVariants and listVariants imported from src/lib/motion.ts

export default function AvailabilityBoard() {
  const navigate = useNavigate();
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  const sites = useSites();
  const machines = useAvailabilityBoard(selectedSiteId);

  const isLoading = machines === undefined || sites === undefined;

  // Group machines by computed availability state
  const grouped = new Map<AvailabilityState, typeof machines>([]);
  if (machines) {
    for (const state of GROUP_ORDER) {
      const inState = machines.filter(m => m.availabilityState === state);
      if (inState.length > 0) {
        grouped.set(state, inState);
      }
    }
  }

  // Summary counts
  const counts = machines
    ? GROUP_ORDER.reduce<Record<AvailabilityState, number>>(
        (acc, s) => {
          acc[s] = machines.filter(m => m.availabilityState === s).length;
          return acc;
        },
        {} as Record<AvailabilityState, number>
      )
    : null;

  const hasMachines = machines && machines.length > 0;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader title="Availability Board" />

        <div className="p-4 space-y-4">
          {/* Site filter chips */}
          {sites !== undefined && (
            <SiteFilterBar
              sites={sites}
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
            />
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !hasMachines && (
            <EmptyState
              icon={LayoutGrid}
              title="No machines found"
              description={
                selectedSiteId
                  ? 'No machines are assigned to this site.'
                  : 'No machines have been added yet.'
              }
            />
          )}

          {!isLoading && hasMachines && counts && (
            <>
              {/* Summary strip — sticky */}
              <div className="sticky top-0 z-10 bg-obsidian -mx-4 px-4 pb-2 pt-1 border-b border-border/50 flex gap-2 overflow-x-auto scrollbar-hide">
                {GROUP_ORDER.filter(s => counts[s] > 0).map(state => {
                  const colors = AVAILABILITY_STATE_COLORS[state];
                  return (
                    <div
                      key={state}
                      className={[
                        'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border border-border',
                        colors.bg,
                        'min-w-[80px]',
                      ].join(' ')}
                    >
                      <span className={`text-xl font-mono font-bold tabular-nums ${colors.text}`}>
                        {counts[state]}
                      </span>
                      <span className="text-[10px] text-text-secondary text-center leading-tight mt-0.5">
                        {KPI_LABELS[state]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* State groups */}
              <div className="space-y-6">
                {GROUP_ORDER.filter(state => grouped.has(state)).map(state => {
                  const group = grouped.get(state)!;
                  const colors = AVAILABILITY_STATE_COLORS[state];

                  return (
                    <section key={state}>
                      {/* Section header */}
                      <div
                        className={[
                          'flex items-center gap-2 px-3 py-2 rounded-lg mb-3',
                          'border-l-4',
                          STATE_BORDER[state],
                          STATE_SECTION_BG[state],
                        ].join(' ')}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <span className={`font-semibold text-sm ${colors.text}`}>
                          {STATE_LABELS[state]}
                        </span>
                        <span className="ml-auto text-xs text-text-muted font-medium tabular-nums">
                          {group.length} {group.length === 1 ? 'machine' : 'machines'}
                        </span>
                      </div>

                      {/* Machine cards grid */}
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {group.map(machine => (
                          <motion.div key={machine.id} variants={cardVariants}>
                            <Card
                              tier="status"
                              pressable
                              onClick={() => navigate(`/machines/${machine.id}`)}
                              className={[
                                'border-l-2',
                                STATE_BORDER[state],
                              ].join(' ')}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-mono font-semibold text-amber-primary uppercase tracking-wider">
                                      {machine.code}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-text-primary truncate leading-tight">
                                    {machine.name}
                                  </p>
                                  <p className="text-xs text-text-secondary mt-0.5 capitalize">
                                    {machine.type.replace(/-/g, ' ')}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 pt-0.5">
                                  <StatusIndicator state={machine.availabilityState} size="sm" />
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                                <span className="text-xs text-text-muted">Meter Hours</span>
                                <span className="text-xs font-mono font-semibold text-text-secondary tabular-nums">
                                  {formatMeterHours(machine.currentMeterHours)}
                                </span>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    </section>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
