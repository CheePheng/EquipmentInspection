import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { SiteFilterBar } from '../../components/ui/SiteFilterBar';
import { MachineCard } from './MachineCard';
import { TodaysMachine } from './TodaysMachine';
import { useMachines, useSites } from './useMachines';
import { listVariants } from '../../lib/motion';

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
