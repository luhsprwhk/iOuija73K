<script>
  import { css } from '../../../styled-system/css';

  let {
    content = '',
    onOkClick,
    onNewGameClick,
  } = $props();

  const messageClass = css({
    padding: '1rem',
    marginBottom: '0.75rem',
    borderRadius: '0.5rem',
    maxWidth: '80%',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    animation: 'fadeIn 0.3s ease-in',
  });

  const assistantMessageClass = css({
    backgroundColor: '#1a1a2e',
    color: '#c9c9d4',
    marginRight: 'auto',
    borderLeft: '3px solid #8b0000',
  });

  const buttonClass = css({
    padding: '0.5rem 1.5rem',
    backgroundColor: '#8b0000',
    border: 'none',
    borderRadius: '0.375rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    '&:hover': {
      backgroundColor: '#a00000',
    },
    '&:active': {
      backgroundColor: '#6b0000',
    },
  });

  const buttonContainerClass = css({
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap',
  });
</script>

<div class="{messageClass} {assistantMessageClass}">
  <div
    class={css({
      fontSize: '0.75rem',
      opacity: 0.6,
      marginBottom: '0.25rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    })}
  >
    Paimon
  </div>
  {#if content}
    <div
      class={css({
        lineHeight: '1.6',
        '& strong': {
          color: '#ff6b6b',
          fontWeight: 'bold',
        },
        '& em, & i': {
          color: '#ffd93d',
          fontStyle: 'italic',
        },
      })}
    >
      {@html content}
    </div>
  {/if}
  <div class={buttonContainerClass}>
    <button class={buttonClass} onclick={onOkClick}>
      Continue
    </button>
    <button class={buttonClass} onclick={onNewGameClick}>
      New Game
    </button>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
