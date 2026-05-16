<script lang="ts">
  import { store } from '$lib/store.svelte.ts';
  import { downloadCSV, shareContractions } from '$lib/export.ts';
  import { i18n } from '$lib/i18n/index.svelte.ts';
  import { themeStore } from '$lib/theme.svelte.ts';

  interface Props {
    onclose: () => void;
  }
  let { onclose }: Props = $props();

  function autoShow(node: HTMLDialogElement) {
    node.showModal();
    return {
      destroy() {
        node.close();
      },
    };
  }

  let confirmClear = $state(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === (e.currentTarget as HTMLDialogElement)) {
      onclose();
    }
  }

  async function handleShare() {
    await shareContractions(store.contractions);
  }

  function handleClear() {
    store.clearSession();
    confirmClear = false;
    onclose();
  }

  type Theme = 'auto' | 'light' | 'dark';
  const themes: Theme[] = ['auto', 'light', 'dark'];
  const themeLabels: Record<Theme, () => string> = {
    auto: () => i18n.t('settings.themeAuto'),
    light: () => i18n.t('settings.themeLight'),
    dark: () => i18n.t('settings.themeDark'),
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog use:autoShow onclick={handleBackdropClick} aria-labelledby="settings-title">
  <div class="header">
    <h2 id="settings-title">{i18n.t('settings.title')}</h2>
    <button class="close-btn" onclick={onclose} aria-label={i18n.t('settings.closeAria')}>✕</button>
  </div>

  <section class="section">
    <h3 class="section-title">{i18n.t('settings.themeSection')}</h3>
    <div class="theme-btns">
      {#each themes as t}
        <button
          class="theme-btn"
          class:is-active={themeStore.theme === t}
          onclick={() => themeStore.setTheme(t)}
        >
          {themeLabels[t]()}
        </button>
      {/each}
    </div>
  </section>

  <section class="section">
    <h3 class="section-title">{i18n.t('settings.languageSection')}</h3>
    <div class="theme-btns">
      {#each ['en', 'da'] as lang}
        <button
          class="theme-btn"
          class:is-active={i18n.locale === lang}
          onclick={() => i18n.setLocale(lang as 'en' | 'da')}
        >
          {lang === 'en' ? 'English' : 'Dansk'}
        </button>
      {/each}
    </div>
  </section>

  <section class="section">
    <h3 class="section-title">{i18n.t('settings.exportSection')}</h3>
    <div class="section-body">
      <button
        class="action-btn"
        onclick={() => downloadCSV(store.contractions)}
        disabled={store.contractions.length === 0}
      >
        <span class="icon">⬇</span>
        {i18n.t('settings.downloadCsv')}
      </button>
      {#if canShare}
        <button class="action-btn" onclick={handleShare} disabled={store.contractions.length === 0}>
          <span class="icon">⎙</span>
          {i18n.t('settings.shareLog')}
        </button>
      {/if}
    </div>
    {#if store.contractions.length === 0}
      <p class="hint">{i18n.t('settings.noData')}</p>
    {/if}
  </section>

  <section class="section">
    <h3 class="section-title">{i18n.t('settings.sessionSection')}</h3>
    <div class="section-body">
      {#if confirmClear}
        <p class="confirm-text">
          {i18n.t('settings.confirmClear').replace('{n}', String(store.contractions.length))}
        </p>
        <div class="confirm-actions">
          <button class="btn-danger" onclick={handleClear}>{i18n.t('settings.yesClear')}</button>
          <button class="btn-secondary" onclick={() => (confirmClear = false)}
            >{i18n.t('settings.cancel')}</button
          >
        </div>
      {:else}
        <button
          class="action-btn action-btn--danger"
          onclick={() => (confirmClear = true)}
          disabled={store.contractions.length === 0}
        >
          <span class="icon">⊗</span>
          {i18n.t('settings.clearAll')}
        </button>
      {/if}
    </div>
  </section>

  <section class="section about">
    <h3 class="section-title">{i18n.t('settings.aboutSection')}</h3>
    <p class="about-text">{i18n.t('settings.aboutText')}</p>
    <p class="version">v0.1.0</p>
  </section>
</dialog>

<style>
  dialog {
    max-width: min(480px, 92vw);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header h2 {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-btn {
    color: var(--color-text-muted);
    font-size: 1.1rem;
    padding: 0.4rem;
    min-width: 44px;
    min-height: 44px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .close-btn:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-surface-2);
  }

  .section:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
  }

  .theme-btns {
    display: flex;
    gap: 0.5rem;
  }

  .theme-btn {
    flex: 1;
    padding: 0.5rem;
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    font-weight: 500;
    min-height: 40px;
    transition:
      background 0.15s,
      color 0.15s;
    border: 1px solid transparent;
  }

  .theme-btn:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }

  .theme-btn.is-active {
    background: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
  }

  .section-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface-2);
    color: var(--color-text);
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 500;
    min-height: 48px;
    transition: background 0.15s;
    text-align: left;
  }

  .action-btn:hover:not(:disabled) {
    background: var(--color-accent);
    color: white;
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .action-btn--danger:not(:disabled) {
    color: var(--color-active);
  }

  .action-btn--danger:hover:not(:disabled) {
    background: var(--color-active);
    color: white;
  }

  .icon {
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .hint {
    font-size: 0.82rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .confirm-text {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  .confirm-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-danger {
    background: var(--color-active);
    color: white;
    padding: 0.7rem 1rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    min-height: 44px;
    flex: 1;
  }

  .btn-secondary {
    background: var(--color-surface-2);
    color: var(--color-text);
    padding: 0.7rem 1rem;
    border-radius: var(--radius-sm);
    min-height: 44px;
    flex: 1;
  }

  .about {
    color: var(--color-text-muted);
  }

  .about-text {
    font-size: 0.88rem;
    line-height: 1.6;
  }

  .version {
    font-size: 0.78rem;
    font-family: monospace;
  }
</style>
