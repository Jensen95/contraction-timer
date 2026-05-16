<script lang="ts">
  import { store } from '$lib/store.svelte.ts';
  import { formatDuration, formatIntervalMins, formatTime } from '$lib/utils.ts';
  import { i18n } from '$lib/i18n/index.svelte.ts';
  import InfoTooltip from './InfoTooltip.svelte';

  const laborDuration = $derived.by(() => {
    if (!store.stats.firstContractionAt) return null;
    return Date.now() - store.stats.firstContractionAt;
  });

  const avgIntervalLabel = $derived(
    store.stats.avgIntervalMs !== null
      ? `${formatIntervalMins(store.stats.avgIntervalMs)} apart`
      : '—',
  );

  const avgDurationLabel = $derived(
    store.stats.avgDurationMs !== null
      ? `${Math.round(store.stats.avgDurationMs / 1000)}s avg`
      : '—',
  );
</script>

<section class="stats-card" aria-label={i18n.t('stats.title')}>
  <h2 class="title">{i18n.t('stats.title')}</h2>

  <div class="stats-grid">
    <div class="stat">
      <span class="stat-value">{store.stats.windowCount}</span>
      <span class="stat-label">
        {i18n.t('stats.contractions')}
        <InfoTooltip text={i18n.t('tooltip.contractions')} />
      </span>
    </div>

    <div class="stat">
      <span class="stat-value">{avgIntervalLabel}</span>
      <span class="stat-label">
        {i18n.t('stats.avgInterval')}
        <InfoTooltip text={i18n.t('tooltip.avgInterval')} />
      </span>
    </div>

    <div class="stat">
      <span class="stat-value">{avgDurationLabel}</span>
      <span class="stat-label">
        {i18n.t('stats.avgDuration')}
        <InfoTooltip text={i18n.t('tooltip.avgDuration')} />
      </span>
    </div>

    {#if laborDuration !== null}
      <div class="stat">
        <span class="stat-value">{formatDuration(laborDuration)}</span>
        <span class="stat-label">
          {i18n.t('stats.laborTime')}
          <InfoTooltip text={i18n.t('tooltip.laborTime')} />
        </span>
      </div>
    {/if}
  </div>

  <div class="rule-511" class:is-met={store.stats.is511} class:is-unmet={!store.stats.is511}>
    {#if store.stats.is511}
      <span class="rule-icon">✓</span>
      <div class="rule-text">
        <strong>{i18n.t('stats.ruleMet')}</strong>
        {#if store.stats.since511}
          <span>{i18n.t('stats.ruleSince').replace('{time}', formatTime(store.stats.since511))}</span>
        {/if}
        <span class="rule-hint">{i18n.t('stats.ruleMetHint')}</span>
      </div>
    {:else}
      <span class="rule-icon">◐</span>
      <div class="rule-text">
        <strong>
          {i18n.t('stats.ruleTitle')}
          <InfoTooltip text={i18n.t('tooltip.rule511')} />
        </strong>
        <span>{i18n.t('stats.ruleUnmet')}</span>
      </div>
    {/if}
  </div>
</section>

<style>
  .stats-card {
    background: var(--color-surface);
    border-radius: var(--radius);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .title {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
  }

  .stat-label {
    font-size: 0.78rem;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .rule-511 {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem;
    border-radius: var(--radius-sm);
    background: var(--color-surface-2);
  }

  .rule-511.is-met {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .rule-511.is-unmet {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .rule-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .is-met .rule-icon {
    color: var(--color-511-met);
  }

  .is-unmet .rule-icon {
    color: var(--color-511-unmet);
  }

  .rule-text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.9rem;
  }

  .rule-text strong {
    font-weight: 600;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .rule-text span {
    color: var(--color-text-muted);
    font-size: 0.82rem;
  }

  .rule-hint {
    font-style: italic;
    color: var(--color-511-met) !important;
  }
</style>
