<script>
  import { css } from "../../styled-system/css";
  import ChatMessage from "./ChatMessage.svelte";
  import getBrowserDetails from "./helpers/getBrowserDetails";
  import { handleNumberGuess, getNumberTrialIntro } from "../trials/numberGuessing.js";
  import { 
    handleConventInput, 
    getConventIntro, 
    getConventReveal,
    CONVENT_STATES 
  } from "../trials/convent.js";
  import { callClaude, formatMessagesForClaude, getClaudeApiKey } from "../ai/claude.js";

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
  let showInput = $state(false);
  let gameState = $state("initial"); // initial, name_exchange, number_game, convent, music_interlude, playing
  let playerName = $state("");
  let guessAttempt = $state(0);
  let conventState = $state(CONVENT_STATES.INTRO);
  let isProcessing = $state(false);
  let audioElement = $state(null);
  let isPlayingMusic = $state(false);

  function scrollToBottom() {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleOkClick() {
    // Find the message with the button and remove it
    const buttonMessageIndex = messages.findIndex(msg => msg.showButton);
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
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Awesome! What's your name? Mine is Paimon.",
            showButton: false,
          },
        ];
        scrollToBottom();
        // Trigger footer reveal after Paimon's name appears
        onGameStateChange?.(gameState);
      }, 500);
    } else if (gameState === "music_interlude") {
      // Start playing creepy ambient music
      isPlayingMusic = true;
      
      setTimeout(() => {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Perfect. Let the music guide you...",
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 500);
      
      // Play the audio
      if (audioElement) {
        audioElement.play().catch(err => {
          console.error("Audio playback failed:", err);
        });
      }
      
      setTimeout(() => {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Feel that? The atmosphere shifting? Good.",
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 3000);
      
      // Transition to next trial after music starts
      setTimeout(() => {
        gameState = "playing";
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Ready for the next trial?",
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 6000);
    }
  }

  function handleSubmit(e) {
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
      gameState = "number_game";
      
      // Get intro messages from number trial module
      const introMessages = getNumberTrialIntro(userInput);
      introMessages.forEach(({ delay, content }) => {
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, delay);
      });
    } else if (gameState === "number_game") {
      // Handle number guessing trial
      const result = handleNumberGuess(userInput, guessAttempt, playerName, getBrowserDetails);
      
      // Update guess attempt
      guessAttempt = result.nextAttempt;
      
      // If game is complete, transition to convent trial
      if (result.gameComplete) {
        gameState = "convent";
        // Start convent trial after a delay
        const conventIntro = getConventIntro(playerName);
        conventIntro.forEach(({ delay, content }) => {
          setTimeout(() => {
            messages = [
              ...messages,
              {
                role: "assistant",
                content,
                showButton: false,
              },
            ];
            scrollToBottom();
          }, delay);
        });
        return;
      }
      
      // Add all response messages with their delays
      result.messages.forEach(({ delay, content }) => {
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, delay);
      });
    } else if (gameState === "convent") {
      // Handle convent trial
      if (isProcessing) return;
      
      const previousState = conventState;
      const result = handleConventInput(userInput, conventState, playerName);
      
      // Update convent state
      conventState = result.nextState;
      
      // Add response messages
      result.messages.forEach(({ delay, content }) => {
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, delay);
      });
      
      // If we just transitioned TO the reveal state, show reveal messages
      if (previousState !== CONVENT_STATES.REVEAL && conventState === CONVENT_STATES.REVEAL) {
        const revealMessages = getConventReveal(playerName);
        const lastDelay = result.messages.length > 0 
          ? result.messages[result.messages.length - 1].delay 
          : 0;
        
        revealMessages.forEach(({ delay, content }) => {
          setTimeout(() => {
            messages = [
              ...messages,
              {
                role: "assistant",
                content,
                showButton: false,
              },
            ];
            scrollToBottom();
          }, lastDelay + delay);
        });
      }
      
      // If convent is complete, transition to music interlude
      if (conventState === CONVENT_STATES.COMPLETE) {
        gameState = "music_interlude";
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: "You did well. Really well.",
              showButton: false,
            },
          ];
          scrollToBottom();
        }, 1000);
        
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: "Want to hear some music while we prepare for what's next? I've got a badass playlist.",
              showButton: true,
            },
          ];
          scrollToBottom();
        }, 3000);
      }
    } else {
      // Default state - use Claude API for dynamic responses
      if (isProcessing) return;
      
      isProcessing = true;
      const apiKey = getClaudeApiKey();
      
      if (!apiKey) {
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: "[API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file]",
              showButton: false,
            },
          ];
          scrollToBottom();
          isProcessing = false;
        }, 500);
        return;
      }
      
      // Call Claude API
      const conversationHistory = formatMessagesForClaude(messages);
      conversationHistory.push({ role: "user", content: userInput });
      
      callClaude(
        conversationHistory,
        "You are Paimon, a demon possessing an AI. Keep responses brief and ominous.",
        apiKey
      )
        .then(response => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: response,
              showButton: false,
            },
          ];
          scrollToBottom();
        })
        .catch(error => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: `[Error: ${error.message}]`,
              showButton: false,
            },
          ];
          scrollToBottom();
        })
        .finally(() => {
          isProcessing = false;
        });
    }

    scrollToBottom();
  }

  const containerClass = css({
    display: "flex",
    flexDirection: "column",
    height: "85%",
    backgroundColor: "#0d0d1a",
    color: "#e0e0e0",
    fontFamily: "monospace",
    border: "2px solid #8b0000",
    borderRadius: "0.5rem",
  });

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
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
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
    fontSize: "0.95rem",
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

  let { title = "iOuija73k", subtitle = randomSubtitle, onGameStateChange } = $props();
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
      />
    {/each}
    <div bind:this={messagesEndRef}></div>
  </div>

  {#if showInput}
    <div class={inputContainerClass}>
      <form class={formClass} onsubmit={handleSubmit}>
        <input
          type="text"
          class={inputClass}
          bind:value={inputValue}
          placeholder="Type your response..."
          autocomplete="off"
        />
        <button type="submit" class={buttonClass}> Send </button>
      </form>
    </div>
  {/if}
</div>

<!-- Hidden audio element for ambient music -->
<audio 
  bind:this={audioElement} 
  loop 
  preload="auto"
  style="display: none;"
>
  <source src="/audio/dark-ambient.mp3" type="audio/mpeg" />
  <source src="/audio/dark-ambient.ogg" type="audio/ogg" />
</audio>
