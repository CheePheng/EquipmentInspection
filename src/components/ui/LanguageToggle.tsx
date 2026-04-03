import { useAppStore } from '../../stores/app.store';

export function LanguageToggle() {
  const { language, setLanguage } = useAppStore();

  const options = [
    { value: 'en' as const, label: 'EN' },
    { value: 'ms' as const, label: 'BM' },
    { value: 'zh' as const, label: '中文' },
  ];

  return (
    <div className="inline-flex items-center bg-elevated rounded-full border border-border p-0.5">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setLanguage(value)}
          className={[
            'px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150',
            language === value
              ? 'bg-amber-primary text-obsidian'
              : 'text-text-muted hover:text-text-primary',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
