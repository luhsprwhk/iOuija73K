<script>
  import { fly } from 'svelte/transition';
  import { css } from '../../../styled-system/css';

  let { entry, onDismiss: dismiss } = $props();

  let timeoutId = $state(null);

  $effect(() => {
    if (entry) {
      // Auto-dismiss after 5 seconds
      timeoutId = setTimeout(() => {
        if (dismiss) dismiss();
      }, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });

  function handleDismiss() {
    if (timeoutId) clearTimeout(timeoutId);
    if (dismiss) dismiss();
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleDismiss();
    }
  }
</script>

{#if entry}
  <div
    in:fly={{ y: -20, duration: 300 }}
    out:fly={{ y: -20, duration: 200 }}
    class={css({
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(10, 10, 10, 0.85)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      zIndex: 1001, // Higher than chat interface
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: '1px solid token(colors.gray.700)',
      backdropFilter: 'blur(4px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    })}
    role="button"
    tabindex="0"
    onclick={handleDismiss}
    onkeydown={handleKeydown}
  >
    <div class={css({ fontSize: '2rem' })}>📖</div>
    <div>
      <div class={css({ fontWeight: 'bold', color: 'yellow.300' })}>Codex Unlocked</div>
      <div class={css({ color: 'gray.200', fontSize: 'sm' })}>{entry.title}</div>
    </div>
  </div>
{/if}
