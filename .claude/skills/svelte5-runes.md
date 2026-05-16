# Svelte 5 Runes Cheatsheet

Quick reference for rune patterns used in the contraction timer codebase.

---

## `$state` — Reactive State

### In `.svelte.ts` Files (Classes)

State declared in class properties becomes reactive:

```typescript
// src/lib/store.svelte.ts
export class ContractionStore {
  contractions = $state<Contraction[]>([]);
  lastStartTime = $state<number | null>(null);

  addContraction() {
    this.contractions.push({ id: '1', startTime: Date.now() });
    // Component re-renders automatically
  }
}

export const store = new ContractionStore();
```

**Key points:**

- Works in `.svelte.ts` files (Svelte preprocessor handles it)
- Creates getters/setters behind the scenes
- Changes trigger component re-renders
- Use for singleton stores (one instance, exported)

### In `.svelte` Component Scripts

Direct state in component:

```svelte
<script>
  let count = $state(0);
  let user = $state({ name: 'Alice', age: 30 });

  function increment() {
    count++; // Triggers re-render
  }

  function updateUser() {
    user.name = 'Bob'; // Object mutation works
    user = { ...user }; // Or reassign, both trigger update
  }
</script>

<p>Count: {count}</p>
<button onclick={increment}>+1</button>
```

**Key points:**

- `let` with `$state()` at top level in component
- Mutations and reassignments both work
- Changes re-render the component

### Typing `$state`

```typescript
// Simple type
let count = $state(0); // Inferred as number

// Explicit type
let items = $state<string[]>([]);

// Complex type
interface User {
  id: string;
  name: string;
  email: string;
}

let user = $state<User>({
  id: '1',
  name: 'Alice',
  email: 'alice@example.com',
});
```

---

## `$derived` — Computed Values

### Simple Expression

```svelte
<script>
  import { store } from '$lib/store.svelte';

  let stats = $derived(computeStats(store.contractions));
  let count = $derived(stats.count);
  let isEmpty = $derived(store.contractions.length === 0);
</script>

<p>Total contractions: {count}</p><p>Is empty: {isEmpty}</p>
```

**Key points:**

- Auto-tracks dependencies (here: `store.contractions`)
- Re-computes when dependencies change
- No manual dependency array needed
- Don't mutate state inside `$derived`

### Block Form: `$derived.by`

Use when you need multiple statements or complex logic:

```svelte
<script>
  let stats = $derived(computeStats(store.contractions));

  let summary = $derived.by(() => {
    if (stats.count === 0) return 'No contractions yet';
    if (stats.count === 1) return '1 contraction';
    return `${stats.count} contractions`;
  });

  let avgFormatted = $derived.by(() => {
    const avg = stats.avgDurationMins;
    return avg ? avg.toFixed(1) : '—';
  });
</script>

<p>{summary}</p><p>Average: {avgFormatted} min</p>
```

**Key points:**

- `.by()` takes a function
- Can contain multiple statements
- Useful for ternaries and formatting
- Still auto-tracks dependencies in the function body

### Comparison: `$derived` vs `$derived.by`

| Use Case            | `$derived`         | `$derived.by` |
| ------------------- | ------------------ | ------------- |
| Simple expression   | ✅ Yes             | ⚠️ Overkill   |
| Ternary             | ❌ No              | ✅ Yes        |
| Multiple statements | ❌ No              | ✅ Yes        |
| Formatting          | ❌ Multiple needed | ✅ One block  |

---

## `$effect` — Side Effects

### Basic Effect (Runs on Mount & Dependency Changes)

```svelte
<script>
  import { themeStore } from '$lib/theme.svelte';

  $effect(() => {
    // Set theme attribute whenever themeStore.theme changes
    document.documentElement.dataset.theme = themeStore.theme === 'auto' ? '' : themeStore.theme;
  });
</script>
```

### Effect with Cleanup

Always include cleanup if you add event listeners, timers, or subscriptions:

```svelte
<script>
  let popover = $state<HTMLDivElement | undefined>();

  $effect(() => {
    if (!popover) return; // Guard: only if element exists

    const showOnHover = () => popover?.showPopover?.();
    const hideOnLeave = () => popover?.hidePopover?.();

    popover.addEventListener('mouseenter', showOnHover);
    popover.addEventListener('mouseleave', hideOnLeave);

    // Cleanup function: remove listeners on unmount or before re-run
    return () => {
      popover?.removeEventListener('mouseenter', showOnHover);
      popover?.removeEventListener('mouseleave', hideOnLeave);
    };
  });
</script>

<div bind:this={popover} popover="auto">Content</div>
```

**Cleanup patterns:**

```typescript
// Timer cleanup
$effect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(timer);
});

// Subscription cleanup
$effect(() => {
  const unsubscribe = store.subscribe((value) => {
    console.log(value);
  });
  return unsubscribe;
});

// Element observer cleanup
$effect(() => {
  const observer = new ResizeObserver(() => {
    console.log('resized');
  });
  observer.observe(element);
  return () => observer.disconnect();
});
```

### Guarding Effects

Use explicit conditions to prevent unnecessary runs:

```svelte
<script>
  let user = $state<User | null>(null);

  $effect(() => {
    // Only log when user is loaded
    if (!user) return;

    console.log('User loaded:', user.name);
  });
</script>
```

### Load Data on Mount

```svelte
<script>
  import { store } from '$lib/store.svelte';

  $effect(() => {
    // Run once on mount (empty dependency list is implicit)
    store.loadFromStorage();
  });
</script>
```

---

## `$props` — Component Inputs

### Basic Props with TypeScript

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count: number;
    disabled?: boolean;
  }

  let { title, count, disabled = false }: Props = $props();
</script>

<div>
  <h2>{title}</h2>
  <p>Count: {count}</p>
  <button {disabled}>Click</button>
</div>
```

### Props with Callbacks

```svelte
<script lang="ts">
  interface Props {
    onAdd?: (value: number) => void;
    onDelete?: (id: string) => void;
  }

  let { onAdd, onDelete }: Props = $props();
</script>

<button onclick={() => onAdd?.(5)}>Add 5</button>
<button onclick={() => onDelete?.('item-1')}>Delete</button>
```

### Destructuring Props

When you destructure in the `$props()` call, those variables are automatically bindable:

```svelte
<script>
  // These are all bindable in parent:
  let { title, count, user }: Props = $props();
</script>
```

Parent can use `bind:count`, `bind:user`, etc.

---

## File Extensions: `.svelte.ts` vs `.ts`

### `.svelte.ts` — Svelte Code, Runes Allowed

Use for store classes and code that needs `$state`:

```typescript
// src/lib/store.svelte.ts (✅ correct)
export class ContractionStore {
  contractions = $state<Contraction[]>([]); // Works because .svelte.ts

  addContraction() {
    /* ... */
  }
}

// src/lib/theme.svelte.ts (✅ correct)
export class ThemeStore {
  theme = $state<'auto' | 'light' | 'dark'>('auto');
}

// src/lib/i18n/index.svelte.ts (✅ correct)
export class I18nStore {
  locale = $state<'en' | 'da'>('en');
}
```

**Why?** Svelte preprocessor transforms `$state` into getters/setters only in `.svelte.ts` files.

### `.ts` — Pure TypeScript, No Runes

Use for utility functions, pure functions, and types:

```typescript
// src/lib/stats.ts (✅ correct)
export function computeStats(contractions: Contraction[]): Stats {
  // Pure function, no $state needed
  return {
    /* ... */
  };
}

// src/lib/utils.ts (✅ correct)
export function formatDuration(seconds: number): string {
  // Utility function, no $state
  return '12:34:56';
}

// src/lib/types.ts (✅ correct)
export interface Contraction {
  id: string;
  startTime: number;
  endTime?: number;
}
```

### In Components: Always `.svelte`

```svelte
<!-- src/components/BigButton.svelte (✅ correct) -->
<script>
  let count = $state(0); // $state works in .svelte component scripts
</script>
```

### Common Mistakes

```typescript
// ❌ WRONG: .ts file cannot use $state
// src/lib/utils.ts
export let globalCount = $state(0);  // Error!

// ❌ WRONG: .svelte file named wrong
<!-- src/components/Button.ts (should be .svelte) -->

// ✅ CORRECT: Use .svelte.ts for store classes
// src/lib/store.svelte.ts
export class MyStore {
  value = $state(0);
}

// ✅ CORRECT: Use .svelte for component files
<!-- src/components/Button.svelte -->
<script>
  let value = $state(0);
</script>
```

---

## `bind:this` — DOM References

### Getting Element Reference

```svelte
<script>
  let popover = $state<HTMLDivElement | undefined>();

  function show() {
    popover?.showPopover();
  }
</script>

<div bind:this={popover} popover="auto">Popover content</div>

<button onclick={show}>Show Popover</button>
```

**Key points:**

- `bind:this={variable}` assigns DOM element to variable
- Type: `HTMLDivElement`, `HTMLButtonElement`, etc.
- Use `$state` to hold reference
- Check for existence before calling methods

### Common Uses in This Codebase

**InfoTooltip.svelte** — Show/hide popover on hover:

```svelte
<script>
  let popover = $state<HTMLDivElement | undefined>();

  $effect(() => {
    popover?.addEventListener('mouseenter', () => popover?.showPopover());
    popover?.addEventListener('mouseleave', () => popover?.hidePopover());

    return () => {
      popover?.removeEventListener('mouseenter' /* ... */);
      popover?.removeEventListener('mouseleave' /* ... */);
    };
  });
</script>

<div bind:this={popover} popover="auto">
  {children}
</div>
```

---

## Reactive Class Instances (Store Pattern)

### Why Classes as Stores?

Svelte 5 allows class properties with `$state`, enabling encapsulation and methods:

```typescript
// src/lib/store.svelte.ts
export class ContractionStore {
  contractions = $state<Contraction[]>([]);

  addContraction() {
    this.contractions.push({
      id: crypto.randomUUID(),
      startTime: Date.now(),
    });
    this.saveToStorage(); // Call methods
  }

  deleteContraction(id: string) {
    this.contractions = this.contractions.filter((c) => c.id !== id);
    this.saveToStorage();
  }

  private saveToStorage() {
    // Private helper method
  }
}

export const store = new ContractionStore();
```

### Using Reactive Class Instances

```svelte
<script>
  import { store } from '$lib/store.svelte';
</script>

<!-- Reactivity works because store.contractions is $state -->
{#each store.contractions as item (item.id)}
  <div>{item.startTime}</div>
{/each}

<!-- Call methods, updates automatically -->
<button onclick={() => store.addContraction()}> Add Contraction </button>

<button onclick={() => store.deleteContraction(id)}> Delete </button>
```

**Why this pattern?**

- Encapsulation: Methods control state mutations
- Singleton: One instance shared across app
- Reactive: Changes to `$state` properties trigger re-renders
- Persistence: Methods can load/save to localStorage

### Example: ThemeStore

```typescript
// src/lib/theme.svelte.ts
export class ThemeStore {
  theme = $state<'auto' | 'light' | 'dark'>('auto');

  constructor() {
    const saved = localStorage.getItem('contraction-timer:theme');
    if (saved === 'auto' || saved === 'light' || saved === 'dark') {
      this.theme = saved;
    }
  }

  setTheme(newTheme: 'auto' | 'light' | 'dark') {
    this.theme = newTheme;
    localStorage.setItem('contraction-timer:theme', newTheme);
  }

  getEffectiveTheme(): 'light' | 'dark' {
    if (this.theme !== 'auto') return this.theme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}

export const themeStore = new ThemeStore();
```

---

## Debugging Runes

### Log Reactive Values

```svelte
<script>
  let count = $state(0);

  $effect(() => {
    console.log('count changed:', count); // Logs whenever count changes
  });
</script>
```

### Inspect Derived Values

```svelte
<script>
  let items = $state(['a', 'b', 'c']);

  let uppercased = $derived.by(() => {
    const result = items.map((x) => x.toUpperCase());
    console.log('derived uppercased:', result);
    return result;
  });
</script>
```

### Check Effect Cleanup

```svelte
<script>
  $effect(() => {
    console.log('Effect running');
    return () => {
      console.log('Cleanup running'); // Should log when component unmounts
    };
  });
</script>
```

---

## Quick Reference Table

| Rune          | Purpose                  | Location                                   | Example                                    |
| ------------- | ------------------------ | ------------------------------------------ | ------------------------------------------ |
| `$state`      | Reactive state           | `.svelte.ts` classes, `.svelte` components | `let count = $state(0)`                    |
| `$derived`    | Computed value (simple)  | `.svelte` components                       | `let doubled = $derived(count * 2)`        |
| `$derived.by` | Computed value (complex) | `.svelte` components                       | `let message = $derived.by(() => { ... })` |
| `$effect`     | Side effect              | `.svelte` components                       | `$effect(() => { ... })`                   |
| `$props`      | Component inputs         | `.svelte` components                       | `let { title } = $props()`                 |
| `bind:this`   | DOM reference            | `.svelte` components                       | `let elem = $state(); bind:this={elem}`    |

---

_Reference for contraction-timer codebase patterns_
