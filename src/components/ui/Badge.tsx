type BadgeVariant =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'open'
  | 'in-progress'
  | 'fixed'
  | 'deferred'
  | 'available'
  | 'service-due'
  | 'down'
  | 'out-for-service'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  low: 'bg-slate-700 text-slate-200',
  medium: 'bg-amber-primary/20 text-amber-primary',
  high: 'bg-orange-900/50 text-orange-300',
  critical: 'bg-red-900/50 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
  open: 'bg-red-900/40 text-red-300',
  'in-progress': 'bg-blue-900/40 text-blue-300',
  fixed: 'bg-emerald-900/40 text-emerald-300',
  deferred: 'bg-gray-700/60 text-gray-400',
  available: 'bg-emerald-900/40 text-emerald-300',
  'service-due': 'bg-amber-primary/20 text-amber-primary',
  down: 'bg-red-900/40 text-red-300',
  'out-for-service': 'bg-orange-900/40 text-orange-300',
  default: 'bg-elevated text-text-secondary',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
