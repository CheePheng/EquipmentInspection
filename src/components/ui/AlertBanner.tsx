import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type AlertSeverity = 'critical' | 'warning' | 'info';

interface AlertBannerProps {
  severity: AlertSeverity;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

const config: Record<AlertSeverity, { icon: LucideIcon; border: string; bg: string; text: string; shadow: string }> = {
  critical: {
    icon: AlertTriangle,
    border: 'border-l-status-critical',
    bg: 'bg-red-950/30',
    text: 'text-status-critical',
    shadow: 'shadow-[0_0_20px_rgba(248,113,113,0.1)]',
  },
  warning: {
    icon: AlertCircle,
    border: 'border-l-amber-primary',
    bg: 'bg-amber-wash',
    text: 'text-amber-primary',
    shadow: '',
  },
  info: {
    icon: Info,
    border: 'border-l-status-progress',
    bg: 'bg-blue-950/20',
    text: 'text-status-progress',
    shadow: '',
  },
};

export function AlertBanner({ severity, title, description, action, onDismiss }: AlertBannerProps) {
  const { icon: Icon, border, bg, text, shadow } = config[severity];

  return (
    <div
      className={[
        'rounded-xl border-l-4 p-4',
        border,
        bg,
        shadow,
      ].filter(Boolean).join(' ')}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${text}`}>{title}</p>
          {description && (
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={`text-xs font-medium mt-2 underline underline-offset-2 ${text} hover:opacity-80 transition-opacity`}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
