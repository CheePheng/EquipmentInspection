import { motion } from 'framer-motion';

type ProgressColor = 'gold' | 'green' | 'red' | 'blue';

interface ProgressBarProps {
  value: number; // 0-100
  color?: ProgressColor;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const fillColors: Record<ProgressColor, string> = {
  gold: 'bg-amber-primary',
  green: 'bg-status-available',
  red: 'bg-status-critical',
  blue: 'bg-status-progress',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export function ProgressBar({ value, color = 'gold', size = 'md', showLabel = false, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 bg-elevated rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full rounded-full ${fillColors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-semibold text-text-secondary tabular-nums min-w-[3ch] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
