type Theme = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'contraction-timer:theme';

function detectTheme(): Theme {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  return 'auto';
}

class ThemeStore {
  theme = $state<Theme>(detectTheme());

  setTheme(t: Theme): void {
    this.theme = t;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, t);
    }
  }

  cycle(): void {
    const order: Theme[] = ['auto', 'light', 'dark'];
    const idx = order.indexOf(this.theme);
    this.setTheme(order[(idx + 1) % order.length]!);
  }
}

export const themeStore = new ThemeStore();
