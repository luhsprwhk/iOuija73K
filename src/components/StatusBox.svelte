<script>
  import { css } from '../../styled-system/css';

  /**
   * StatusBox - A reusable component for displaying trial status information
   * Positioned in the lower right corner above the input field
   * 
   * @prop {boolean} showInput - Whether the input field is visible (affects bottom position)
   * @prop {string} content - HTML content to display in the status box
   */
  let { showInput = false, content = '' } = $props();

  const statusBoxClass = $derived(
    css({
      position: 'absolute',
      bottom: showInput ? '7rem' : '1rem',
      right: '1rem',
      zIndex: 10,
      animation: 'fadeIn 1s ease-in',
      backgroundColor: 'rgba(22, 22, 31, 0.9)',
      border: '2px solid #8b0000',
      borderRadius: '0.5rem',
      padding: '1rem',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      color: '#e0e0e0',
      whiteSpace: 'pre',
      lineHeight: '1.2',
    })
  );
</script>

<div class={statusBoxClass}>
  {@html content}
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
