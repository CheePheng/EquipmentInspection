import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 gap-5">
      <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center text-text-muted">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <p className="text-text-primary font-semibold text-base">{title}</p>
        {description && (
          <p className="text-text-secondary text-sm max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
