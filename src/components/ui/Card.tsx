import type { ReactNode } from 'react';

type CardTier = 'data' | 'status' | 'hero' | 'action';

interface CardProps {
  children: ReactNode;
  tier?: CardTier;
  accent?: boolean;
  compact?: boolean;
  pressable?: boolean;
  onClick?: () => void;
  className?: string;
}

const tierClasses: Record<CardTier, string> = {
  data: 'bg-slate-dark border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
  status: 'bg-slate-dark border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
  hero: 'bg-elevated-high border border-border rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
  action: 'bg-slate-dark border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
};

const pressableClasses: Record<CardTier, string> = {
  data: 'cursor-pointer transition-all duration-150 hover:border-border/80 hover:bg-elevated active:scale-[0.98]',
  status: 'cursor-pointer transition-all duration-150 hover:border-border/80 hover:bg-elevated active:scale-[0.98]',
  hero: 'cursor-pointer transition-all duration-150 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-[0.98]',
  action: 'cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-amber-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-[0.98]',
};

export function Card({
  children,
  tier = 'data',
  accent = false,
  compact = false,
  pressable = false,
  onClick,
  className = '',
}: CardProps) {
  const isClickable = pressable || !!onClick;

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
        tierClasses[tier],
        compact ? 'px-4 py-3' : 'p-4',
        accent ? 'border-l-2 border-l-amber-primary' : '',
        isClickable ? pressableClasses[tier] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
