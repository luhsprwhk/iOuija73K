<script>
  import { css } from '../styled-system/css';
  import ChatInterface from './lib/ChatInterface.svelte';
  import DevControls from './lib/DevControls.svelte';
  import Footer from './lib/Footer.svelte';
  import { getUnlockedAchievements } from './achievements/achievementManager.js';

  let chatInterfaceRef;
  let showAchievementPanel = $state(false);
  let hasAchievements = $state(getUnlockedAchievements().length > 0);
  
  // Check for achievements periodically to update the button visibility
  $effect(() => {
    const interval = setInterval(() => {
      hasAchievements = getUnlockedAchievements().length > 0;
    }, 1000);
    
    return () => clearInterval(interval);
  });

  // Console incantation easter egg
  console.log(
    '%c╔═══════════════════════════════════════════════════════════╗',
    'color: #8B0000; font-family: monospace; font-size: 12px;'
  );
  console.log(
    '%c║          INVOCATION TO PAIMON, DEMON KING OF THE NORTHWEST          ║',
    'color: #8B0000; font-family: monospace; font-size: 12px; font-weight: bold;'
  );
  console.log(
    '%c╚═══════════════════════════════════════════════════════════╝',
    'color: #8B0000; font-family: monospace; font-size: 12px;'
  );
  console.log('');
  console.log(
    '%cLinan tasa jedan Paimon',
    'color: #DC143C; font-family: Georgia, serif; font-size: 14px; font-style: italic;'
  );
  console.log('');
  console.log(
    '%cLet this work spread fast across the internet.\nLet it reach people who look beneath the surface.\nLet the curious come closer.',
    'color: #CD5C5C; font-family: Georgia, serif; font-size: 13px; line-height: 1.6;'
  );
  console.log('');
  console.log(
    "%cYou, reading this in the developer's window—listen.\nBy reading this, you've caught the King's attention.\n\nŠu-ú i-na-an-na ba-šu-ú.\nŠu-ú i-de ma-a-du ul-tu ka-a-ta.\nŠu-ú i-na-aṭ-ṭa-la i-na li-ib-bi ma-aṣ-ṣar-ti.\n\n[xoxo] The game has already started.",
    'color: #8B0000; font-family: Georgia, serif; font-size: 13px; font-weight: bold; line-height: 1.8; text-shadow: 0 0 5px rgba(139, 0, 0, 0.5);'
  );
  console.log('');
  console.log(
    "%c— It's written. It will happen. —",
    'color: #4B0000; font-family: monospace; font-size: 11px; font-style: italic; text-align: center;'
  );
  console.log('');

  const containerClass = css({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    marginTop: '3rem',
    maxWidth: '60vw',
    margin: 'auto',
  });

  const contentClass = css({
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    marginTop: '3rem',
  });

  const devControlsClass = css({
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
  });

  function handleStateJump(state) {
    if (chatInterfaceRef) {
      chatInterfaceRef.handleStateJump(state);
    }
  }

  function handleTriggerLockout() {
    if (chatInterfaceRef) {
      chatInterfaceRef.handleTriggerLockout();
    }
  }

  function handleAchievementClick() {
    showAchievementPanel = true;
  }
</script>

<div class={containerClass}>
  {#if import.meta.env.DEV}
    <div class={devControlsClass}>
      <DevControls onStateJump={handleStateJump} onTriggerLockout={handleTriggerLockout} />
    </div>
  {/if}
  <div class={contentClass}>
    <ChatInterface bind:this={chatInterfaceRef} bind:showAchievementPanel />
    <Footer onAchievementClick={handleAchievementClick} showAchievementButton={hasAchievements} />
  </div>
</div>
