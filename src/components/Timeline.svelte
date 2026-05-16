<script lang="ts">
  import { store } from '$lib/store.svelte.ts';

  const WINDOW_MS = 60 * 60 * 1000;

  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => {
      now = Date.now();
    }, 1000);
    return () => clearInterval(id);
  });

  const windowStart = $derived(now - WINDOW_MS);

  const bars = $derived.by(() => {
    return store.contractions
      .filter((c) => {
        const end = c.endedAt ?? now;
        return end >= windowStart;
      })
      .map((c) => {
        const start = Math.max(c.startedAt, windowStart);
        const end = c.endedAt ?? now;
        const left = ((start - windowStart) / WINDOW_MS) * 100;
        const width = Math.max(((end - start) / WINDOW_MS) * 100, 0.5);
        return {
          id: c.id,
          left,
          width,
          isActive: c.endedAt === null,
        };
      });
  });
</script>

{#if store.contractions.length > 0}
  <section class="timeline" aria-label="Contraction timeline — last 60 minutes">
    <h3 class="title">Last 60 min</h3>

    <div class="track" role="img" aria-label="{bars.length} contractions in the last hour">
      {#each bars as bar (bar.id)}
        <div
          class="bar"
          class:is-active={bar.isActive}
          style="left: {bar.left}%; width: {bar.width}%"
          role="presentation"
        ></div>
      {/each}
      {#if bars.length === 0}
        <span class="empty">No contractions in the last hour</span>
      {/if}
    </div>

    <div class="labels">
      <span>60 min ago</span>
      <span>Now</span>
    </div>
  </section>
{/if}

<style>
  .timeline {
    background: var(--color-surface);
    border-radius: var(--radius);
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
  }

  .track {
    position: relative;
    height: 48px;
    background: var(--color-surface-2);
    border-radius: 6px;
    overflow: hidden;
  }

  .bar {
    position: absolute;
    top: 0;
    height: 100%;
    background: var(--color-start);
    border-radius: 3px;
    opacity: 0.9;
    transition: width 1s linear;
  }

  .bar.is-active {
    background: var(--color-active);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.9;
    }
    50% {
      opacity: 0.6;
    }
  }

  .empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
</style>
