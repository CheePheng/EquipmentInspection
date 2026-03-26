import { useAppStore } from '../../stores/app.store';

export function LanguageToggle() {
  const { language, setLanguage } = useAppStore();

  return (
    <div className="inline-flex items-center bg-elevated rounded-full border border-border p-0.5">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={[
          'px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150',
          language === 'en'
            ? 'bg-amber-primary text-obsidian'
            : 'text-text-muted hover:text-text-primary',
        ].join(' ')}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('zh')}
        className={[
          'px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150',
          language === 'zh'
            ? 'bg-amber-primary text-obsidian'
            : 'text-text-muted hover:text-text-primary',
        ].join(' ')}
      >
        中文
      </button>
    </div>
  );
}
