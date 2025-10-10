<script>
  import { css } from "../../styled-system/css";
  import { fade, scale } from "svelte/transition";
  import paimonSigil from "../assets/paimon_sigil.webp";

  export let width = "40px";
  export let height = "40px";
  export let opacity = 0.8;
  export let animate = true;

  $: sigilClass = css({
    width,
    height,
    objectFit: "contain",
    opacity,
    filter: "drop-shadow(0 0 10px #8b0000)",
    animation: animate ? "pulse 3s ease-in-out infinite, entrance 1.5s ease-out" : "entrance 1.5s ease-out",
  });
</script>

<img 
  src={paimonSigil} 
  alt="Paimon Sigil" 
  class={sigilClass} 
  height="64px" 
  width="64px"
  in:scale={{ duration: 1500, start: 0.3, opacity: 0 }}
/>

<style>
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
</style>
