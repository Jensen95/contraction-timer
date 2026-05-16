<script lang="ts">
  interface Props {
    text: string;
  }
  let { text }: Props = $props();

  let btnEl = $state<HTMLButtonElement | null>(null);
  let popoverEl = $state<HTMLElement | null>(null);
  const uid = `tip-${Math.random().toString(36).slice(2, 8)}`;

  $effect(() => {
    const btn = btnEl;
    const pop = popoverEl;
    if (!btn || !pop) return;

    if (!window.matchMedia('(hover: hover)').matches) return;

    function show() {
      pop!.showPopover?.();
    }
    function hide() {
      pop!.hidePopover?.();
    }

    btn.addEventListener('mouseenter', show);
    btn.addEventListener('mouseleave', hide);
    return () => {
      btn.removeEventListener('mouseenter', show);
      btn.removeEventListener('mouseleave', hide);
    };
  });
</script>

<span class="tooltip-wrapper">
  <button
    bind:this={btnEl}
    class="info-btn"
    type="button"
    popovertarget={uid}
    aria-label="More information">ⓘ</button
  >
  <div bind:this={popoverEl} id={uid} popover="auto" class="tooltip-popover" role="tooltip">
    {text}
  </div>
</span>

<style>
  .tooltip-wrapper {
    display: inline-flex;
    align-items: center;
  }

  .info-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    color: var(--color-text-muted);
    opacity: 0.65;
    padding: 0 0.15rem;
    min-width: 18px;
    min-height: 18px;
    line-height: 1;
    transition: opacity 0.15s;
  }

  .info-btn:hover,
  .info-btn:focus-visible {
    opacity: 1;
    outline: 2px solid var(--color-accent);
    border-radius: 50%;
  }

  .tooltip-popover {
    background: var(--color-surface-2);
    color: var(--color-text);
    border: 1px solid var(--color-surface-2);
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.8rem;
    font-size: 0.82rem;
    line-height: 1.5;
    max-width: 240px;
    box-shadow: 0 4px 16px var(--color-shadow);
    margin: 0;
  }

  .tooltip-popover::backdrop {
    background: transparent;
  }
</style>
