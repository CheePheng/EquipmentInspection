import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  accent?: boolean;
  pressable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, accent = false, pressable = false, onClick, className = '' }: CardProps) {
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
        'bg-slate-dark border border-border rounded-xl p-4',
        accent ? 'border-l-2 border-l-amber-primary' : '',
        isClickable
          ? 'cursor-pointer transition-all duration-150 hover:border-border/80 hover:bg-elevated active:scale-[0.98]'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
