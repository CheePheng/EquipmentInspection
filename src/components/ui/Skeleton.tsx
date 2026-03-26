interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'kpi';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div
      className={[
        'bg-elevated rounded-lg animate-pulse',
        className,
      ].join(' ')}
    />
  );
}

export function Skeleton({ variant = 'text', width, height, count = 1, className = '' }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'circle') {
    return <SkeletonBase className={`w-10 h-10 rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`bg-slate-dark border border-border rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${className}`}>
        <SkeletonBase className="h-5 w-3/4 mb-3" />
        <SkeletonBase className="h-4 w-1/2 mb-2" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>
    );
  }

  if (variant === 'kpi') {
    return (
      <div className={`bg-elevated-high border border-border rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${className}`}>
        <SkeletonBase className="h-8 w-16 mb-2" />
        <SkeletonBase className="h-3 w-20" />
      </div>
    );
  }

  // text variant
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((i) => (
        <SkeletonBase
          key={i}
          className={[
            height ?? 'h-4',
            width ?? (i === count - 1 && count > 1 ? 'w-2/3' : 'w-full'),
          ].join(' ')}
        />
      ))}
    </div>
  );
}

// Compound variants for common patterns
Skeleton.Card = function SkeletonCard({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
};

Skeleton.KpiRow = function SkeletonKpiRow({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} variant="kpi" />
      ))}
    </div>
  );
};
