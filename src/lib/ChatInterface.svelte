<script>
  import { css } from "../../styled-system/css";
  import ChatMessage from "./ChatMessage.svelte";
  import getBrowserDetails from "./helpers/getBrowserDetails";

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
  let gameState = $state("initial"); // initial, name_exchange, number_game, playing
  let playerName = $state("");
  let guessAttempt = $state(0);
  const numberGuesses = [37, 13, 17]; // Most common psychological picks

  function scrollToBottom() {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleOkClick() {
    // Remove button from first message
    messages[0].showButton = false;
    messages = [...messages];

    // Show input and add name request
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
      setTimeout(() => {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: `Nice to meet you, ${userInput}.`,
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 800);
      
      setTimeout(() => {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Before we begin... let me show you something. A little demonstration of what I can do.",
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 2000);
      
      setTimeout(() => {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Think of a number between 1 and 50. Both digits must be odd, and they must be different from each other.",
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 3500);
      
      setTimeout(() => {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Got it? Don't tell me. I already know. Just type anything when you're ready.",
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 5500);
    } else if (gameState === "number_game") {
      const lowerInput = userInput.toLowerCase().trim();
      
      // Check if user confirmed the guess
      if (guessAttempt > 0 && (lowerInput.includes("yes") || lowerInput.includes("yeah") || 
          lowerInput.includes("correct") || lowerInput.includes("right") || 
          lowerInput === "y" || numberGuesses[guessAttempt - 1].toString() === userInput.trim())) {
        gameState = "playing";
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: "Ha! Of course.",
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
              content: `That's what I do, ${playerName}. I know things. I see things.`,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, 2500);
        
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: `We're connected now. You and I. Let's begin...`,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, 4500);
        return;
      }
      
      // Try next guess or give up
      if (guessAttempt < numberGuesses.length) {
        const currentGuess = numberGuesses[guessAttempt];
        guessAttempt++;
        
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: guessAttempt === 1 ? "Your number is 37." : `Wait... ${currentGuess}?`,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, 1500);
        
        if (guessAttempt === 1) {
          setTimeout(() => {
            messages = [
              ...messages,
              {
                role: "assistant",
                content: "I'm right, aren't I?",
                showButton: false,
              },
            ];
            scrollToBottom();
          }, 3000);
        }
      } else {
        // Give up and use browser details
        gameState = "playing";
        const details = getBrowserDetails();
        
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: "Hm. You're a tricky one. I like that.",
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
              content: `But I can still see you, ${playerName}. Right now, it's ${details.timeOfDay} where you are. You're on ${details.browser}, ${details.os}. See? I know things.`,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, 2500);
        
        setTimeout(() => {
          messages = [
            ...messages,
            {
              role: "assistant",
              content: `You can't hide from me. Now... let's begin, ${playerName}.`,
              showButton: false,
            },
          ];
          scrollToBottom();
        }, 4500);
      }
    } else {
      // Simulate AI response (replace with actual API call later)
      setTimeout(() => {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: "Your words echo in the void...",
            showButton: false,
          },
        ];
        scrollToBottom();
      }, 1000);
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
