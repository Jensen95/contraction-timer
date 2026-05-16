# How to Add a Translated String

Step-by-step guide for adding a new i18n string to the contraction timer app.

---

## Overview

The contraction timer uses a custom i18n system with no external library:

- **Source of truth:** `src/lib/i18n/locales/en.ts` (English)
- **Translation:** `src/lib/i18n/locales/da.ts` (Danish)
- **Type safety:** `src/lib/i18n/types.ts` enforces all keys exist in both locales
- **Usage:** `i18n.t('key')` in component templates
- **Persistence:** Locale choice saved to localStorage

---

## Step 1: Add English String

Edit `src/lib/i18n/locales/en.ts` and add your key-value pair:

```typescript
// src/lib/i18n/locales/en.ts

export const en: Record<MessageKey, string> = {
  // ... existing strings
  'common.startContraction': 'Start Contraction',
  'stats.laborDuration': 'Labor Duration',
  'your.new.key': 'Your English text here',  // ← Add here
};
```

**Naming convention:** Use dot notation (kebab-case) for organization:
- `common.*` — general UI strings (buttons, labels)
- `stats.*` — statistics labels and descriptions
- `modal.*` — modal titles and messages
- `error.*` — error messages
- `tooltip.*` — tooltip content

---

## Step 2: Add Danish String

Edit `src/lib/i18n/locales/da.ts` and add the **same key** with Danish translation:

```typescript
// src/lib/i18n/locales/da.ts

export const da: Record<MessageKey, string> = {
  // ... existing strings
  'common.startContraction': 'Start Sammentrækning',
  'stats.laborDuration': 'Arbejdsvarighed',
  'your.new.key': 'Din danske tekst her',  // ← Add here
};
```

**Must match:** The key must be identical to the English version.

---

## Step 3: Update MessageKey Type

Edit `src/lib/i18n/types.ts` to add your new key to the `MessageKey` union type:

```typescript
// src/lib/i18n/types.ts

export type MessageKey =
  | 'common.startContraction'
  | 'common.clearData'
  | 'stats.laborDuration'
  | 'stats.avgDuration'
  | 'your.new.key'  // ← Add here
  | /* ... rest of keys */;
```

**Why?** This ensures TypeScript will error if:
1. You use `i18n.t()` with a key that doesn't exist
2. You forget to add the key to either `en.ts` or `da.ts`

---

## Step 4: Use in Component

Import `i18n` and call `i18n.t('your.new.key')` in your template:

```svelte
<!-- src/components/MyComponent.svelte -->
<script>
  import { i18n } from '$lib/i18n';
</script>

<h1>{i18n.t('your.new.key')}</h1>

<button>{i18n.t('common.startContraction')}</button>
```

**Important:** Use `i18n.t()` in templates, not scripts (for reactivity).

---

## Step 5: Verify Everything Works

Run TypeScript check to ensure both locales have all keys:

```bash
npm run check
```

**Expected output:**
```
✓ 0 errors in 1234ms
✓ SvelteKit compiler validation
```

If you get TypeScript errors, check that:
- Key is spelled identically in `en.ts` and `da.ts`
- Key is added to `MessageKey` type in `types.ts`
- No typos in the key string

---

## Example: Adding a New Stat Label

**Goal:** Add a tooltip for a new stat field.

### 1. Add English string

```typescript
// src/lib/i18n/locales/en.ts
export const en = {
  // ... existing
  'stats.estimatedTimeLeft': 'Estimated Time Remaining',
  'tooltip.estimatedTimeLeft': 'Based on current contraction pattern',
};
```

### 2. Add Danish string

```typescript
// src/lib/i18n/locales/da.ts
export const da = {
  // ... existing
  'stats.estimatedTimeLeft': 'Estimeret Tid Tilbage',
  'tooltip.estimatedTimeLeft': 'Baseret på nuværende sammentræknings mønster',
};
```

### 3. Update type

```typescript
// src/lib/i18n/types.ts
export type MessageKey =
  | /* ... existing keys */
  | 'stats.estimatedTimeLeft'
  | 'tooltip.estimatedTimeLeft';
```

### 4. Use in component

```svelte
<!-- src/components/StatsCard.svelte -->
<script>
  import { i18n } from '$lib/i18n';
  import InfoTooltip from './InfoTooltip.svelte';
</script>

<InfoTooltip>
  <span slot="label">{i18n.t('stats.estimatedTimeLeft')}</span>
  <span slot="content">{i18n.t('tooltip.estimatedTimeLeft')}</span>
</InfoTooltip>
```

### 5. Verify

```bash
npm run check
```

---

## Handling Strings with Variables

For strings that need dynamic content, use `.replace()`:

### 1. Add string with placeholder

```typescript
// src/lib/i18n/locales/en.ts
export const en = {
  'message.contractionDuration': 'Contraction lasted {duration}',
};

// src/lib/i18n/locales/da.ts
export const da = {
  'message.contractionDuration': 'Sammentrækningen varede {duration}',
};
```

### 2. Use with `.replace()`

```svelte
<script>
  import { i18n } from '$lib/i18n';
  
  let duration = '2 minutes';
</script>

<p>
  {i18n.t('message.contractionDuration').replace('{duration}', duration)}
</p>

<!-- Output: "Contraction lasted 2 minutes" (in English) -->
<!-- Output: "Sammentrækningen varede 2 minutes" (in Danish) -->
```

### Multiple Variables

```typescript
// src/lib/i18n/locales/en.ts
export const en = {
  'message.timeRemaining': '{hours} hours and {minutes} minutes remaining',
};

// Usage:
i18n.t('message.timeRemaining')
  .replace('{hours}', '2')
  .replace('{minutes}', '30')
// Output: "2 hours and 30 minutes remaining"
```

---

## Common Mistakes

### ❌ Forgetting the Danish key

```typescript
// WRONG: en.ts has the key, but da.ts doesn't
// src/lib/i18n/locales/en.ts
export const en = {
  'new.key': 'New string',
};

// src/lib/i18n/locales/da.ts
export const da = {
  // Missing 'new.key' here!
};
```

**Result:** TypeScript error when you run `npm run check`.

**Fix:** Add the key to both files.

### ❌ Mismatched keys

```typescript
// WRONG: Different keys in en.ts and da.ts
// src/lib/i18n/locales/en.ts
export const en = {
  'button.submit': 'Submit',
};

// src/lib/i18n/locales/da.ts
export const da = {
  'button.submitForm': 'Indsend',  // Different key name!
};
```

**Result:** TypeScript error.

**Fix:** Use identical keys in both files.

### ❌ Not updating MessageKey type

```typescript
// WRONG: Added to locales but not the type
// src/lib/i18n/locales/en.ts
export const en = {
  'new.key': 'New string',
};

// src/lib/i18n/types.ts
export type MessageKey = 'other.key';  // Missing 'new.key'!
```

**Result:** TypeScript error when using `i18n.t('new.key')`.

**Fix:** Always update the type.

### ❌ Using in component script instead of template

```svelte
<!-- WRONG: Less reactive -->
<script>
  import { i18n } from '$lib/i18n';
  
  const message = i18n.t('key');  // Evaluated once, not reactive
</script>

<p>{message}</p>  <!-- Won't update when locale changes -->
```

**Result:** If user switches language, component doesn't re-render the string.

**Fix:** Use in template:

```svelte
<!-- RIGHT: Reactive -->
<p>{i18n.t('key')}</p>  <!-- Updates when locale changes -->
```

---

## Testing i18n Strings

### Manual Testing

1. Add your string following the steps above
2. Run `npm run check` to verify TypeScript
3. Run `npm run dev` and test the app
4. Switch language (EN ↔ DA) in TopBar and verify string appears in both languages

### Automated Testing (Optional)

```typescript
// src/lib/i18n/i18n.test.ts
import { describe, it, expect } from 'vitest';
import { en } from './locales/en';
import { da } from './locales/da';

describe('i18n locales', () => {
  it('all keys in English also exist in Danish', () => {
    const enKeys = Object.keys(en);
    const daKeys = Object.keys(da);
    
    enKeys.forEach(key => {
      expect(daKeys).toContain(key);
    });
  });
});
```

---

## File Locations

```
src/lib/i18n/
├── index.svelte.ts      # I18nStore (singleton)
├── types.ts             # MessageKey type ← EDIT THIS
└── locales/
    ├── en.ts            # English strings ← EDIT THIS
    └── da.ts            # Danish strings ← EDIT THIS
```

---

## Checklist

When adding a new string, verify:

- [ ] Key added to `src/lib/i18n/locales/en.ts`
- [ ] Key added to `src/lib/i18n/locales/da.ts` (same key name)
- [ ] Key added to `MessageKey` type in `src/lib/i18n/types.ts`
- [ ] Using `i18n.t('key')` in component template (not script)
- [ ] `npm run check` passes with no errors
- [ ] Manually tested in EN and DA locales
- [ ] If string has variables, using `.replace()` correctly

---

## Quick Reference

### File: `src/lib/i18n/locales/en.ts`

```typescript
export const en: Record<MessageKey, string> = {
  'your.new.key': 'Your English text',
};
```

### File: `src/lib/i18n/locales/da.ts`

```typescript
export const da: Record<MessageKey, string> = {
  'your.new.key': 'Din danske tekst',
};
```

### File: `src/lib/i18n/types.ts`

```typescript
export type MessageKey =
  | 'your.new.key'
  | /* ... rest */;
```

### In Component

```svelte
<script>
  import { i18n } from '$lib/i18n';
</script>

<p>{i18n.t('your.new.key')}</p>
```

---

*Reference for contraction-timer codebase*
