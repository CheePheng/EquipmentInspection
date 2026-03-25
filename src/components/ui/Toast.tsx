import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const borderColors = {
  success: 'border-l-amber-primary',
  error: 'border-l-status-critical',
  info: 'border-l-status-progress',
};

const typeLabels = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'bg-slate-dark border border-border rounded-xl px-4 py-3',
        'border-l-4',
        borderColors[type],
        'flex items-start gap-3 shadow-lg',
      ].join(' ')}
    >
      <span className="flex-1 text-sm text-text-primary leading-snug">
        <span className="sr-only">{typeLabels[type]}: </span>
        {message}
      </span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors duration-150 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
