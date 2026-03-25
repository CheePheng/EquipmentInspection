import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { MachineCard } from './MachineCard';
import { TodaysMachine } from './TodaysMachine';
import { useMachines, useSites } from './useMachines';

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function MachineList() {
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  const sites = useSites();
  const machines = useMachines(selectedSiteId);

  const isLoading = machines === undefined || sites === undefined;

  // Build a site lookup map for card display
  const siteMap = new Map((sites ?? []).map((s) => [s.id!, s]));

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader title="Machines" />

        <div className="p-4 space-y-4">
          {/* Today's machine shortcut — only renders for operators */}
          <TodaysMachine />

          {/* Site filter chips */}
          {sites !== undefined && sites.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedSiteId(null)}
                className={[
                  'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                  selectedSiteId === null
                    ? 'bg-amber-primary text-obsidian'
                    : 'bg-elevated text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                All Sites
              </button>
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id!)}
                  className={[
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap',
                    selectedSiteId === site.id
                      ? 'bg-amber-primary text-obsidian'
                      : 'bg-elevated text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                >
                  {site.name}
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && machines.length === 0 && (
            <EmptyState
              icon={Cpu}
              title="No machines found"
              description={
                selectedSiteId
                  ? 'No machines are assigned to this site.'
                  : 'No machines have been added yet.'
              }
            />
          )}

          {/* Machine list */}
          {!isLoading && machines.length > 0 && (
            <motion.div
              className="space-y-3"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {machines.map((machine) => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  site={siteMap.get(machine.siteId)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
