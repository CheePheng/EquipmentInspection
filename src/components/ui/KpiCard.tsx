import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  value: number;
  label: string;
  color?: 'red' | 'amber' | 'green' | 'blue';
  icon?: LucideIcon;
  suffix?: string;
  trend?: 'up' | 'down' | 'flat';
  onClick?: () => void;
}

const colorClasses: Record<NonNullable<KpiCardProps['color']>, string> = {
  red: 'text-status-critical',
  amber: 'text-amber-primary',
  green: 'text-status-available',
  blue: 'text-status-progress',
};

const glowShadows: Record<NonNullable<KpiCardProps['color']>, string> = {
  red: 'shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(248,113,113,0.15)]',
  amber: 'shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(245,166,35,0.15)]',
  green: 'shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(52,211,153,0.15)]',
  blue: 'shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(96,165,250,0.15)]',
};

const TrendIcons = { up: TrendingUp, down: TrendingDown, flat: Minus };
const trendColors = { up: 'text-status-critical', down: 'text-status-available', flat: 'text-text-muted' };

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

export function KpiCard({ value, label, color = 'amber', icon: Icon, suffix, trend, onClick }: KpiCardProps) {
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
        'bg-elevated-high border border-border rounded-xl p-4',
        glowShadows[color],
        isClickable
          ? 'cursor-pointer transition-all duration-150 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-[0.98]'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={['text-3xl font-bold font-mono tabular-nums', colorClasses[color]].join(' ')}>
          <AnimatedNumber value={value} />
          {suffix && <span className="text-xl">{suffix}</span>}
        </div>
        {Icon && (
          <Icon
            size={20}
            className={colorClasses[color]}
            strokeWidth={2}
          />
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <p className="text-xs text-text-secondary uppercase tracking-wide font-medium">
          {label}
        </p>
        {trend && (() => {
          const TrendIcon = TrendIcons[trend];
          return <TrendIcon size={12} className={trendColors[trend]} />;
        })()}
      </div>
    </div>
  );
}
