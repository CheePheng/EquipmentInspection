import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  value: number;
  label: string;
  color?: 'red' | 'amber' | 'green' | 'blue';
  icon?: LucideIcon;
  onClick?: () => void;
}

const colorClasses: Record<NonNullable<KpiCardProps['color']>, string> = {
  red: 'text-status-critical',
  amber: 'text-amber-primary',
  green: 'text-status-available',
  blue: 'text-status-progress',
};

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    });
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => {
    return rounded.on('change', (v) => setDisplay(v));
  }, [rounded]);

  return <span>{display}</span>;
}

export function KpiCard({ value, label, color = 'amber', icon: Icon, onClick }: KpiCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick?.();
            }
          : undefined
      }
      className={[
        'bg-slate-dark border border-border rounded-xl p-4',
        isClickable
          ? 'cursor-pointer transition-all duration-150 hover:border-border/60 hover:bg-elevated active:scale-[0.98]'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={['text-2xl font-bold', colorClasses[color]].join(' ')}>
          <AnimatedNumber value={value} />
        </div>
        {Icon && (
          <Icon
            size={20}
            className={colorClasses[color]}
            strokeWidth={2}
          />
        )}
      </div>
      <p className="text-xs text-text-secondary uppercase tracking-wide mt-1 font-medium">
        {label}
      </p>
    </div>
  );
}
