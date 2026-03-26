import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Machine } from '../../lib/types';
import type { Site } from '../../lib/types';
import { MACHINE_TYPE_LABELS } from '../../lib/constants';
import { formatMeterHours } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusIndicator } from '../../components/ui/StatusIndicator';

interface MachineCardProps {
  machine: Machine;
  site?: Site;
}

import { cardVariants } from '../../lib/motion';

export function MachineCard({ machine, site }: MachineCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div variants={cardVariants}>
      <Card pressable onClick={() => navigate(`/machines/${machine.id}`)}>
        <div className="flex items-start justify-between gap-3">
          {/* Left: code + name */}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-lg font-bold text-amber-primary leading-tight truncate">
              {machine.code}
            </p>
            <p className="text-text-primary text-sm font-medium mt-0.5 truncate">{machine.name}</p>
          </div>

          {/* Right: status indicator */}
          <div className="flex-shrink-0 pt-0.5">
            <StatusIndicator state={machine.availabilityState} size="sm" />
          </div>
        </div>

        {/* Bottom row: type badge + meter hours + site */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="default">{MACHINE_TYPE_LABELS[machine.type]}</Badge>
          <span className="text-text-muted text-xs font-mono tabular-nums">
            {formatMeterHours(machine.currentMeterHours)}
          </span>
          {site && (
            <span className="text-text-muted text-xs ml-auto truncate">{site.name}</span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
