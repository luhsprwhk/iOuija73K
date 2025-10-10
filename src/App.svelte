<script>
  import { css } from "../styled-system/css";
  import ChatInterface from "./lib/ChatInterface.svelte";

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
    <ChatInterface />
  </div>
</div>
