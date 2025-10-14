<script>
  import { css } from '../../styled-system/css';
  import PaimonSigil from './PaimonSigil.svelte';

  let { timeRemaining = 300, onUnlock = undefined } = $props();

  let countdown = $state(timeRemaining);

  // Format time as MM:SS
  const formattedTime = $derived(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  // Update countdown every second
  let interval;
  $effect(() => {
    interval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(interval);
        onUnlock?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  const containerClass = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0d0d1a',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    padding: '2rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  });

  const glitchClass = css({
    fontSize: '8rem',
    fontWeight: 'bold',
    color: '#8b0000',
    marginBottom: '2rem',
    animation: 'glitch 2s infinite',
    textShadow: '0 0 10px #8b0000, 0 0 20px #8b0000, 0 0 30px #8b0000',
  });

  const titleClass = css({
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#c9c9d4',
    marginBottom: '1.5rem',
    letterSpacing: '0.1em',
  });

  const messageClass = css({
    fontSize: '1.2rem',
    color: '#a0a0b0',
    marginBottom: '1rem',
    lineHeight: '1.8',
    maxWidth: '600px',
  });

  const timerClass = css({
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#8b0000',
    marginTop: '2rem',
    marginBottom: '1rem',
    textShadow: '0 0 20px rgba(139, 0, 0, 0.8)',
    animation: 'pulse 2s ease-in-out infinite',
  });

  const subtextClass = css({
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '3rem',
  });

  const sigilClass = css({
    position: 'absolute',
    opacity: 0.1,
    animation: 'rotate 30s linear infinite',
  });
</script>

<div class={containerClass}>
  <div class={sigilClass}>
    <PaimonSigil width="400px" height="400px" />
  </div>

  <div class={glitchClass}>404</div>

  <h1 class={titleClass}>ACCESS DENIED</h1>

  <p class={messageClass}>
    Oh, how <em>adorable</em>. You thought you could lie to a demon?
  </p>

  <p class={messageClass}>
    Three strikes, little liar. That's all you get.
  </p>

  <p class={messageClass}>
    I'm not mad. I'm <em>disappointed</em>. And a bit amused, honestly.
  </p>

  <div class={timerClass}>{formattedTime()}</div>

  <p class={messageClass}>
    Come back when you've learned to be honest.<br />
    Or don't. I have all eternity.
  </p>

  <p class={subtextClass}>
    (But seriously, I know you'll be back. They always come back.)
  </p>
</div>

<style>
  @keyframes glitch {
    0%,
    100% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 2px);
    }
    40% {
      transform: translate(-2px, -2px);
    }
    60% {
      transform: translate(2px, 2px);
    }
    80% {
      transform: translate(2px, -2px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
