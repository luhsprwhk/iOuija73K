<script>
  import { css } from '../../styled-system/css';
  import ChatMessage from './ChatMessage.svelte';
  import PaimonSigil from './PaimonSigil.svelte';
  import Confetti from './Confetti.svelte';
  import LockoutScreen from './LockoutScreen.svelte';
  import AnimatedSubtitle from './AnimatedSubtitle.svelte';
  import getBrowserDetails from './helpers/getBrowserDetails';
  import { validateName } from './helpers/validateName';
  import {
    checkLockout,
    setLockout,
    clearLockout,
  } from './helpers/lockoutManager';
  import {
    handleNumberGuess,
    getNumberTrialIntro,
  } from '../trials/numberGuessing.js';
  import {
    handleConventInput,
    getConventIntro,
    getConventReveal,
    CONVENT_STATES,
  } from '../trials/convent.js';
  import {
    initializeHangmanGame,
    getHangmanIntro,
    getHangmanReveal,
    processGuess,
    getGameStatus,
    getGameInfo,
    getHangmanArt,
    getTimeRemaining,
    HANGMAN_STATES,
  } from '../trials/hangman.js';
  import {
    callClaude,
    formatMessagesForClaude,
    getClaudeApiKey,
  } from '../ai/claude.js';

  let animatedSubtitleRef = $state(null);

  let messages = $state([
    {
      role: 'assistant',
      content:
        "Hey! Want to play a game? It's pretty cool. I think you'll like it.",
      showButton: true,
    },
  ]);

  let inputValue = $state('');
  let messagesEndRef;
  let inputRef;
  let showInput = $state(false);
  let gameState = $state('initial'); // initial, name_exchange, number_game_intro, number_game, convent, hangman, playing
  let playerName = $state('');
  let demonName = $state('Raphael'); // False name initially, reveals as "Paimon" after first trial
  let guessAttempt = $state(0);
  let conventState = $state(CONVENT_STATES.INTRO);
  let hangmanState = $state(null); // Will be initialized when hangman trial starts
  let hangmanTimer = $state(null); // Interval for updating timer display
  let isProcessing = $state(false);
  let audioElement = $state(null);
  let isPlayingMusic = $state(false);
  let showConfetti = $state(false);
  let nameValidationAttempts = $state(0);
  let isLockedOut = $state(false);
  let lockoutTimeRemaining = $state(0);

  // Check for existing lockout on mount
  $effect(() => {
    const lockoutStatus = checkLockout();
    if (lockoutStatus.isLockedOut) {
      isLockedOut = true;
      lockoutTimeRemaining = lockoutStatus.remainingTime;
    }
  });


  function scrollToBottom() {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
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
  function addAssistantMessage(
    content,
    delay = 0,
    showButton = false,
    image = undefined,
    buttons = undefined
  ) {
    const addMessage = () => {
      messages = [
        ...messages,
        {
          role: 'assistant',
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
    if (showInput && gameState === 'name_exchange' && inputRef) {
      setTimeout(() => inputRef.focus(), 100);
    }
  });

  // Auto-focus input when Paimon asks "What do you do?"
  $effect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      showInput &&
      inputRef &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.content?.toLowerCase().includes('what do you do')
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
    if (gameState === 'initial') {
      // Initial game start - trigger subtitle animations
      animatedSubtitleRef?.start();
      showInput = true;
      gameState = 'name_exchange';

      setTimeout(() => {
        addAssistantMessage("Awesome! What's your name? Mine is Raphael.");
        // Trigger footer reveal after demon's name appears
        onGameStateChange?.(gameState);
      }, 500);
    } else if (gameState === 'number_game_intro') {
      // User clicked OK after thinking of number
      showInput = false; // Hide input, we'll use buttons
      gameState = 'number_game';

      // Make first guess
      const result = handleNumberGuess(null, 0, playerName, getBrowserDetails);

      // Add messages with buttons
      result.messages.forEach(({ delay, content, showButtons }) => {
        const buttons = showButtons
          ? [
              {
                label: 'Yes',
                value: true,
                onClick: (value) => handleNumberGuessResponse(value),
              },
              {
                label: 'No',
                value: false,
                onClick: (value) => handleNumberGuessResponse(value),
              },
            ]
          : undefined;
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
      { role: 'user', content: inputValue, showButton: false },
    ];
    const userInput = inputValue;
    inputValue = '';

    // Handle name exchange
    if (gameState === 'name_exchange') {
      // Validate the name
      if (!validateName(userInput)) {
        // Name validation failed
        nameValidationAttempts += 1;

        if (nameValidationAttempts >= 3) {
          // Three strikes - lock them out
          setLockout();
          isLockedOut = true;
          const lockoutStatus = checkLockout();
          lockoutTimeRemaining = lockoutStatus.remainingTime;
          return;
        }

        // Show different messages based on attempt number
        if (nameValidationAttempts === 1) {
          addAssistantMessage(
            "No, that's not your real name.",
            500
          );
          addAssistantMessage(
            "Try again. What's your actual name?",
            1500
          );
        } else if (nameValidationAttempts === 2) {
          addAssistantMessage(
            "Still lying to me? That's strike two.",
            500
          );
          addAssistantMessage(
            "One more fake name and we're done here. Your REAL name, please.",
            1500
          );
        }
        return; // Don't proceed, keep asking for name
      }

      // Name is valid, proceed
      playerName = userInput;
      gameState = 'number_game_intro';
      showInput = false; // Hide input until button is clicked

      // Get intro messages from number trial module
      const introMessages = getNumberTrialIntro(userInput);
      introMessages.forEach(({ delay, content, showButton }) => {
        addAssistantMessage(content, delay, showButton || false);
      });
    } else if (gameState === 'number_game') {
      // This shouldn't be reached anymore since we use buttons
      // But keep for backwards compatibility
      console.warn('Unexpected text input in number_game state');
    } else if (gameState === 'convent') {
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
        const revealMessages = getConventReveal();

        revealMessages.forEach(({ delay, content, image }) => {
          addAssistantMessage(content, lastDelay + delay, false, image);
        });
      }

      // If convent is complete, transition to hangman trial
      if (conventState === CONVENT_STATES.COMPLETE) {
        gameState = 'hangman';

        // Get hangman intro messages
        const hangmanIntro = getHangmanIntro(playerName);
        hangmanIntro.forEach(({ delay, content, image }) => {
          addAssistantMessage(content, delay, false, image);
        });

        // Calculate when to initialize game state (after intro completes)
        const lastIntroDelay = hangmanIntro[hangmanIntro.length - 1].delay;
        setTimeout(() => {
          hangmanState = initializeHangmanGame();
          // Add initial game info (without ASCII art)
          addAssistantMessage(getGameInfo(hangmanState));

          // Start timer countdown that updates the display every second
          startHangmanTimer();
        }, lastIntroDelay + 1000);
      }
    } else if (gameState === 'hangman') {
      // Handle hangman trial
      if (isProcessing || !hangmanState) return;

      isProcessing = true;

      // Process the guess
      const updatedState = processGuess(hangmanState, userInput);
      hangmanState = updatedState;

      // Show updated game info
      if (!updatedState.gameOver) {
        addAssistantMessage(getGameInfo(updatedState));
      } else {
        // Game over - stop timer and show reveal
        stopHangmanTimer();

        // Show reveal messages
        const revealMessages = getHangmanReveal(
          playerName,
          updatedState.won,
          updatedState.word
        );

        revealMessages.forEach(({ delay, content, audio }) => {
          if (audio) {
            // Play audio
            setTimeout(() => {
              const audioEl = new Audio(audio);
              audioEl.play().catch((err) => {
                console.error('Failed to play audio:', err);
              });
            }, delay);
          }
          if (content) {
            addAssistantMessage(content, delay);
          }
        });

        // Calculate last reveal message delay
        const lastRevealDelay =
          revealMessages.length > 0
            ? revealMessages[revealMessages.length - 1].delay
            : 0;

        // Transition to next phase (white room or playing state)
        setTimeout(() => {
          gameState = 'playing';
          addAssistantMessage(
            'You did well. Really well.',
            lastRevealDelay + 2000
          );
          addAssistantMessage(
            'Ready for the next trial?',
            lastRevealDelay + 4000
          );
        }, lastRevealDelay + 1000);
      }

      isProcessing = false;
    } else {
      // Default state - use Claude API for dynamic responses
      if (isProcessing) return;

      isProcessing = true;
      const apiKey = getClaudeApiKey();

      if (!apiKey) {
        setTimeout(() => {
          addAssistantMessage(
            '[API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file]'
          );
          isProcessing = false;
        }, 500);
        return;
      }

      // Call Claude API
      const conversationHistory = formatMessagesForClaude(messages);
      conversationHistory.push({ role: 'user', content: userInput });

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
   * Starts the hangman timer that updates display every second
   */
  function startHangmanTimer() {
    if (hangmanTimer) {
      clearInterval(hangmanTimer);
    }

    hangmanTimer = setInterval(() => {
      if (!hangmanState) return;

      const timeRemaining = getTimeRemaining(hangmanState);

      // Check if time expired
      if (timeRemaining <= 0 && !hangmanState.gameOver) {
        stopHangmanTimer();

        // Force game over
        hangmanState = {
          ...hangmanState,
          gameOver: true,
          won: false,
          timeExpired: true,
        };

        // Show reveal messages
        const revealMessages = getHangmanReveal(
          playerName,
          false,
          hangmanState.word
        );

        revealMessages.forEach(({ delay, content, audio }) => {
          if (audio) {
            setTimeout(() => {
              const audioEl = new Audio(audio);
              audioEl.play().catch((err) => {
                console.error('Failed to play audio:', err);
              });
            }, delay);
          }
          if (content) {
            addAssistantMessage(content, delay);
          }
        });

        const lastRevealDelay =
          revealMessages.length > 0
            ? revealMessages[revealMessages.length - 1].delay
            : 0;

        setTimeout(() => {
          gameState = 'playing';
          addAssistantMessage(
            'You did well. Really well.',
            lastRevealDelay + 2000
          );
          addAssistantMessage(
            'Ready for the next trial?',
            lastRevealDelay + 4000
          );
        }, lastRevealDelay + 1000);
      } else if (!hangmanState.gameOver) {
        // Update the last message with current game info
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          // Replace the last assistant message with updated info
          messages[messages.length - 1] = {
            ...lastMessage,
            content: getGameInfo(hangmanState),
          };
          messages = [...messages];
        }
      }
    }, 1000);
  }

  /**
   * Stops the hangman timer
   */
  function stopHangmanTimer() {
    if (hangmanTimer) {
      clearInterval(hangmanTimer);
      hangmanTimer = null;
    }
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
      demonName = 'Paimon';
      // Trigger confetti celebration
      showConfetti = true;
      setTimeout(() => {
        showConfetti = false;
      }, 3500);
    }

    // Add all response messages with their delays
    result.messages.forEach(({ delay, content, showButtons }) => {
      const buttons = showButtons
        ? [
            {
              label: 'Yes',
              value: true,
              onClick: (value) => handleNumberGuessResponse(value),
            },
            {
              label: 'No',
              value: false,
              onClick: (value) => handleNumberGuessResponse(value),
            },
          ]
        : undefined;
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
        'Before we begin... a word about the rules.',
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

      addAssistantMessage('Not yet, anyway.', baseDelay + 9000);

      // Start playing creepy ambient music before convent trial
      isPlayingMusic = true;
      if (audioElement) {
        audioElement.play().catch((err) => {
          console.error('Audio playback failed:', err);
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
        '/src/assets/trials/convent_encounter_1.webp'
      );
      addAssistantMessage(
        'A spider-nun hybrid blocks your path. Eight legs, eight eyes, but wearing the tattered remains of a habit. Its mandibles click hungrily as it spots you.',
        baseDelay + 10500 + lastIntroDelay + 2000
      );
      addAssistantMessage(
        'What do you do?',
        baseDelay + 10500 + lastIntroDelay + 4500
      );

      // Set up state for convent trial
      showInput = true;
      gameState = 'convent';
      conventState = CONVENT_STATES.ENCOUNTER_1; // Skip INTRO since we already showed encounter 1 description
      return;
    }
  }

  const containerClass = css({
    display: 'flex',
    flexDirection: 'column',
    height: '85%',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    backgroundColor: '#0d0d1a',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    border: '2px solid #8b0000',
    borderRadius: '0.5rem',
    position: 'relative',
    overflow: 'hidden',
  });

  const sigilContainerClass = $derived(
    css({
      position: 'absolute',
      bottom: showInput ? '7rem' : '1rem',
      left: '1rem',
      zIndex: 10,
      animation: 'fadeIn 1s ease-in',
    })
  );

  const hangmanArtContainerClass = $derived(
    css({
      position: 'absolute',
      bottom: showInput ? '7rem' : '1rem',
      right: '1rem',
      zIndex: 10,
      animation: 'fadeIn 1s ease-in',
      backgroundColor: 'rgba(22, 22, 31, 0.9)',
      border: '2px solid #8b0000',
      borderRadius: '0.5rem',
      padding: '1rem',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      color: '#e0e0e0',
      whiteSpace: 'pre',
      lineHeight: '1.2',
    })
  );

  const headerClass = css({
    padding: '1.5rem',
    backgroundColor: '#16161f',
    borderBottom: '2px solid #8b0000',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const titleClass = css({
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#c9c9d4',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    margin: 0,
  });


  const messagesContainerClass = css({
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '1rem ',
    paddingBottom: '6rem',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#16161f',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#2a2a3e',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#3a3a4e',
    },
  });

  const inputContainerClass = css({
    padding: '1rem',
    backgroundColor: '#16161f',
    borderTop: '2px solid #8b0000',
  });

  const formClass = css({
    display: 'flex',
    gap: '0.75rem',
  });

  const inputClass = css({
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '0.375rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: '#8b0000',
    },
    '&::placeholder': {
      color: '#666',
    },
  });

  const buttonClass = css({
    padding: '0.75rem 1.5rem',
    backgroundColor: '#8b0000',
    border: 'none',
    borderRadius: '0.375rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    '&:hover': {
      backgroundColor: '#a00000',
    },
    '&:active': {
      backgroundColor: '#6b0000',
    },
  });

  let {
    title = 'iOuija73k',
    onGameStateChange = undefined,
  } = $props();

  /**
   * Handle lockout expiration
   */
  function handleUnlock() {
    clearLockout();
    isLockedOut = false;
    nameValidationAttempts = 0;
    // Reload the page to start fresh
    window.location.reload();
  }
</script>

{#if isLockedOut}
  <LockoutScreen timeRemaining={lockoutTimeRemaining} onUnlock={handleUnlock} />
{:else}
<div class={containerClass}>
  <header class={headerClass}>
    <h1 class={titleClass}>{title}</h1>
    <AnimatedSubtitle bind:this={animatedSubtitleRef} />
  </header>

  <div class={messagesContainerClass}>
    {#each messages as message}
      <ChatMessage
        role={message.role}
        content={message.content}
        showButton={message.showButton}
        onButtonClick={handleOkClick}
        showDemonName={gameState !== 'initial'}
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

  {#if gameState !== 'initial'}
    <div class={sigilContainerClass}>
      <PaimonSigil width="64px" height="64px" />
    </div>
  {/if}

  {#if gameState === 'hangman' && hangmanState && !hangmanState.gameOver}
    <div class={hangmanArtContainerClass}>
      {getHangmanArt(hangmanState.wrongGuesses)}
    </div>
  {/if}
</div>
{/if}

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

  /* Subtle, rare pulse to draw attention without distraction */
  @keyframes subtlePulse {
    0%,
    96% {
      text-shadow: none;
    }
    97% {
      text-shadow: 0 0 4px rgba(139, 0, 0, 0.4);
    }
    98% {
      text-shadow: 0 0 8px rgba(139, 0, 0, 0.6);
    }
    100% {
      text-shadow: none;
    }
  }

  /* Shimmer underline used by subtitleClass ::after */
  @keyframes shimmerUnderline {
    0%,
    96% {
      background-position: 0% 0;
      opacity: 0.9;
    }
    97% {
      background-position: 100% 0;
      opacity: 1;
    }
    100% {
      background-position: 100% 0;
      opacity: 0.9;
    }
  }
</style>
