<script lang="ts">
  import { store } from '$lib/store.svelte.ts';
  import { formatDuration, formatTime } from '$lib/utils.ts';
  import { i18n } from '$lib/i18n/index.svelte.ts';

  interface Props {
    onedit: (id: string) => void;
  }
  let { onedit }: Props = $props();

  const rows = $derived.by(() => {
    const sorted = [...store.contractions].sort((a, b) => a.startedAt - b.startedAt);
    return sorted
      .map((c, i) => ({
        ...c,
        num: i + 1,
        duration: c.endedAt !== null ? c.endedAt - c.startedAt : null,
        interval: i > 0 ? c.startedAt - sorted[i - 1]!.startedAt : null,
      }))
      .reverse();
  });
</script>

<section class="log" aria-label={i18n.t('log.title')}>
  <h2 class="title">
    {i18n.t('log.title')}
    <span class="count">{store.contractions.length}</span>
  </h2>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">{i18n.t('log.colStart')}</th>
          <th scope="col">{i18n.t('log.colDuration')}</th>
          <th scope="col">{i18n.t('log.colInterval')}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.id)}
          <tr
            onclick={() => onedit(row.id)}
            onkeydown={(e) => e.key === 'Enter' && onedit(row.id)}
            role="button"
            tabindex="0"
            aria-label={i18n.t('log.editAria').replace('{n}', String(row.num))}
          >
            <td class="num">{row.num}</td>
            <td class="start">{formatTime(row.startedAt)}</td>
            <td class="duration">
              {#if row.duration !== null}
                {formatDuration(row.duration)}
              {:else}
                <span class="ongoing">{i18n.t('log.ongoing')}</span>
              {/if}
            </td>
            <td class="interval">
              {row.interval !== null ? formatDuration(row.interval) : '—'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .log {
    background: var(--color-surface);
    border-radius: var(--radius);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .title {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .count {
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    font-size: 0.78rem;
    padding: 0.1rem 0.5rem;
    border-radius: 99px;
  }

  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  thead th {
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid var(--color-surface-2);
  }

  tbody tr {
    cursor: pointer;
    border-bottom: 1px solid var(--color-surface-2);
    transition: background 0.1s;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  tbody tr:hover,
  tbody tr:focus-visible {
    background: var(--color-surface-2);
    outline: none;
  }

  tbody tr:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
  }

  td {
    padding: 0.7rem 0.5rem;
    color: var(--color-text);
  }

  td.num {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    width: 2rem;
  }

  td.start,
  td.duration,
  td.interval {
    font-variant-numeric: tabular-nums;
    font-family: monospace;
  }

  .ongoing {
    color: var(--color-active);
    font-style: italic;
    font-family: inherit;
  }
</style>
