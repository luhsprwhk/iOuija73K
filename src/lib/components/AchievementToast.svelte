<!--
  Achievement unlock notification toast
  Appears when a new achievement is unlocked
-->
<script>
  import { css } from '../../../styled-system/css';

  let { achievement = $bindable(), onDismiss } = $props();

  // Auto-dismiss after 5 seconds
  $effect(() => {
    if (achievement) {
      const timeout = setTimeout(() => {
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  });
</script>

{#if achievement}
  <div
    class={css({
      position: 'fixed',
      top: '20px',
      right: '20px',
      bg: 'rgba(20, 20, 20, 0.95)',
      border: '2px solid',
      borderColor: 'bloodRed',
      borderRadius: '8px',
      padding: '16px 20px',
      maxWidth: '320px',
      boxShadow: '0 8px 24px rgba(139, 0, 0, 0.4)',
      animation: 'slideInRight 0.4s ease-out',
      zIndex: 1000,
    })}
  >
    <div
      class={css({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      })}
    >
      <div
        class={css({
          fontSize: '32px',
          lineHeight: 1,
          flexShrink: 0,
        })}
      >
        {achievement.icon}
      </div>
      <div
        class={css({
          flex: 1,
        })}
      >
        <div
          class={css({
            fontSize: '12px',
            color: 'bloodRed',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '4px',
          })}
        >
          Achievement Unlocked
        </div>
        <div
          class={css({
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '4px',
          })}
        >
          {achievement.title}
        </div>
        <div
          class={css({
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.4,
          })}
        >
          {achievement.description}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
