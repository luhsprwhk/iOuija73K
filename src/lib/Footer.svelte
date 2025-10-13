<script>
  import { css } from "../../styled-system/css";

  const footerClass = css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    animation: "fadeIn 1s ease-in",
  });
</script>

<footer class={footerClass}>
  A game by <a href="https://luhsprwhk.xyz">Luh Sprwhk</a>
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