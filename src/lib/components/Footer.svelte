<script>
  import { css } from '../../../styled-system/css';

  let {
    onAchievementClick,
    showAchievementButton = false,
  } = $props();

  const footerClass = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    animation: 'fadeIn 1s ease-in',
    position: 'relative',
    gap: '2rem',
  });

  const buttonClass = css({
    bg: 'transparent',
    border: '2px solid',
    borderColor: 'bloodRed',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '20px',
    color: 'bloodRed',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'rgba(139, 0, 0, 0.1)',
      transform: 'scale(1.05)',
    },
  });
</script>

<footer class={footerClass}>
  <span>A game by <a href="https://luhsprwhk.xyz">Luh Sprwhk</a></span>
  {#if showAchievementButton}
    <button
      class={buttonClass}
      onclick={onAchievementClick}
      title="View Achievements"
    >
      🏆
    </button>
  {/if}
</footer>

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
