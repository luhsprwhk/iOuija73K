<script>
  import { onMount } from 'svelte';

  let { trigger = false } = $props();

  let canvas;
  let confetti;
  let isReady = $state(false);

  onMount(async () => {
    // Dynamically import canvas-confetti
    const module = await import('canvas-confetti');
    confetti = module.default;
    isReady = true;
  });

  $effect(() => {
    if (trigger && isReady && confetti && canvas) {
      // Create confetti instance bound to our canvas
      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      });

      // Dark red/crimson confetti theme for Paimon
      const colors = ['#8b0000', '#a00000', '#ff0000', '#c9c9d4', '#666'];

      // Fire confetti burst
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
        colors,
      };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from two points
        myConfetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        myConfetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  });
</script>

<canvas
  bind:this={canvas}
  style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999;"
></canvas>
