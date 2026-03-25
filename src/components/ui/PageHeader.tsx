import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function PageHeader({ title, showBack = false, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-obsidian px-4 py-3 flex items-center gap-3 border-b border-border">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex items-center justify-center w-9 h-9 -ml-1 rounded-xl text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors duration-150"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-xl font-semibold text-text-primary truncate">{title}</h1>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}
