# Contraction Timer Codebase Guide

## Project Overview

**Contraction Timer** is a progressive web app (PWA) for tracking labor contractions. It's built with **Svelte 5** (runes), **Vite**, and **TypeScript**. The app requires zero external runtime dependencies beyond Svelte, implementing custom solutions for i18n, theming, and state management.

### Key Tech Stack

- **Framework:** Svelte 5 with runes (`$state`, `$derived`, `$effect`, `$props`)
- **Build:** Vite
- **Language:** TypeScript
- **Testing:** Vitest + @testing-library/svelte
- **PWA:** vite-plugin-pwa
- **State:** Custom ContractionStore (singleton, Svelte class with `$state`)
- **i18n:** Custom system (no library)
- **Theming:** CSS variables + localStorage
- **No SvelteKit, no router, no UI library**

---

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (hot reload, port 5173)
npm run check        # TypeScript check + Svelte check
npm test             # Run Vitest
npm run lint         # Run ESLint
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Architecture

### Core State Management: `src/lib/store.svelte.ts`

The **ContractionStore** is a singleton class using Svelte 5 `$state` rune:

```typescript
export class ContractionStore {
  contractions = $state<Contraction[]>([]);
  lastStartTime = $state<number | null>(null);
  // ... reactive state properties

  addContraction() {
    /* ... */
  }
  deleteContraction(id: string) {
    /* ... */
  }
  // ... instance methods
}

export const store = new ContractionStore(); // singleton
```

**Why `.svelte.ts`?** Svelte runes like `$state` only work in files ending with `.svelte.ts`. They're compiled away into getters/setters by the Svelte preprocessor.

**Reactivity:** Components import and use `store` directly. Changes to `store.contractions` trigger component re-renders automatically.

### Computed Stats: `src/lib/stats.ts`

Pure function (no `$state`) that computes stats from contractions:

```typescript
export interface Stats {
  laborStartTime: number | null;
  count: number;
  avgDurationMins: number;
  avgIntervalMins: number | null;
  lastIntervalMins: number | null;
  laborDurationMins: number;
}

export function computeStats(contractions: Contraction[]): Stats {
  // Pure computation, no side effects
}
```

**When called:** In components via `$derived` or `$effect`. Example in `App.svelte`:

```typescript
let stats = $derived(computeStats(store.contractions));
```

### Persistence: `src/lib/storage.ts`

Handles localStorage sync:

```typescript
export function loadContractions(): Contraction[] {
  /* ... */
}
export function saveContractions(contractions: Contraction[]) {
  /* ... */
}
```

**Keys:**

- `contraction-timer:contractions` — JSON array of contractions
- `contraction-timer:locale` — current locale ('en' or 'da')
- `contraction-timer:theme` — current theme ('auto', 'light', 'dark')

**Load on app start:** `App.svelte` calls `store.loadFromStorage()` in `$effect` on mount.

### Formatting Utilities: `src/lib/utils.ts`

```typescript
export function formatDuration(seconds: number): string; // "12:34:56"
export function formatTime(date: Date): string; // "14:32"
export function formatIntervalMins(mins: number | null): string; // "5 min" or "—"
```

---

## i18n System (Custom)

### Architecture: `src/lib/i18n/`

```
src/lib/i18n/
├── index.svelte.ts    # I18nStore class, singleton `i18n`
├── types.ts           # MessageKey type definition
└── locales/
    ├── en.ts          # English strings (source of truth)
    └── da.ts          # Danish strings (must match en.ts keys)
```

### The I18nStore

```typescript
export class I18nStore {
  locale = $state<'en' | 'da'>('en');
  private messages: Record<MessageKey, string> = {};

  t(key: MessageKey): string {
    /* returns translated string */
  }
  setLocale(newLocale: 'en' | 'da') {
    /* switch locale, persist */
  }
}

export const i18n = new I18nStore();
```

**Reactivity:** `i18n.locale` is `$state`, so changing it automatically re-renders all components using `i18n.t()`.

### How to Add a New Translated String

#### Step 1: Update English strings

Edit `src/lib/i18n/locales/en.ts`:

```typescript
export const en: Record<MessageKey, string> = {
  // ... existing keys
  'common.myNewString': 'This is my new string',
  'common.stringWithVar': 'Hello {name}, welcome!',
};
```

#### Step 2: Update Danish strings

Edit `src/lib/i18n/locales/da.ts`. **Must add the same key**, or TypeScript will error:

```typescript
export const da: Record<MessageKey, string> = {
  // ... existing keys
  'common.myNewString': 'Dette er min nye streng',
  'common.stringWithVar': 'Hej {name}, velkommen!',
};
```

#### Step 3: Update MessageKey type

Edit `src/lib/i18n/types.ts` to add the new key:

```typescript
export type MessageKey =
  | 'common.myNewString'
  | 'common.stringWithVar'
  | /* ... rest of keys */;
```

#### Step 4: Use in component

```svelte
<script>
  import { i18n } from '$lib/i18n';
</script>

<p>{i18n.t('common.myNewString')}</p>

<!-- With variables: -->
<p>{i18n.t('common.stringWithVar').replace('{name}', 'Alice')}</p>
```

#### Step 5: Verify

```bash
npm run check  # TypeScript checks that both locales have all keys
```

---

## Theme System

### Architecture: `src/lib/theme.svelte.ts`

```typescript
export class ThemeStore {
  theme = $state<'auto' | 'light' | 'dark'>('auto');

  setTheme(newTheme: 'auto' | 'light' | 'dark') {
    /* ... */
  }
  getEffectiveTheme(): 'light' | 'dark' {
    /* respects prefers-color-scheme */
  }
}

export const themeStore = new ThemeStore();
```

### CSS Variables: `src/app.css`

Structure:

```css
:root {
  /* Dark theme (default) */
  --color-bg: #0f0f0f;
  --color-text: #ffffff;
  --color-border: #333333;
  /* ... more variables */
}

[data-theme='light'] {
  /* Light theme overrides */
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-border: #e0e0e0;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* Auto mode respects system preference */
    --color-bg: #ffffff;
    --color-text: #000000;
    /* ... same as light theme */
  }
}
```

### How to Add a New Theme Color

#### Step 1: Add to `src/app.css`

Define the variable in all three theme blocks:

```css
:root {
  --color-button-bg: #1a1a1a; /* Dark value */
}

[data-theme='light'] {
  --color-button-bg: #f0f0f0; /* Light value */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-button-bg: #f0f0f0; /* Same as light */
  }
}
```

#### Step 2: Use in components

```svelte
<style>
  .button {
    background-color: var(--color-button-bg);
  }
</style>
```

#### Step 3: Test

- Switch theme in Settings → watch the color change
- Test auto mode (system preference)
- Check persistence across page reload

### How Theming Works

1. **App.svelte** applies `data-theme` attribute to `<html>` via `$effect`:

   ```typescript
   $effect(() => {
     document.documentElement.dataset.theme = themeStore.theme === 'auto' ? '' : themeStore.theme;
   });
   ```

2. **CSS cascades:** Browser applies the matching theme block's variables.

3. **Persistence:** `src/lib/storage.ts` loads/saves theme from localStorage key `contraction-timer:theme`.

4. **Auto mode:** When `data-theme` is not set, `@media (prefers-color-scheme: light)` applies based on system preference.

---

## Tooltip System

### InfoTooltip Component: `src/components/InfoTooltip.svelte`

Uses the HTML **Popover API** (browser native, no library):

```svelte
<script>
  let popover: HTMLDivElement;

  $effect(() => {
    popover?.addEventListener('mouseenter', () => popover?.showPopover?.());
    popover?.addEventListener('mouseleave', () => popover?.hidePopover?.());
  });
</script>

<div bind:this={popover} popover="auto" role="tooltip">
  {#snippet content()}
    {children}
  {/snippet}
</div>
```

**Features:**

- Desktop: hover to show/hide
- Mobile: tap `popovertarget` button to toggle

### Current Usage

**StatsCard.svelte** shows tooltips for each stat (labor time, count, avg duration, etc.):

```svelte
<InfoTooltip>
  <span slot="label">Avg Duration</span>
  <span slot="content">Average contraction duration in minutes</span>
</InfoTooltip>
```

Tooltips only show when there are ≥2 contractions (enough data to make sense).

### How to Add a Tooltip to a New Component

#### Step 1: Import InfoTooltip

```svelte
<script>
  import InfoTooltip from '$components/InfoTooltip.svelte';
</script>
```

#### Step 2: Wrap content with tooltip

```svelte
<InfoTooltip>
  <span slot="label">Your Label</span>
  <span slot="content">Explanation text here</span>
</InfoTooltip>
```

#### Step 3: Style if needed

The tooltip uses browser defaults; override via CSS variable `--tooltip-bg`, etc. in `src/app.css` if needed.

---

## Component Map

### Layout Components

| Component         | Purpose                                                          | Location          |
| ----------------- | ---------------------------------------------------------------- | ----------------- |
| **App.svelte**    | Root component, mounts store, applies theme, renders main layout | `src/`            |
| **TopBar.svelte** | Header: labor time, badge, locale toggle, settings button        | `src/components/` |

### Main Content Components

| Component                   | Purpose                                                | Location          |
| --------------------------- | ------------------------------------------------------ | ----------------- |
| **BigButton.svelte**        | Large start/end button for new contraction             | `src/components/` |
| **StatsCard.svelte**        | Displays summary stats with tooltips (≥2 contractions) | `src/components/` |
| **Timeline.svelte**         | 60-minute visual timeline (≥2 contractions)            | `src/components/` |
| **ContractionLog.svelte**   | Scrollable table of all contractions (≥1 contraction)  | `src/components/` |
| **StillGoingBanner.svelte** | Warning banner if active contraction > 3 min           | `src/components/` |

### Modal/Overlay Components

| Component                | Purpose                                      | Location          |
| ------------------------ | -------------------------------------------- | ----------------- |
| **SettingsPanel.svelte** | Modal: theme, language, export, clear, about | `src/components/` |
| **EditModal.svelte**     | Modal: edit/delete individual contraction    | `src/components/` |

### Utility Components

| Component                    | Purpose                                  | Location          |
| ---------------------------- | ---------------------------------------- | ----------------- |
| **InfoTooltip.svelte**       | Popover API wrapper for tooltips         | `src/components/` |
| **WakeLockIndicator.svelte** | Small indicator showing wake lock status | `src/components/` |

---

## Svelte 5 Rune Patterns Used in This Codebase

### State in Classes (`.svelte.ts` files)

```typescript
// src/lib/store.svelte.ts
export class ContractionStore {
  contractions = $state<Contraction[]>([]);
  lastStartTime = $state<number | null>(null);

  addContraction() {
    this.contractions.push({
      id: crypto.randomUUID(),
      startTime: Date.now(),
    });
  }
}
```

**Why it works:** `.svelte.ts` files are preprocessed by Svelte, converting `$state` properties to getters/setters.

### State in Components

```svelte
<script>
  let count = $state(0);

  function increment() {
    count++; // Triggers re-render
  }
</script>

<button onclick={increment}>{count}</button>
```

### Derived Values

```svelte
<script>
  import { store } from '$lib/store.svelte';

  let stats = $derived(computeStats(store.contractions));
  let avgDuration = $derived.by(() => {
    return stats.avgDurationMins?.toFixed(1) ?? '—';
  });
</script>

<p>Average duration: {avgDuration} min</p>
```

**Difference:**

- `$derived(expression)` — simple expression, re-runs when dependencies change
- `$derived.by(() => { ... })` — block form, useful for complex logic or ternaries

### Effects with Cleanup

```svelte
<script>
  $effect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);

    return () => clearInterval(timer); // Cleanup function
  });
</script>
```

**Order of execution:**

1. Effect runs first time on mount
2. Cleanup function runs on unmount or before re-run
3. Effect runs again if dependencies change

### Props with Interface

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count: number;
    onUpdate?: (value: number) => void;
  }

  let { title, count, onUpdate }: Props = $props();
</script>

<h2>{title}</h2>
<p>Count: {count}</p>
<button onclick={() => onUpdate?.(count + 1)}>Increment</button>
```

**Note:** Destructuring in the component script automatically marks props as bindable.

### Binding DOM Refs with `$state`

```svelte
<script>
  let popover = $state<HTMLDivElement | undefined>();

  function show() {
    popover?.showPopover();
  }
</script>

<div bind:this={popover} popover="auto">Content here</div>

<button onclick={show}>Show</button>
```

### Reactive Class Instances (Store Pattern)

```typescript
// src/lib/store.svelte.ts
export class ContractionStore {
  contractions = $state<Contraction[]>([]);

  addContraction() {
    this.contractions = [...this.contractions, newItem];
  }
}

export const store = new ContractionStore();
```

```svelte
<script>
  import { store } from '$lib/store.svelte';
</script>

<!-- Reactivity works because store.contractions is $state -->
{#each store.contractions as item (item.id)}
  <div>{item.startTime}</div>
{/each}

<!-- Method calls trigger updates -->
<button onclick={() => store.addContraction()}> Add </button>
```

---

## What NOT to Do (Common Pitfalls)

### ❌ Don't use `$state` in regular `.ts` files

```typescript
// WRONG: src/lib/utils.ts
export let count = $state(0); // Error: runes only work in .svelte.ts
```

**Fix:** Move to `.svelte.ts` file or use in component:

```typescript
// RIGHT: src/lib/store.svelte.ts
export class Store {
  count = $state(0);
}
```

### ❌ Don't forget to add both English and Danish keys

```typescript
// WRONG: src/lib/i18n/locales/en.ts
export const en = {
  'label.newKey': 'New label',
};

// WRONG: src/lib/i18n/locales/da.ts (missing key!)
export const da = {
  // 'label.newKey' not added -> TypeScript error
};
```

**Fix:** Always update both files:

```typescript
// RIGHT: src/lib/i18n/locales/da.ts
export const da = {
  'label.newKey': 'Nyt label',
};
```

### ❌ Don't hardcode colors, use CSS variables

```svelte
<style>
  /* WRONG */
  button {
    background-color: #1a1a1a; /* Won't change with theme */
  }
</style>
```

**Fix:** Use CSS variable:

```svelte
<style>
  /* RIGHT */
  button {
    background-color: var(--color-button-bg);
  }
</style>
```

### ❌ Don't modify `store` state outside of methods (anti-pattern)

```svelte
<!-- WRONG -->
<button onclick={() => (store.contractions = [])} class="danger"> Clear (don't do this!) </button>
```

**Fix:** Use class methods:

```typescript
// src/lib/store.svelte.ts
export class ContractionStore {
  clear() {
    this.contractions = [];
  }
}
```

```svelte
<!-- RIGHT -->
<button onclick={() => store.clear()} class="danger"> Clear </button>
```

### ❌ Don't forget path aliases

```typescript
// WRONG: relative paths scatter through code
import { store } from '../../lib/store.svelte';
```

**Fix:** Use aliases (configured in `vite.config.ts`):

```typescript
// RIGHT
import { store } from '$lib/store.svelte';
import InfoTooltip from '$components/InfoTooltip.svelte';
```

### ❌ Don't create multiple instances of singleton stores

```typescript
// WRONG
export const store1 = new ContractionStore();
export const store2 = new ContractionStore(); // Separate state!
```

**Fix:** Single instance:

```typescript
// RIGHT
export const store = new ContractionStore();
```

---

## Testing Approach

### Test Structure

Tests are colocated with source files: `src/lib/FILENAME.test.ts`

### Running Tests

```bash
npm test              # Run all tests
npm test -- --ui     # Run with UI dashboard
npm test -- --watch  # Watch mode
```

### Testing Stores (Pure Logic)

```typescript
// src/lib/stats.test.ts
import { describe, it, expect } from 'vitest';
import { computeStats } from './stats';

describe('computeStats', () => {
  it('computes average duration correctly', () => {
    const contractions = [
      { id: '1', startTime: 0, endTime: 60 },
      { id: '2', startTime: 100, endTime: 180 },
    ];

    const stats = computeStats(contractions);
    expect(stats.avgDurationMins).toBeCloseTo(2); // (60+80) / (60*2) ≈ 1.17 min
  });
});
```

### Testing Components (with @testing-library/svelte)

```typescript
// src/components/BigButton.test.ts
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import BigButton from './BigButton.svelte';

describe('BigButton', () => {
  it('calls onclick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(BigButton, { props: { onclick: handleClick } });

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Testing Store Interactions

```typescript
// src/lib/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { store } from './store.svelte';

describe('ContractionStore', () => {
  beforeEach(() => {
    store.contractions = [];
  });

  it('adds a contraction', () => {
    store.addContraction();
    expect(store.contractions).toHaveLength(1);
  });
});
```

### Mocking Modules

For localStorage or other APIs:

```typescript
import { vi } from 'vitest';

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## File Structure Reference

```
contraction-timer/
├── src/
│   ├── App.svelte                 # Root component
│   ├── app.css                    # Global styles + theme CSS vars
│   ├── app.d.ts                   # TypeScript declarations
│   ├── main.ts                    # Entry point
│   │
│   ├── components/
│   │   ├── App.svelte
│   │   ├── BigButton.svelte
│   │   ├── ContractionLog.svelte
│   │   ├── EditModal.svelte
│   │   ├── InfoTooltip.svelte
│   │   ├── SettingsPanel.svelte
│   │   ├── StatsCard.svelte
│   │   ├── StillGoingBanner.svelte
│   │   ├── Timeline.svelte
│   │   ├── TopBar.svelte
│   │   └── WakeLockIndicator.svelte
│   │
│   └── lib/
│       ├── store.svelte.ts        # ContractionStore (singleton)
│       ├── store.test.ts
│       ├── stats.ts               # computeStats() pure function
│       ├── stats.test.ts
│       ├── storage.ts             # localStorage persistence
│       ├── utils.ts               # Formatting utilities
│       ├── utils.test.ts
│       │
│       ├── theme.svelte.ts        # ThemeStore (singleton)
│       │
│       └── i18n/
│           ├── index.svelte.ts    # I18nStore (singleton)
│           ├── types.ts           # MessageKey type
│           └── locales/
│               ├── en.ts          # English strings
│               └── da.ts          # Danish strings
│
├── .claude/
│   ├── settings.json              # Claude Code harness config
│   └── skills/
│       ├── svelte5-runes.md       # Rune patterns cheatsheet
│       ├── i18n-add-string.md     # Guide: add translated string
│       └── add-theme-color.md     # Guide: add theme color
│
├── vite.config.ts                 # Vite + PWA plugin
├── vitest.config.ts               # Test config
├── tsconfig.json
├── package.json
└── CLAUDE.md                       # This file
```

---

## Next Steps for New Features

1. **New stat field?** Update `src/lib/stats.ts` → update `computeStats()` → add i18n key → add tooltip in `StatsCard.svelte`
2. **New color?** Add CSS variable to `src/app.css` → use `var(--your-var)` in component
3. **New locale?** Duplicate `src/lib/i18n/locales/en.ts` → translate → update `I18nStore.setLocale()`
4. **New component?** Use `$state`, `$props`, `$derived`, and `$effect` patterns from above → write tests

---

_Last updated: 2026-05-16_
