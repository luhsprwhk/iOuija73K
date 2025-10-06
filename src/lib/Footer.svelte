<script>
  import { css } from "../../styled-system/css";
  import PaimonSigil from "./PaimonSigil.svelte";

  const footerClass = css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    animation: "fadeIn 1s ease-in",
  });
</script>

<footer class={footerClass}>
  <PaimonSigil />
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

</style>