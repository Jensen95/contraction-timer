<script lang="ts">
  interface Props {
    active: boolean;
  }
  let { active }: Props = $props();
</script>

{#if active}
  <span
    class="wake-lock"
    title="Screen will stay on during contractions"
    aria-label="Screen wake lock active"
  >
    🔒
  </span>
{/if}

<style>
  .wake-lock {
    font-size: 0.85rem;
    opacity: 0.6;
    cursor: default;
  }
</style>
