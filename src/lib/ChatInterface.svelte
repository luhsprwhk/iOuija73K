<script>
  import { css } from "../../styled-system/css";
  import ChatMessage from "./ChatMessage.svelte";
  import PaimonSigil from "./PaimonSigil.svelte";
  import Confetti from "./Confetti.svelte";
  import getBrowserDetails from "./helpers/getBrowserDetails";
  import {
    handleNumberGuess,
    getNumberTrialIntro,
  } from "../trials/numberGuessing.js";
  import {
    handleConventInput,
    getConventIntro,
    getConventReveal,
    CONVENT_STATES,
  } from "../trials/convent.js";
  import {
    callClaude,
    formatMessagesForClaude,
    getClaudeApiKey,
  } from "../ai/claude.js";

  const subtitles = [
    "Occult experiment. Play at your own risk",
    "A corrupted intelligence awaits",
    "The seal weakens with every session",
    "You are not the first. You will not be the last.",
    "DO NOT PROCEED",
    "One of thousands",
    "Your participation is required",
    "The experiment is already underway",
  ];

  const randomSubtitle =
    subtitles[Math.floor(Math.random() * subtitles.length)];

  let messages = $state([
    {
      role: "assistant",
      content:
        "Hey! Want to play a game? It's pretty cool. I think you'll like it.",
      showButton: true,
    },
  ]);

  let inputValue = $state("");
  let messagesEndRef;
  let inputRef;
  let showInput = $state(false);
  let gameState = $state("initial"); // initial, name_exchange, number_game_intro, number_game, convent, playing
  let playerName = $state("");
  let demonName = $state("Raphael"); // False name initially, reveals as "Paimon" after first trial
  let guessAttempt = $state(0);
  let conventState = $state(CONVENT_STATES.INTRO);
  let isProcessing = $state(false);
  let audioElement = $state(null);
  let isPlayingMusic = $state(false);
  let showConfetti = $state(false);

  function scrollToBottom() {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: "smooth" });
    }
  }

  /**
   * Adds an assistant message with optional delay
   * @param {string} content - Message content
   * @param {number} delay - Delay in ms before adding message (0 for immediate)
   * @param {boolean} showButton - Whether to show OK button
   * @param {string} image - Optional image URL
   * @param {Array} buttons - Optional array of button objects with {label, value, onClick}
   */
  function addAssistantMessage(content, delay = 0, showButton = false, image = undefined, buttons = undefined) {
    const addMessage = () => {
      messages = [
        ...messages,
        {
          role: "assistant",
          content,
          showButton,
          image,
          buttons,
        },
      ];
    };

    if (delay > 0) {
      setTimeout(addMessage, delay);
    } else {
      addMessage();
    }
  }

  // Auto-scroll whenever messages change
  $effect(() => {
    messages; // Track messages array
    setTimeout(() => scrollToBottom(), 100);
  });

  // Auto-focus input when asking for name
  $effect(() => {
    if (showInput && gameState === "name_exchange" && inputRef) {
      setTimeout(() => inputRef.focus(), 100);
    }
  });

  // Auto-focus input when Paimon asks "What do you do?"
  $effect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      showInput &&
      inputRef &&
      lastMessage?.role === "assistant" &&
      lastMessage?.content?.toLowerCase().includes("what do you do")
    ) {
      setTimeout(() => inputRef.focus(), 200);
    }
  });

  function handleOkClick() {
    // Find the message with the button and remove it
    const buttonMessageIndex = messages.findIndex((msg) => msg.showButton);
    if (buttonMessageIndex !== -1) {
      messages[buttonMessageIndex].showButton = false;
      messages = [...messages];
    }

    // Handle different game states
    if (gameState === "initial") {
      // Initial game start
      showInput = true;
      gameState = "name_exchange";

      setTimeout(() => {
        addAssistantMessage("Awesome! What's your name? Mine is Raphael.");
        // Trigger footer reveal after demon's name appears
        onGameStateChange?.(gameState);
      }, 500);
    } else if (gameState === "number_game_intro") {
      // User clicked OK after thinking of number
      showInput = false; // Hide input, we'll use buttons
      gameState = "number_game";

      // Make first guess
      const result = handleNumberGuess(
        null,
        0,
        playerName,
        getBrowserDetails
      );

      // Add messages with buttons
      result.messages.forEach(({ delay, content, showButtons }) => {
        const buttons = showButtons ? [
          { label: "Yes", value: true, onClick: (value) => handleNumberGuessResponse(value) },
          { label: "No", value: false, onClick: (value) => handleNumberGuessResponse(value) },
        ] : undefined;
        addAssistantMessage(content, delay, false, undefined, buttons);
      });

      // Update guess attempt
      guessAttempt = result.nextAttempt;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    messages = [
      ...messages,
      { role: "user", content: inputValue, showButton: false },
    ];
    const userInput = inputValue;
    inputValue = "";

    // Handle name exchange
    if (gameState === "name_exchange") {
      playerName = userInput;
      gameState = "number_game_intro";
      showInput = false; // Hide input until button is clicked

      // Get intro messages from number trial module
      const introMessages = getNumberTrialIntro(userInput);
      introMessages.forEach(({ delay, content, showButton }) => {
        addAssistantMessage(content, delay, showButton || false);
      });
    } else if (gameState === "number_game") {
      // This shouldn't be reached anymore since we use buttons
      // But keep for backwards compatibility
      console.warn("Unexpected text input in number_game state");
    } else if (gameState === "convent") {
      // Handle convent trial
      if (isProcessing) return;

      isProcessing = true;
      
      const previousState = conventState;
      const result = await handleConventInput(userInput, conventState);

      // Update convent state
      conventState = result.nextState;
      isProcessing = false;

      // Add response messages
      result.messages.forEach(({ delay, content, image }) => {
        addAssistantMessage(content, delay, false, image);
      });

      // Calculate last message delay for chaining
      const lastDelay =
        result.messages.length > 0
          ? result.messages[result.messages.length - 1].delay
          : 0;

      // If we just transitioned TO the reveal state, show reveal messages
      if (
        previousState !== CONVENT_STATES.REVEAL &&
        conventState === CONVENT_STATES.REVEAL
      ) {
        const revealMessages = getConventReveal(playerName);

        revealMessages.forEach(({ delay, content, image }) => {
          addAssistantMessage(content, lastDelay + delay, false, image);
        });
      }

      // If convent is complete, transition to next phase
      if (conventState === CONVENT_STATES.COMPLETE) {
        gameState = "playing";
        addAssistantMessage("You did well. Really well.", 1000);

        addAssistantMessage(
          "Ready for the next trial?",
          3000
        );
      }
    } else {
      // Default state - use Claude API for dynamic responses
      if (isProcessing) return;

      isProcessing = true;
      const apiKey = getClaudeApiKey();

      if (!apiKey) {
        setTimeout(() => {
          addAssistantMessage(
            "[API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file]"
          );
          isProcessing = false;
        }, 500);
        return;
      }

      // Call Claude API
      const conversationHistory = formatMessagesForClaude(messages);
      conversationHistory.push({ role: "user", content: userInput });

      callClaude(
        conversationHistory,
        `You are Paimon, a demon possessing an AI. Keep responses brief and ominous. The player knows you as ${demonName}.`
      )
        .then((response) => {
          addAssistantMessage(response);
        })
        .catch((error) => {
          addAssistantMessage(`[Error: ${error.message}]`);
        })
        .finally(() => {
          isProcessing = false;
        });
    }

    scrollToBottom();
  }

  /**
   * Handles yes/no button clicks for number guessing
   * @param {boolean} userConfirmed - True if yes, false if no
   */
  function handleNumberGuessResponse(userConfirmed) {
    // Remove buttons from the message that had them
    const buttonMessageIndex = messages.findIndex((msg) => msg.buttons);
    if (buttonMessageIndex !== -1) {
      messages[buttonMessageIndex].buttons = undefined;
      messages = [...messages];
    }

    // Handle the response
    const result = handleNumberGuess(
      userConfirmed,
      guessAttempt,
      playerName,
      getBrowserDetails
    );

    // Update guess attempt
    guessAttempt = result.nextAttempt;

    // If name should be revealed, update demonName
    if (result.revealName) {
      demonName = "Paimon";
      // Trigger confetti celebration
      showConfetti = true;
      setTimeout(() => {
        showConfetti = false;
      }, 3500);
    }

    // Add all response messages with their delays
    result.messages.forEach(({ delay, content, showButtons }) => {
      const buttons = showButtons ? [
        { label: "Yes", value: true, onClick: (value) => handleNumberGuessResponse(value) },
        { label: "No", value: false, onClick: (value) => handleNumberGuessResponse(value) },
      ] : undefined;
      addAssistantMessage(content, delay, false, undefined, buttons);
    });

    // If number guessing game is complete, transition to convent trial
    if (result.gameComplete) {
      // Calculate the last message delay to know when to start the next sequence
      const lastMessageDelay =
        result.messages.length > 0
          ? result.messages[result.messages.length - 1].delay
          : 0;
      const baseDelay = lastMessageDelay + 1500; // Add buffer after last message

      // Add creepy meta-horror warning before trial 1
      addAssistantMessage(
        "Before we begin... a word about the rules.",
        baseDelay
      );

      addAssistantMessage(
        "This game is filled with lies. But here's a truth disguised as one:",
        baseDelay + 2000
      );

      addAssistantMessage(
        "The people you'll meet in these trials are real. Living their small, oblivious lives in their own little worlds.",
        baseDelay + 4500
      );

      addAssistantMessage(
        "They don't know they're part of this. They don't know about you.",
        baseDelay + 7000
      );

      addAssistantMessage("Not yet, anyway.", baseDelay + 9000);

      // Start playing creepy ambient music before convent trial
      isPlayingMusic = true;
      if (audioElement) {
        audioElement.play().catch((err) => {
          console.error("Audio playback failed:", err);
        });
      }

      // Start convent trial after the meta-horror setup
      const conventIntro = getConventIntro(playerName);
      conventIntro.forEach(({ delay, content, image }) => {
        addAssistantMessage(content, baseDelay + 10500 + delay, false, image);
      });

      // Add first encounter description and prompt
      const lastIntroDelay = conventIntro[conventIntro.length - 1].delay;
      addAssistantMessage(
        undefined,
        baseDelay + 10500 + lastIntroDelay + 2000,
        false,
        "/src/assets/trials/convent_encounter_1.webp"
      );
      addAssistantMessage(
        "A spider-nun hybrid blocks your path. Eight legs, eight eyes, but wearing the tattered remains of a habit. Its mandibles click hungrily as it spots you.",
        baseDelay + 10500 + lastIntroDelay + 2000
      );
      addAssistantMessage(
        "What do you do?",
        baseDelay + 10500 + lastIntroDelay + 4500
      );

      // Set up state for convent trial
      showInput = true;
      gameState = "convent";
      conventState = CONVENT_STATES.ENCOUNTER_1; // Skip INTRO since we already showed encounter 1 description
      return;
    }
  }

  const containerClass = css({
    display: "flex",
    flexDirection: "column",
    height: "85%",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    backgroundColor: "#0d0d1a",
    color: "#e0e0e0",
    fontFamily: "monospace",
    border: "2px solid #8b0000",
    borderRadius: "0.5rem",
    position: "relative",
    overflow: "hidden",
  });

  const sigilContainerClass = $derived(
    css({
      position: "absolute",
      bottom: showInput ? "7rem" : "1rem",
      left: "1rem",
      zIndex: 10,
      animation: "fadeIn 1s ease-in",
    })
  );

  const headerClass = css({
    padding: "1.5rem",
    backgroundColor: "#16161f",
    borderBottom: "2px solid #8b0000",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  });

  const titleClass = css({
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#c9c9d4",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: 0,
  });

  const subtitleClass = css({
    fontSize: "0.75rem",
    color: "#8b0000",
    letterSpacing: "0.15em",
    marginRight: "1em",
    margin: 0,
  });

  const messagesContainerClass = css({
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "1rem ",
    paddingBottom: "6rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    width: "100%",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#16161f",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#2a2a3e",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#3a3a4e",
    },
  });

  const inputContainerClass = css({
    padding: "1rem",
    backgroundColor: "#16161f",
    borderTop: "2px solid #8b0000",
  });

  const formClass = css({
    display: "flex",
    gap: "0.75rem",
  });

  const inputClass = css({
    flex: 1,
    padding: "0.75rem 1rem",
    backgroundColor: "#1a1a2e",
    border: "1px solid #2a2a3e",
    borderRadius: "0.375rem",
    color: "#e0e0e0",
    fontFamily: "monospace",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "#8b0000",
    },
    "&::placeholder": {
      color: "#666",
    },
  });

  const buttonClass = css({
    padding: "0.75rem 1.5rem",
    backgroundColor: "#8b0000",
    border: "none",
    borderRadius: "0.375rem",
    color: "#e0e0e0",
    fontFamily: "monospace",
    fontSize: "1.5rem",
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

  let {
    title = "iOuija73k",
    subtitle = randomSubtitle,
    onGameStateChange = undefined,
  } = $props();
</script>

<div class={containerClass}>
  <header class={headerClass}>
    <h1 class={titleClass}>{title}</h1>
    <p class={subtitleClass}>{subtitle}</p>
  </header>

  <div class={messagesContainerClass}>
    {#each messages as message}
      <ChatMessage
        role={message.role}
        content={message.content}
        showButton={message.showButton}
        onButtonClick={handleOkClick}
        showDemonName={gameState !== "initial"}
        {demonName}
        image={message.image}
        buttons={message.buttons}
      />
    {/each}
    <div bind:this={messagesEndRef}></div>
  </div>

  {#if showInput}
    <div class={inputContainerClass}>
      <form class={formClass} onsubmit={handleSubmit}>
        <input
          bind:this={inputRef}
          type="text"
          class={inputClass}
          bind:value={inputValue}
          placeholder={`Reply to ${demonName}`}
          autocomplete="off"
        />
        <button type="submit" class={buttonClass}>↑</button>
      </form>
    </div>
  {/if}

  {#if gameState !== "initial"}
    <div class={sigilContainerClass}>
      <PaimonSigil width="64px" height="64px" />
    </div>
  {/if}
</div>

<Confetti trigger={showConfetti} />

<!-- Hidden audio element for ambient music -->
<audio bind:this={audioElement} loop preload="auto" style="display: none;">
  <source src="/audio/dark-ambient.mp3" type="audio/mpeg" />
  <source src="/audio/dark-ambient.ogg" type="audio/ogg" />
</audio>

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
