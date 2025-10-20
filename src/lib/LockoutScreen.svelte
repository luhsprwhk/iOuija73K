<script>
  import { css } from '../../styled-system/css';
  import PaimonSigil from './PaimonSigil.svelte';

  let { timeRemaining = 300, onUnlock = undefined } = $props();

  let countdown = $state(timeRemaining);
  let audio;

  // Format time as MM:SS
  const formattedTime = $derived(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  // Play audio when component mounts
  $effect(() => {
    audio = new Audio('/audio/muzak/dark-elevator-muzak.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Audio playback failed:', err));

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
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
    animation: 'glitch 2s infinite',
    marginTop: '2rem',
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
    opacity: 1.0,
    zIndex: 1,
  });

  const subtextClass = css({
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '3rem',
  });

  const sigilClass = css({
    position: 'absolute',
    opacity: 0.2,
    animation: 'rotate 30s linear infinite',
  });

  const ironPhantomClass = css({
    position: 'absolute',
    opacity: 0.2,
    animation: 'rotateAndFade 30s ease-in-out infinite',
  });
</script>

<div class={containerClass}>
  <img
    src="/src/assets/img/paimon_elevator.webp"
    alt="Iron Phantom"
    class={ironPhantomClass}
  />

  <div class={glitchClass}>404</div>

  <h1 class={titleClass}>ACCESS DENIED</h1>

  <p class={messageClass}>Three strikes, little liar. That's all you get.</p>

  <p class={messageClass}>
    Come back when you've learned to be honest.<br />
    Or don't. I have all eternity.
  </p>

  <div class={timerClass}>{formattedTime()}</div>

  <div
    class={sigilClass}
    style="left: 50%; transform: translate(-50%, -50%); opacity: 0.8;"
  >
    <PaimonSigil width="400px" height="400px" />
  </div>
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

  @keyframes rotateAndFade {
    0% {
      transform: rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: rotate(180deg);
      opacity: 0.2;
    }
    100% {
      transform: rotate(360deg);
      opacity: 1;
    }
  }
</style>
