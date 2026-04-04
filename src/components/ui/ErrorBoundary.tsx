import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function ErrorFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-950/30 flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-status-critical" />
      </div>
      <h2 className="text-text-primary font-semibold text-lg mb-1">
        {t('error.title')}
      </h2>
      <p className="text-text-secondary text-sm mb-6 max-w-xs">
        {t('error.description')}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-primary text-obsidian font-medium text-sm transition-all hover:bg-amber-hover active:scale-[0.98]"
        >
          <RotateCcw size={16} />
          {t('action.reload')}
        </button>
        <a
          href={import.meta.env.BASE_URL}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-elevated text-text-primary font-medium text-sm border border-border transition-all hover:bg-elevated-high active:scale-[0.98]"
        >
          <Home size={16} />
          {t('action.home')}
        </a>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Error logged for debugging
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
