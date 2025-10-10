<script>
  import { css } from "../styled-system/css";
  import ChatInterface from "./lib/ChatInterface.svelte";

  const containerClass = css({
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    marginTop: "3rem",
  });

  const contentClass = css({
    flex: 1,
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  });
</script>

<div class={containerClass}>
  <div class={contentClass}>
    <ChatInterface />
  </div>
</div>
