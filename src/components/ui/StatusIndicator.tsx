import { motion } from 'framer-motion';
import type { AvailabilityState } from '../../lib/constants';
import { AVAILABILITY_STATE_COLORS } from '../../lib/constants';

interface StatusIndicatorProps {
  state: AvailabilityState;
  label?: string;
  size?: 'sm' | 'md';
}

const PULSE_STATES: AvailabilityState[] = ['available', 'under-maintenance'];

const dotSizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
};

function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function StatusIndicator({ state, label, size = 'md' }: StatusIndicatorProps) {
  const colors = AVAILABILITY_STATE_COLORS[state];
  const reducedMotion = useReducedMotion();
  const shouldPulse = PULSE_STATES.includes(state) && !reducedMotion;

  const dot = (
    <span
      className={[
        'rounded-full flex-shrink-0',
        dotSizeClasses[size],
        colors.dot,
      ].join(' ')}
    />
  );

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSizeClasses[size]} ${colors.text}`}>
      {shouldPulse ? (
        <motion.span
          className={`rounded-full flex-shrink-0 ${dotSizeClasses[size]} ${colors.dot}`}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        dot
      )}
      {label ?? state}
    </span>
  );
}
