<script>
  import { css } from "../../styled-system/css";

  let {
    role = "user",
    content = "",
    showButton = false,
    onButtonClick,
    showDemonName = false,
    demonName = "DM",
  } = $props();

  const messageClass = css({
    padding: "1rem !important",
    marginBottom: "0.75rem !important",
    borderRadius: "0.5rem !important",
    maxWidth: "80%",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    animation: "fadeIn 0.3s ease-in !important",
  });

  const userMessageClass = css({
    backgroundColor: "#2a2a3e",
    color: "#e0e0e0",
    marginLeft: "auto",
  });

  const assistantMessageClass = css({
    backgroundColor: "#1a1a2e",
    color: "#c9c9d4",
    marginRight: "auto",
    borderLeft: "3px solid #8b0000",
  });

  const buttonClass = css({
    marginTop: "0.75rem",
    padding: "0.5rem 1.5rem",
    backgroundColor: "#8b0000",
    border: "none",
    borderRadius: "0.375rem",
    color: "#e0e0e0",
    fontFamily: "monospace",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    "&:hover": {
      backgroundColor: "#a00000",
    },
    "&:active": {
      backgroundColor: "#6b0000",
    },
  });
</script>

<div
  class="{messageClass} {role === 'user'
    ? userMessageClass
    : assistantMessageClass}"
>
  <div
    class={css({
      fontSize: "0.75rem",
      opacity: 0.6,
      marginBottom: "0.25rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    })}
  >
    {role === "user" ? "You" : showDemonName ? demonName : "DM"}
  </div>
  <div class={css({ lineHeight: "1.6" })}>
    {content}
  </div>
  {#if showButton}
    <button class={buttonClass} onclick={onButtonClick}> Ok. </button>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
