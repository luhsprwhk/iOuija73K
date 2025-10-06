<script>
  import { css } from "../../styled-system/css";
  import paimonSigil from "../assets/paimon_sigil.webp";

  export let width = "80px";
  export let height = "80px";
  export let opacity = 0.8;
  export let animate = true;

  $: sigilClass = css({
    width,
    height,
    objectFit: "contain",
    opacity,
    filter: "drop-shadow(0 0 10px #8b0000)",
    animation: animate ? "pulse 3s ease-in-out infinite" : "none",
  });
</script>

<img src={paimonSigil} alt="Paimon Sigil" class={sigilClass} />

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
</style>
