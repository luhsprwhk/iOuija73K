<script>
  import { css } from '../../styled-system/css';

  let { onStateJump, onTriggerLockout } = $props();

  const trialOptions = [
    { label: 'Start (Initial)', value: 'initial' },
    { label: 'Name Exchange', value: 'name_exchange' },
    { label: 'Number Game Intro', value: 'number_game_intro' },
    { label: 'Number Game', value: 'number_game' },
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

  const containerClass = css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    border: '1px solid #8b0000',
    borderRadius: '0.375rem',
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

<div class={containerClass}>
  <span class={labelClass}>DEV:</span>
  <select class={selectClass} onchange={handleJump}>
    <option value="">Jump to trial...</option>
    {#each trialOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  <button class={buttonClass} onclick={onTriggerLockout}>
    Trigger Lockout
  </button>
</div>
