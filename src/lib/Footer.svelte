<script>
  import { css } from "../../styled-system/css";
  import paimonSigil from "../assets/paimon_sigil.webp";

  const footerClass = css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    backgroundColor: "#0d0d1a",
    animation: "fadeIn 1s ease-in",
  });

  const sigilClass = css({
    width: "120px",
    height: "120px",
    backgroundImage: `url(${paimonSigil})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    opacity: 0.8,
    filter: "drop-shadow(0 0 10px #8b0000)",
    animation: "pulse 3s ease-in-out infinite",
  });
</script>

<footer class={footerClass}>
  <div class="{sigilClass} paimon-sigil"></div>
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