<script lang="ts">
  import { onMount } from 'svelte';
  import TopBar from './components/TopBar.svelte';
  import BigButton from './components/BigButton.svelte';
  import StatsCard from './components/StatsCard.svelte';
  import Timeline from './components/Timeline.svelte';
  import ContractionLog from './components/ContractionLog.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import EditModal from './components/EditModal.svelte';
  import { store } from '$lib/store.svelte.ts';
  import { initServiceWorker } from '$lib/sw-registration.ts';
  import type { Contraction } from '$lib/types.ts';
  import { themeStore } from '$lib/theme.svelte.ts';

  // Wake lock
  let wakeLock = $state<WakeLockSentinel | null>(null);

  $effect(() => {
    if (store.phase === 'active') {
      navigator.wakeLock
        ?.request('screen')
        .then((lock) => {
          wakeLock = lock;
        })
        .catch(() => {});
    } else {
      wakeLock?.release().catch(() => {});
      wakeLock = null;
    }
  });

  $effect(() => {
    const reacquire = async () => {
      if (document.visibilityState === 'visible' && store.phase === 'active' && !wakeLock) {
        wakeLock = (await navigator.wakeLock?.request('screen').catch(() => null)) ?? null;
      }
    };
    document.addEventListener('visibilitychange', reacquire);
    return () => document.removeEventListener('visibilitychange', reacquire);
  });

  // Apply theme to <html> element
  $effect(() => {
    const el = document.documentElement;
    if (themeStore.theme === 'auto') {
      el.removeAttribute('data-theme');
    } else {
      el.setAttribute('data-theme', themeStore.theme);
    }
  });

  // Stale active contraction detection
  let staleContraction = $state<{ id: string; startedAt: number } | null>(null);

  onMount(() => {
    const last =
      store.contractions.length > 0 ? store.contractions[store.contractions.length - 1]! : null;
    if (last && last.endedAt === null && Date.now() - last.startedAt > 10 * 60 * 1000) {
      staleContraction = { id: last.id, startedAt: last.startedAt };
    }
    initServiceWorker();
  });

  function autoShow(node: HTMLDialogElement) {
    node.showModal();
    return {
      destroy() {
        node.close();
      },
    };
  }

  let showSettings = $state(false);

  let editContractionId = $state<string | null>(null);
  const editingContraction = $derived<Contraction | null>(
    editContractionId !== null
      ? (store.contractions.find((c) => c.id === editContractionId) ?? null)
      : null,
  );
</script>

<div class="app">
  <TopBar onsettings={() => (showSettings = true)} wakeLockActive={wakeLock !== null} />

  <main class="main-content">
    <BigButton />

    {#if store.contractions.length >= 2}
      <StatsCard />
      <Timeline />
    {/if}

    {#if store.contractions.length > 0}
      <ContractionLog onedit={(id) => (editContractionId = id)} />
    {/if}
  </main>
</div>

{#if staleContraction}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <dialog use:autoShow aria-labelledby="stale-title">
    <h2 id="stale-title">Active contraction found</h2>
    <p class="stale-desc">
      There was an active contraction running when you last closed this app. What would you like to
      do?
    </p>
    <div class="stale-actions">
      <button
        class="btn-primary"
        onclick={() => {
          store.updateContraction(staleContraction!.id, { endedAt: Date.now() });
          staleContraction = null;
        }}
      >
        End it now
      </button>
      <button
        class="btn-secondary"
        onclick={() => {
          store.removeContraction(staleContraction!.id);
          staleContraction = null;
        }}
      >
        Discard it
      </button>
      <button class="btn-secondary" onclick={() => (staleContraction = null)}>
        Keep it open
      </button>
    </div>
  </dialog>
{/if}

{#if showSettings}
  <SettingsPanel onclose={() => (showSettings = false)} />
{/if}

{#if editContractionId !== null && editingContraction !== null}
  <EditModal
    contraction={editingContraction}
    onclose={() => (editContractionId = null)}
    onsave={(patch) => {
      store.updateContraction(editContractionId!, patch);
      editContractionId = null;
    }}
    ondelete={() => {
      store.removeContraction(editContractionId!);
      editContractionId = null;
    }}
  />
{/if}

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
  }

  dialog {
    max-width: min(440px, 92vw);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  dialog h2 {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .stale-desc {
    color: var(--color-text-muted);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .stale-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn-primary {
    background: var(--color-accent);
    color: white;
    padding: 0.8rem;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-weight: 600;
    min-height: 48px;
    transition: opacity 0.15s;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-secondary {
    background: var(--color-surface-2);
    color: var(--color-text);
    padding: 0.8rem;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    min-height: 44px;
    transition: background 0.15s;
  }

  .btn-secondary:hover {
    background: var(--color-surface);
  }
</style>
