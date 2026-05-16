<script lang="ts">
  import { store } from '$lib/store.svelte.ts';
  import { formatDuration } from '$lib/utils.ts';
  import { i18n } from '$lib/i18n/index.svelte.ts';
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
      <span class="labor-time" aria-label={i18n.t('topbar.laborDuration')}>
        {formatDuration(laborDuration)}
      </span>
    {:else}
      <span class="app-name">{i18n.t('app.name')}</span>
    {/if}
  </div>

  <div class="center">
    {#if store.contractions.length > 0}
      <span class="count-badge" aria-label={i18n.t('topbar.contractionCount').replace('{n}', String(store.contractions.length))}>
        {store.contractions.length}
      </span>
    {/if}
  </div>

  <div class="right">
    <button
      class="lang-btn"
      onclick={() => i18n.setLocale(i18n.locale === 'da' ? 'en' : 'da')}
      aria-label={i18n.t('topbar.languageToggle')}
      title={i18n.t('topbar.languageToggle')}
    >
      {i18n.locale === 'da' ? 'EN' : 'DA'}
    </button>
    <WakeLockIndicator active={wakeLockActive} />
    <button class="settings-btn" onclick={onsettings} aria-label={i18n.t('topbar.openSettings')}>
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

  .lang-btn {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-surface-2);
    min-height: 30px;
    transition: color 0.15s, background 0.15s;
  }

  .lang-btn:hover {
    color: var(--color-text);
    background: var(--color-surface-2);
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
