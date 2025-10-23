<!--
  Achievement panel - displays all achievements and completion progress
  Accessible via trophy icon button
-->
<script>
  import { css } from '../../../styled-system/css';
  import { getAllAchievements } from '../../achievements/achievementData.js';
  import {
    getUnlockedAchievements,
    getAchievementStats,
  } from '../../achievements/achievementManager.js';

  let { isOpen = $bindable(false), onClose } = $props();

  // Get achievement data
  const allAchievements = getAllAchievements();
  const unlockedIds = $derived(
    new Set(getUnlockedAchievements().map((a) => a.id))
  );
  const stats = $derived(getAchievementStats(allAchievements.length));

  function handleClose() {
    isOpen = false;
    onClose?.();
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class={css({
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bg: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      animation: 'fadeIn 0.2s ease-out',
    })}
    onclick={handleBackdropClick}
    role="button"
    tabindex="-1"
  >
    <!-- Panel -->
    <div
      class={css({
        bg: 'darkBg',
        border: '2px solid',
        borderColor: 'bloodRed',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 0.3s ease-out',
      })}
    >
      <!-- Header -->
      <div
        class={css({
          padding: '20px 24px',
          borderBottom: '1px solid rgba(139, 0, 0, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        })}
      >
        <div>
          <h2
            class={css({
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '4px',
            })}
          >
            Achievements
          </h2>
          <div
            class={css({
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
            })}
          >
            {stats.unlocked} of {stats.total} ({stats.percentage}%)
          </div>
        </div>
        <button
          onclick={handleClose}
          class={css({
            bg: 'transparent',
            border: 'none',
            color: 'bloodRed',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'opacity 0.2s',
            _hover: {
              opacity: 0.7,
            },
          })}
        >
          ✕
        </button>
      </div>

      <!-- Achievement list -->
      <div
        class={css({
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
        })}
      >
        {#each allAchievements as achievement (achievement.id)}
          {@const isUnlocked = unlockedIds.has(achievement.id)}
          <div
            class={css({
              display: 'flex',
              gap: '16px',
              padding: '16px',
              marginBottom: '12px',
              bg: isUnlocked ? 'rgba(139, 0, 0, 0.1)' : 'rgba(40, 40, 40, 0.5)',
              border: '1px solid',
              borderColor: isUnlocked
                ? 'rgba(139, 0, 0, 0.3)'
                : 'rgba(80, 80, 80, 0.3)',
              borderRadius: '8px',
              opacity: isUnlocked ? 1 : 0.5,
              transition: 'all 0.2s',
            })}
          >
            <div
              class={css({
                fontSize: '40px',
                lineHeight: 1,
                flexShrink: 0,
                filter: isUnlocked ? 'none' : 'grayscale(100%)',
              })}
            >
              {achievement.icon}
            </div>
            <div
              class={css({
                flex: 1,
              })}
            >
              <h3
                class={css({
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isUnlocked ? 'white' : 'rgba(255, 255, 255, 0.4)',
                  marginBottom: '4px',
                })}
              >
                {achievement.title}
              </h3>
              <p
                class={css({
                  fontSize: '14px',
                  color: isUnlocked
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(255, 255, 255, 0.3)',
                  lineHeight: 1.5,
                })}
              >
                {isUnlocked ? achievement.description : '???'}
              </p>
            </div>
            {#if isUnlocked}
              <div
                class={css({
                  fontSize: '20px',
                  color: 'bloodRed',
                  flexShrink: 0,
                })}
              >
                ✓
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
