<script>
  import { css } from '../../../styled-system/css';
  import { fade, scale } from 'svelte/transition';
  import paimonSigil from '../../assets/paimon_sigil.webp';

  export let width = '40px';
  export let height = '40px';
  export let opacity = 0.8;
  export let animate = true;
  export let loading = false;

  let hasEntered = false;

  $: baseClass = css({
    width,
    height,
    objectFit: 'contain',
    opacity,
    filter: 'drop-shadow(0 0 10px #8b0000)',
  });

  $: animationClass = loading
    ? 'spin-animation'
    : hasEntered
    ? (animate ? 'pulse-only-animation' : '')
    : 'entrance-animation';
  
  // Mark entrance as complete after the entrance animation duration
  $: if (!hasEntered && !loading) {
    setTimeout(() => {
      hasEntered = true;
    }, 3000); // Match entrance animation duration
  }
</script>

<img
  src={paimonSigil}
  alt="Paimon Sigil"
  class="{baseClass} {animationClass}"
  height="64px"
  width="64px"
  in:scale={{ duration: 1500, start: 0.3, opacity: 0 }}
/>

<style>
  .spin-animation {
    animation: spin 3s linear infinite, pulse 3s ease-in-out infinite;
  }

  .pulse-animation {
    animation: pulse 3s ease-in-out infinite, entrance 3s ease-out;
  }

  .pulse-only-animation {
    animation: pulse 3s ease-in-out infinite;
  }

  .entrance-animation {
    animation: entrance 3s ease-out;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes entrance {
    0% {
      transform: scale(0.3) rotate(-180deg);
      filter: drop-shadow(0 0 5px #8b0000);
    }
    50% {
      filter: drop-shadow(0 0 30px #ff0000) drop-shadow(0 0 60px #8b0000);
    }
    100% {
      transform: scale(1) rotate(0deg);
      filter: drop-shadow(0 0 10px #8b0000);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
