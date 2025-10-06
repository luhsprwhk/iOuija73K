<script>
  import { css } from "../styled-system/css";
  import ChatInterface from "./lib/ChatInterface.svelte";
  import Footer from "./lib/Footer.svelte";

  let showFooter = $state(false);

  function handleGameStateChange(state) {
    // Show footer when Paimon reveals himself (name_exchange state)
    if (state === "name_exchange") {
      showFooter = true;
    }
  }

  const containerClass = css({
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    marginTop: "2rem !important",
  });

  const contentClass = css({
    flex: 1,
    overflow: "hidden",
  });
</script>

<div class={containerClass}>
  <div class={contentClass}>
    <ChatInterface onGameStateChange={handleGameStateChange} />
    {#if showFooter}
    <div style="margin-top: 2rem;">
      <Footer />
    </div>
    {/if}
  </div>
</div>
