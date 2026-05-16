# How to Add a Theme-Aware CSS Color

Step-by-step guide for adding a new CSS variable that respects light/dark theme in the contraction timer app.

---

## Overview

The contraction timer uses CSS custom properties (variables) for theming:

- **Dark theme (default):** `:root` block in `src/app.css`
- **Light theme:** `[data-theme='light']` block in `src/app.css`
- **Auto mode (respects system):** `@media (prefers-color-scheme: light)` block in `src/app.css`
- **Applied at runtime:** `App.svelte` sets `data-theme` attribute on `<html>` via `$effect`
- **Persistent:** Theme choice saved to localStorage

---

## Step 1: Define Variables in `src/app.css`

Edit `src/app.css` and add your CSS variable to all three theme blocks.

### Add to Dark Theme (`:root`)

```css
:root {
  /* Existing dark theme variables */
  --color-bg: #0f0f0f;
  --color-text: #ffffff;
  
  /* ← Add your new variable here with dark value */
  --color-button-hover: #2a2a2a;
}
```

### Add to Light Theme (`[data-theme='light']`)

```css
[data-theme='light'] {
  /* Existing light theme variables */
  --color-bg: #ffffff;
  --color-text: #000000;
  
  /* ← Add your new variable here with light value */
  --color-button-hover: #e8e8e8;
}
```

### Add to Auto Mode (`@media`)

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* Existing auto mode variables (same as light) */
    --color-bg: #ffffff;
    --color-text: #000000;
    
    /* ← Add your new variable here (same as light value) */
    --color-button-hover: #e8e8e8;
  }
}
```

**Three-step checklist:**
1. Add to `:root` with dark value
2. Add to `[data-theme='light']` with light value
3. Add to `@media (prefers-color-scheme: light)` with light value (same as step 2)

---

## Step 2: Use in Component Styles

Import the variable using `var()` in your component:

```svelte
<!-- src/components/Button.svelte -->
<script>
  // ... component logic
</script>

<button>Click me</button>

<style>
  button {
    background-color: var(--color-button-hover);
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  button:hover {
    opacity: 0.9;
  }
</style>
```

**Important:** Always use `var(--variable-name)`, never hardcode colors.

---

## Step 3: Test All Themes

Test your color in all three theme modes:

### Test Dark Theme
1. Run `npm run dev`
2. Open Settings (⚙️ icon in TopBar)
3. Set Theme → **Dark**
4. Verify your component shows the dark color value
5. Reload page → color persists

### Test Light Theme
1. Settings → Theme → **Light**
2. Verify your component shows the light color value
3. Reload page → color persists

### Test Auto Mode
1. Settings → Theme → **Auto**
2. If your system prefers light: should show light color
3. If your system prefers dark: should show dark color
4. Reload page → respects system preference

---

## Example: Adding a Button Highlight Color

**Goal:** Add a highlight color for active buttons that looks good in both themes.

### Step 1: Add to `src/app.css`

```css
:root {
  /* Dark theme */
  --color-button-active: #4a9eff;  /* Bright blue for dark background */
}

[data-theme='light'] {
  /* Light theme */
  --color-button-active: #0066cc;  /* Darker blue for light background */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* Auto mode (system light preference) */
    --color-button-active: #0066cc;  /* Same as light */
  }
}
```

### Step 2: Use in component

```svelte
<!-- src/components/StatsCard.svelte -->
<style>
  .stat-box {
    padding: 1rem;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
  }
  
  .stat-box.active {
    border-color: var(--color-button-active);
    box-shadow: 0 0 8px var(--color-button-active);
  }
</style>
```

### Step 3: Test

1. Switch theme → verify border and shadow colors change
2. Toggle between Dark, Light, and Auto → colors update correctly
3. Reload page → theme persists

---

## Common CSS Variable Patterns

### Color with Opacity

```css
:root {
  --color-overlay-dark: rgba(0, 0, 0, 0.5);
}

[data-theme='light'] {
  --color-overlay-dark: rgba(0, 0, 0, 0.1);  /* Lighter overlay in light theme */
}
```

### Gradient Colors

```css
:root {
  --gradient-bg: linear-gradient(135deg, #1a1a1a, #2a2a2a);
}

[data-theme='light'] {
  --gradient-bg: linear-gradient(135deg, #f5f5f5, #e8e8e8);
}
```

### Border Colors

```css
:root {
  --color-border: #333333;
}

[data-theme='light'] {
  --color-border: #d0d0d0;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-border: #d0d0d0;
  }
}
```

### Text Colors

```css
:root {
  --color-text-muted: #999999;  /* Gray for dark background */
}

[data-theme='light'] {
  --color-text-muted: #666666;  /* Darker gray for light background */
}
```

---

## Naming Convention

Use a consistent naming pattern for variables:

```css
:root {
  /* Background colors */
  --color-bg: #0f0f0f;
  --color-bg-secondary: #1a1a1a;
  
  /* Text colors */
  --color-text: #ffffff;
  --color-text-muted: #999999;
  
  /* Border colors */
  --color-border: #333333;
  
  /* Component-specific */
  --color-button-bg: #1a1a1a;
  --color-button-hover: #2a2a2a;
  --color-button-active: #4a9eff;
  
  /* Status colors */
  --color-success: #00cc00;
  --color-error: #ff4444;
  --color-warning: #ffaa00;
}
```

**Recommended prefixes:**
- `--color-bg-*` — background colors
- `--color-text-*` — text colors
- `--color-border-*` — border colors
- `--color-button-*` — button-specific colors
- `--color-*` — status/semantic colors

---

## How Theming Works (Behind the Scenes)

### 1. App.svelte Sets Theme Attribute

```svelte
<!-- src/App.svelte -->
<script>
  import { themeStore } from '$lib/theme.svelte';
  
  $effect(() => {
    // When theme changes, update HTML attribute
    document.documentElement.dataset.theme = 
      themeStore.theme === 'auto' ? '' : themeStore.theme;
  });
</script>

<html data-theme="dark">  <!-- Or: data-theme="light" or no attribute for auto -->
  ...
</html>
```

### 2. CSS Cascades Based on Attribute

```css
/* If data-theme="dark" (or default) */
:root {
  --color-bg: #0f0f0f;  /* ← Applied */
}

[data-theme='light'] {
  --color-bg: #ffffff;  /* ← Not applied */
}

/* If data-theme="light" */
[data-theme='light'] {
  --color-bg: #ffffff;  /* ← Applied (overrides :root) */
}

/* If data-theme not set (auto mode), browser checks system preference */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-bg: #ffffff;  /* ← Applied if system prefers light */
  }
}
```

### 3. Components Use Variables

```svelte
<style>
  div {
    background-color: var(--color-bg);  /* Browser resolves to current value */
  }
</style>
```

---

## Avoiding Common Mistakes

### ❌ Hardcoding colors instead of using variables

```css
/* WRONG: Color won't change with theme */
button {
  background-color: #1a1a1a;
}
```

**Fix:** Use CSS variable:

```css
/* RIGHT: Color changes with theme */
button {
  background-color: var(--color-button-bg);
}
```

### ❌ Only adding to dark theme

```css
:root {
  --color-button-bg: #1a1a1a;  /* Added here */
}

[data-theme='light'] {
  /* Missing the variable! */
}
```

**Result:** In light theme, button will use dark value (looks wrong).

**Fix:** Add to all three blocks:

```css
:root {
  --color-button-bg: #1a1a1a;
}

[data-theme='light'] {
  --color-button-bg: #f0f0f0;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-button-bg: #f0f0f0;
  }
}
```

### ❌ Forgetting media query block for auto mode

```css
:root {
  --color-button-bg: #1a1a1a;
}

[data-theme='light'] {
  --color-button-bg: #f0f0f0;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* Missing --color-button-bg! */
  }
}
```

**Result:** Auto mode doesn't follow system preference.

**Fix:** Add the variable to the media query block.

### ❌ Using wrong selector in media query

```css
/* WRONG: This applies when system prefers dark (opposite of what we want) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-button-bg: #f0f0f0;  /* Light value in dark preference? */
  }
}
```

**Fix:** Use `(prefers-color-scheme: light)`:

```css
/* RIGHT: This applies when system prefers light */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-button-bg: #f0f0f0;  /* Light value */
  }
}
```

---

## Checklist

When adding a new theme-aware color, verify:

- [ ] Variable added to `:root` block with dark value
- [ ] Variable added to `[data-theme='light']` block with light value
- [ ] Variable added to `@media (prefers-color-scheme: light)` block (same as light value)
- [ ] Using `var(--your-variable)` in component styles (not hardcoded colors)
- [ ] Tested in Dark theme → color shows dark value
- [ ] Tested in Light theme → color shows light value
- [ ] Tested in Auto mode → color respects system preference
- [ ] Color persists after page reload
- [ ] Variable name follows naming convention (e.g., `--color-button-bg`)

---

## File Location

```
src/app.css  ← Edit this file
```

All theme variables are defined in this single file:

```css
:root { /* Dark theme defaults */ }
[data-theme='light'] { /* Light theme overrides */ }
@media (prefers-color-scheme: light) { /* Auto mode with system light preference */ }
```

---

## Quick Reference

### Dark Theme Block

```css
:root {
  --color-new-variable: #dark-color-value;
}
```

### Light Theme Block

```css
[data-theme='light'] {
  --color-new-variable: #light-color-value;
}
```

### Auto Mode Block

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-new-variable: #light-color-value;  /* Same as light */
  }
}
```

### In Component

```svelte
<style>
  element {
    color: var(--color-new-variable);
  }
</style>
```

---

*Reference for contraction-timer codebase*
