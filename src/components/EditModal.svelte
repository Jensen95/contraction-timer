<script lang="ts">
  import { untrack } from 'svelte';
  import { msToDatetimeLocal, datetimeLocalToMs } from '$lib/utils.ts';
  import type { Contraction } from '$lib/types.ts';
  import { i18n } from '$lib/i18n/index.svelte.ts';

  interface Props {
    contraction: Contraction;
    onclose: () => void;
    onsave: (patch: Partial<Omit<Contraction, 'id'>>) => void;
    ondelete: () => void;
  }
  let { contraction, onclose, onsave, ondelete }: Props = $props();

  function autoShow(node: HTMLDialogElement) {
    node.showModal();
    return {
      destroy() {
        node.close();
      },
    };
  }

  // untrack() suppresses Svelte's warning about reading a prop inside $state().
  // We intentionally capture the initial value — these are form fields that the
  // user edits independently after the modal opens.
  let startVal = $state(untrack(() => msToDatetimeLocal(contraction.startedAt)));
  let endVal = $state(
    untrack(() => (contraction.endedAt !== null ? msToDatetimeLocal(contraction.endedAt) : '')),
  );
  let isOngoing = $state(untrack(() => contraction.endedAt === null));
  let note = $state(untrack(() => contraction.note ?? ''));
  let confirmDelete = $state(false);

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === (e.currentTarget as HTMLDialogElement)) {
      onclose();
    }
  }

  function handleSave() {
    onsave({
      startedAt: datetimeLocalToMs(startVal),
      endedAt: isOngoing ? null : endVal ? datetimeLocalToMs(endVal) : null,
      note: note.trim() || undefined,
    });
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog use:autoShow onclick={handleBackdropClick} aria-labelledby="edit-title">
  <h2 id="edit-title" class="modal-title">{i18n.t('edit.title')}</h2>

  <form
    class="form"
    onsubmit={(e) => {
      e.preventDefault();
      handleSave();
    }}
  >
    <div class="field">
      <label for="start-time">{i18n.t('edit.startTime')}</label>
      <input id="start-time" type="datetime-local" bind:value={startVal} required />
    </div>

    <div class="field">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={isOngoing} />
        <span>{i18n.t('edit.stillInProgress')}</span>
      </label>
    </div>

    {#if !isOngoing}
      <div class="field">
        <label for="end-time">{i18n.t('edit.endTime')}</label>
        <input id="end-time" type="datetime-local" bind:value={endVal} />
      </div>
    {/if}

    <div class="field">
      <label for="note">{i18n.t('edit.note')}</label>
      <textarea id="note" bind:value={note} rows="2" placeholder={i18n.t('edit.notePlaceholder')}
      ></textarea>
    </div>

    <div class="actions">
      <button type="submit" class="btn-primary">{i18n.t('edit.save')}</button>
      <button type="button" class="btn-secondary" onclick={onclose}>{i18n.t('edit.cancel')}</button>
    </div>
  </form>

  <div class="delete-section">
    {#if confirmDelete}
      <p class="confirm-text">{i18n.t('edit.deleteConfirm')}</p>
      <div class="confirm-actions">
        <button class="btn-danger" onclick={ondelete}>{i18n.t('edit.yesDelete')}</button>
        <button class="btn-secondary" onclick={() => (confirmDelete = false)}>{i18n.t('edit.noKeep')}</button>
      </div>
    {:else}
      <button class="btn-delete" onclick={() => (confirmDelete = true)}>{i18n.t('edit.deleteEntry')}</button>
    {/if}
  </div>
</dialog>

<style>
  dialog {
    max-width: min(480px, 92vw);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    flex-direction: row;
    color: var(--color-text);
  }

  .checkbox-label input[type='checkbox'] {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    cursor: pointer;
    accent-color: var(--color-accent);
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .btn-primary {
    flex: 1;
    background: var(--color-accent);
    color: white;
    padding: 0.75rem;
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
    flex: 1;
    background: var(--color-surface-2);
    color: var(--color-text);
    padding: 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    min-height: 48px;
  }

  .delete-section {
    border-top: 1px solid var(--color-surface-2);
    padding-top: 1rem;
  }

  .btn-delete {
    color: var(--color-active);
    font-size: 0.9rem;
    padding: 0.4rem 0;
    text-decoration: underline;
    background: none;
    min-height: 44px;
  }

  .btn-danger {
    background: var(--color-active);
    color: white;
    padding: 0.6rem 1rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    min-height: 44px;
  }

  .confirm-text {
    color: var(--color-text-muted);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .confirm-actions {
    display: flex;
    gap: 0.75rem;
  }
</style>
