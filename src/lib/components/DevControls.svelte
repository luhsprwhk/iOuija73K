<script>
  import { css } from '../../../styled-system/css';
  import { Tabs } from 'melt/components';

  let { onStateJump, onTriggerLockout, onReset, onResetCodex } = $props();

  let storageData = $state({});
  let currentTab = $state('controls');

  const trialOptions = [
    { label: 'Start (Initial)', value: 'initial' },
    { label: 'Name Exchange', value: 'name_exchange' },
    { label: 'Convent Trial', value: 'convent' },
    { label: 'Hangman Trial', value: 'hangman' },
    { label: 'White Room Trial', value: 'white_room' },
    { label: 'Free-Form (Playing)', value: 'playing' },
  ];

  function handleJump(event) {
    const selectedState = event.target.value;
    if (selectedState && onStateJump) {
      onStateJump(selectedState);
      // Reset dropdown to allow jumping to the same trial again
      event.target.value = '';
    }
  }

  function loadStorageData() {
    const data = {};
    // Get all localStorage keys that start with io73k
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('io73k_')) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            // Try to parse as JSON for pretty display
            data[key] = JSON.parse(value);
          } catch {
            // If not JSON, store as string
            data[key] = value;
          }
        }
      }
    }
    storageData = data;
  }

  function refreshStorage() {
    loadStorageData();
  }

  // Load storage data when switching to storage tab
  $effect(() => {
    if (currentTab === 'storage') {
      loadStorageData();
    }
  });

  const containerClass = css({
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    border: '1px solid #8b0000',
    borderRadius: '0.375rem',
    maxWidth: '20rem',
  });

  const tabListClass = css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  });

  const tabTriggerClass = css({
    padding: '0.375rem 0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid #2a2a3e',
    borderRadius: '0.25rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#8b0000',
    },
    '&[data-state="active"]': {
      backgroundColor: '#8b0000',
      borderColor: '#a00000',
    },
  });

  const contentClass = css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  });

  const storageViewClass = css({
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#e0e0e0',
    backgroundColor: '#1a1a2e',
    padding: '0.75rem',
    borderRadius: '0.25rem',
    maxHeight: '300px',
    overflowY: 'auto',
    width: '100%',
  });

  const storageKeyClass = css({
    color: '#a00000',
    fontWeight: 'bold',
  });

  const storageValueClass = css({
    color: '#b0b0b0',
    marginLeft: '0.5rem',
  });

  const emptyStorageClass = css({
    color: '#666',
    fontStyle: 'italic',
  });

  const labelClass = css({
    fontSize: '0.75rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  });

  const selectClass = css({
    padding: '0.375rem 0.5rem',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '0.25rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:hover': {
      borderColor: '#8b0000',
    },
    '&:focus': {
      borderColor: '#8b0000',
    },
  });

  const buttonClass = css({
    padding: '0.375rem 0.75rem',
    backgroundColor: '#8b0000',
    border: '1px solid #a00000',
    borderRadius: '0.25rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#a00000',
    },
    '&:active': {
      backgroundColor: '#6b0000',
    },
  });
</script>

<Tabs bind:value={currentTab}>
  {#snippet children(tabs)}
    <div class={containerClass}>
      <div class={tabListClass} {...tabs.triggerList}>
        <span class={labelClass}>DEV:</span>
        <button class={tabTriggerClass} {...tabs.getTrigger('controls')}>
          Controls
        </button>
        <button class={tabTriggerClass} {...tabs.getTrigger('storage')}>
          Storage
        </button>
      </div>

      <div {...tabs.getContent('controls')}>
        <div class={contentClass}>
          <select class={selectClass} onchange={handleJump}>
            <option value="">Jump to trial...</option>
            {#each trialOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <button class={buttonClass} onclick={onTriggerLockout}>
            Trigger Lockout
          </button>
          <button class={buttonClass} onclick={onReset}>
            Reset Profile
          </button>
          <button class={buttonClass} onclick={onResetCodex}>
            Reset Codex
          </button>
        </div>
      </div>

      <div {...tabs.getContent('storage')}>
        <div class={contentClass}>
          <button class={buttonClass} onclick={refreshStorage}>
            Refresh
          </button>
        </div>
        <div class={storageViewClass}>
          {#if Object.keys(storageData).length === 0}
            <div class={emptyStorageClass}>No game data in localStorage</div>
          {:else}
            {#each Object.entries(storageData) as [key, value]}
              <div style="margin-bottom: 0.5rem;">
                <span class={storageKeyClass}>{key}:</span>
                <span class={storageValueClass}>
                  {JSON.stringify(value, null, 2)}
                </span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {/snippet}
</Tabs>
