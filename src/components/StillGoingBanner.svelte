<script lang="ts">
  import { formatDuration } from '$lib/utils.ts';
  import { i18n } from '$lib/i18n/index.svelte.ts';

  interface Props {
    elapsed: number;
  }
  let { elapsed }: Props = $props();
</script>

{#if elapsed > 3 * 60 * 1000}
  <div class="banner" role="status">
    {i18n.t('banner.stillGoing').replace('{duration}', formatDuration(elapsed))}
  </div>
{/if}

<style>
  .banner {
    margin-top: 0.75rem;
    padding: 0.6rem 1rem;
    background: #92400e;
    color: #fef3c7;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    text-align: center;
    animation: fade-in 0.3s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
