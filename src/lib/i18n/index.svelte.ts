import en from './locales/en.ts';
import da from './locales/da.ts';
import type { MessageKey } from './types.ts';

type Locale = 'en' | 'da';

const locales: Record<Locale, Record<MessageKey, string>> = { en, da };

const STORAGE_KEY = 'contraction-timer:locale';

function detectLocale(): Locale {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored === 'en' || stored === 'da') return stored;
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('da')) return 'da';
  return 'en';
}

class I18nStore {
  locale = $state<Locale>(detectLocale());

  t(key: MessageKey): string {
    return locales[this.locale][key];
  }

  setLocale(l: Locale): void {
    this.locale = l;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, l);
    }
  }
}

export const i18n = new I18nStore();
