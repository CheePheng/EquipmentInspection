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
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 gap-4">
      <div className="w-12 h-12 flex items-center justify-center text-text-muted">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-text-primary font-medium">{title}</p>
        {description && (
          <p className="text-text-secondary text-sm">{description}</p>
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
