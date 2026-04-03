import { useAppStore } from '../stores/app.store';
import { en } from './translations/en';
import { ms } from './translations/ms';
import { zh } from './translations/zh';

const translations = { en, ms, zh } as const;

export function useTranslation() {
  const language = useAppStore(s => s.language);
  const t = (key: string): string => {
    const dict = translations[language] as Record<string, string>;
    return dict[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  };
  return { t, language };
}
