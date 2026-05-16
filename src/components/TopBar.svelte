<script lang="ts">
  import { store } from '$lib/store.svelte.ts';
  import { formatDuration } from '$lib/utils.ts';
  import WakeLockIndicator from './WakeLockIndicator.svelte';

  interface Props {
    onsettings: () => void;
    wakeLockActive: boolean;
  }
  let { onsettings, wakeLockActive }: Props = $props();

  let laborDuration = $state(0);

  $effect(() => {
    if (store.contractions.length === 0) {
      laborDuration = 0;
      return;
    }
    const firstStart = store.contractions[0]!.startedAt;
    laborDuration = Date.now() - firstStart;
    const id = setInterval(() => {
      laborDuration = Date.now() - firstStart;
    }, 1000);
    return () => clearInterval(id);
  });
</script>

<header class="topbar">
  <div class="left">
    {#if store.contractions.length > 0}
      <span class="labor-time" aria-label="Labor duration">
        {formatDuration(laborDuration)}
      </span>
    {:else}
      <span class="app-name">Contraction Timer</span>
    {/if}
  </div>

  <div class="center">
    {#if store.contractions.length > 0}
      <span class="count-badge" aria-label="{store.contractions.length} contractions">
        {store.contractions.length}
      </span>
    {/if}
  </div>

  <div class="right">
    <WakeLockIndicator active={wakeLockActive} />
    <button class="settings-btn" onclick={onsettings} aria-label="Open settings">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        ></path>
      </svg>
    </button>
  </div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    height: var(--header-height);
    background: var(--color-surface);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    gap: 0.5rem;
  }

  .left,
  .center,
  .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .center {
    justify-content: center;
  }

  .right {
    justify-content: flex-end;
  }

  .app-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .labor-time {
    font-size: 1.1rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
    font-family: monospace;
  }

  .count-badge {
    background: var(--color-accent);
    color: white;
    font-size: 0.85rem;
    font-weight: 700;
    min-width: 28px;
    height: 28px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
  }

  .settings-btn {
    color: var(--color-text-muted);
    padding: 0.4rem;
    border-radius: var(--radius-sm);
    transition: color 0.15s;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-btn:hover {
    color: var(--color-text);
    background: var(--color-surface-2);
  }
</style>
