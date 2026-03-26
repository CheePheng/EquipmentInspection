import type { Site } from '../../lib/types';

interface SiteFilterBarProps {
  sites: Site[];
  selectedSiteId: number | null;
  onSelectSite: (siteId: number | null) => void;
}

export function SiteFilterBar({ sites, selectedSiteId, onSelectSite }: SiteFilterBarProps) {
  if (sites.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      <button
        onClick={() => onSelectSite(null)}
        className={[
          'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
          selectedSiteId === null
            ? 'bg-amber-primary text-obsidian'
            : 'bg-elevated text-text-secondary hover:text-text-primary',
        ].join(' ')}
      >
        All Sites
      </button>
      {sites.map((site) => (
        <button
          key={site.id}
          onClick={() => onSelectSite(site.id!)}
          className={[
            'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap',
            selectedSiteId === site.id
              ? 'bg-amber-primary text-obsidian'
              : 'bg-elevated text-text-secondary hover:text-text-primary',
          ].join(' ')}
        >
          {site.name}
        </button>
      ))}
    </div>
  );
}
