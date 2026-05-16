<script lang="ts">
  import { store } from '$lib/store.svelte.ts';
  import { formatDuration } from '$lib/utils.ts';
  import StillGoingBanner from './StillGoingBanner.svelte';

  let elapsed = $state(0);
  let restingFor = $state(0);

  $effect(() => {
    if (store.phase === 'active' && store.lastContraction) {
      const startedAt = store.lastContraction.startedAt;
      elapsed = Date.now() - startedAt;
      restingFor = 0;
      const id = setInterval(() => {
        elapsed = Date.now() - startedAt;
      }, 100);
      return () => clearInterval(id);
    } else if (store.phase === 'resting' && store.lastContraction?.endedAt) {
      const endedAt = store.lastContraction.endedAt;
      elapsed = 0;
      restingFor = Date.now() - endedAt;
      const id = setInterval(() => {
        restingFor = Date.now() - endedAt;
      }, 1000);
      return () => clearInterval(id);
    } else {
      elapsed = 0;
      restingFor = 0;
    }
  });

  function handleTap() {
    if (store.phase === 'active') {
      store.endContraction();
    } else {
      store.startContraction();
    }
  }
</script>

<div class="button-area">
  <button
    class="big-button"
    class:is-active={store.phase === 'active'}
    onclick={handleTap}
    aria-label={store.phase === 'active' ? 'End contraction' : 'Start contraction'}
    aria-pressed={store.phase === 'active'}
  >
    <span class="btn-label">
      {store.phase === 'active' ? 'End Contraction' : 'Start Contraction'}
    </span>

    {#if store.phase === 'active'}
      <span class="elapsed" aria-live="polite" aria-atomic="true">
        {formatDuration(elapsed)}
      </span>
      <span class="hint">tap when it ends</span>
    {:else if store.phase === 'resting'}
      <span class="hint">
        {restingFor > 0 ? `${formatDuration(restingFor)} since last` : 'tap when next starts'}
      </span>
    {:else}
      <span class="hint">tap when a contraction begins</span>
    {/if}
  </button>

  <StillGoingBanner {elapsed} />

  {#if store.contractions.length > 0}
    <button class="undo-btn" onclick={() => store.undo()} aria-label="Undo last action">
      ↩ Undo last
    </button>
  {/if}
</div>

<style>
  .button-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
  }

  .big-button {
    width: 100%;
    min-height: 50dvh;
    background: linear-gradient(135deg, var(--color-start) 0%, var(--color-start-dark) 100%);
    color: white;
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    transition:
      background 0.2s ease,
      transform 0.1s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    touch-action: manipulation;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .big-button:active {
    transform: scale(0.98);
  }

  .big-button.is-active {
    background: linear-gradient(135deg, var(--color-active) 0%, var(--color-active-dark) 100%);
  }

  .btn-label {
    font-size: clamp(1.75rem, 6vw, 2.5rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    text-align: center;
  }

  .elapsed {
    font-size: clamp(2.5rem, 10vw, 4rem);
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    font-family: monospace;
    letter-spacing: 0.02em;
  }

  .hint {
    font-size: 1rem;
    opacity: 0.85;
    text-align: center;
  }

  .undo-btn {
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    padding: 0.6rem 1.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    min-height: 44px;
    transition: background 0.15s;
  }

  .undo-btn:hover,
  .undo-btn:active {
    background: var(--color-surface);
    color: var(--color-text);
  }
</style>
