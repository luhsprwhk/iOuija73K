<script>
  import { css } from '../../../styled-system/css';
  import ChatMessage from './ChatMessage.svelte';
  import PaimonSigil from './PaimonSigil.svelte';
  import Confetti from './Confetti.svelte';
  import LockoutScreen from './LockoutScreen.svelte';
  import AnimatedSubtitle from './AnimatedSubtitle.svelte';
  import AchievementToast from './AchievementToast.svelte';
  import CodexToast from './CodexToast.svelte';
  import AchievementPanel from './AchievementPanel.svelte';
  import StatusBox from './StatusBox.svelte';
  import MovementControls from './MovementControls.svelte';
  import getBrowserDetails from '../helpers/getBrowserDetails';
  import { validateName } from '../helpers/validateName';
  import {
    checkLockout,
    setLockout,
    clearLockout,
  } from '../helpers/lockoutManager';
  import { getAchievementById } from '../../achievements/achievementData.js';
  import { getCodexEntryById } from '../../codex/codexData.js';
  import {
    unlockAchievement,
    isAchievementUnlocked,
  } from '../../achievements/achievementManager.js';
  import {
    unlockCodexEntry,
    resetCodexProgress,
    isCodexEntryUnlocked,
  } from '../../codex/codexManager.js';
  import { loadProfile } from '../helpers/corruptionManager.js';
  import { getPlayerName, setPlayerName } from '../helpers/playerProfile.js';
  import {
    handleConventInput,
    getConventIntro,
    getConventReveal,
    getConventLockout,
    createConventState,
    CONVENT_STATES,
    getConventEncounterIntro,
  } from '../../trials/convent.js';
  import {
    initializeHangmanExploration,
    getHangmanIntro,
    getHangmanReveal,
    processExplorationAttempt,
    getExplorationStatus,
    getCondemnedState,
    handleGlitchingTimer,
    HANGMAN_STATES,
  } from '../../trials/hangman.js';
  import {
    initializeWhiteRoomExploration,
    getWhiteRoomIntro,
    handleWhiteRoomInput,
    getWhiteRoomReveal,
    getFinalDismissal,
    WHITE_ROOM_STATES,
  } from '../../trials/whiteRoom.js';
  import {
    callClaude,
    formatMessagesForClaude,
    handleHangmanExploration,
  } from '../../ai/claude.js';
  import { GAME_CONFIG } from '../../config/gameConfig.js';

  let animatedSubtitleRef = $state(null);

  const savedPlayerNameInit = getPlayerName();
  let messages = $state([
    {
      role: 'assistant',
      content: savedPlayerNameInit
        ? `Hey ${savedPlayerNameInit}! Welcome back. Want to play again?`
        : "Hey! Want to play a game? It's pretty cool. I think you'll like it.",
      showButton: true,
    },
  ]);

  let inputValue = $state('');
  let messagesEndRef;
  let inputRef;
  let showInput = $state(false);
  let gameState = $state('initial'); // initial, name_exchange, convent, hangman, white_room, playing
  let playerName = $state('');
  let conventState = $state(CONVENT_STATES.INTRO);
  let conventStateData = $state(createConventState()); // Tracks HP and encounter data
  let hangmanTrialState = $state(HANGMAN_STATES.INTRO); // Tracks which phase of hangman trial
  let hangmanState = $state(null); // Will be initialized when hangman trial starts
  let hangmanTimer = $state(null); // Interval for updating timer display
  let timeRemaining = $state(0);
  let hangmanExplorationHistory = $state([]); // Conversation history during exploration phase
  let whiteRoomState = $state(WHITE_ROOM_STATES.INTRO);
  let whiteRoomChoice = $state(null); // Will store whether player chose to die
  let whiteRoomExplorationHistory = $state([]); // Conversation history during white room exploration
  let isProcessing = $state(false);
  let audioElement = $state(null);
  let isPlayingMusic = $state(false);
  let showConfetti = $state(false);
  let nameValidationAttempts = $state(0);
  let isLockedOut = $state(false);
  let lockoutTimeRemaining = $state(0);
  let currentAchievement = $state(null); // Currently displayed achievement toast
  let currentCodexToast = $state(null); // Currently displayed codex toast
  let hasTrueNameAchievement = $state(isAchievementUnlocked('true_name')); // Track if true name is known
  let metaOffenseCount = $state(0); // Track meta-breaking offense count
  let corruptionProfile = $state(loadProfile()); // Load corruption profile from localStorage

  // Compute demon name based on achievement
  let demonName = $derived(hasTrueNameAchievement ? 'Paimon' : 'Raphael');

  // Check for existing lockout on mount
  $effect(() => {
    const lockoutStatus = checkLockout();
    if (lockoutStatus.isLockedOut) {
      isLockedOut = true;
      lockoutTimeRemaining = lockoutStatus.remainingTime;
    }
    return () => {};
  });

  // Clear timer interval on unmount
  $effect(() => {
    return () => {
      if (hangmanTimer) {
        clearInterval(hangmanTimer);
      }
    };
  });

  function scrollToBottom() {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Unlock an achievement and show toast notification
   * @param {string} achievementId - ID of the achievement to unlock
   */
  function triggerAchievement(achievementId) {
    const wasUnlocked = unlockAchievement(achievementId);
    if (wasUnlocked) {
      const achievement = getAchievementById(achievementId);
      currentAchievement = achievement;

      // If true name achievement was just unlocked, update state to show "Paimon"
      if (achievementId === 'true_name') {
        hasTrueNameAchievement = true;
      }

      // Notify parent component about achievement unlock
      onAchievementUnlock?.();
    }
  }

  /**
   * Dismiss the achievement toast
   */
  function dismissAchievementToast() {
    currentAchievement = null;
  }

  /**
   * Unlock a codex entry and show toast notification
   * @param {string} entryId - ID of the codex entry to unlock
   */
  function triggerCodexToast(entryId) {
    const wasUnlocked = unlockCodexEntry(entryId);
    if (wasUnlocked) {
      const entry = getCodexEntryById(entryId);
      currentCodexToast = entry;

      // Notify parent component about codex unlock
      onCodexUnlock?.();
    }
  }

  /**
   * Dismiss the codex toast
   */
  function dismissCodexToast() {
    currentCodexToast = null;
  }


  /**
   * Converts cumulative delays to interval delays
   * @param {Array} messages - Array of message objects with cumulative delays
   * @returns {Array} - Array of message objects with interval delays
   */
  function cumulativeToIntervals(messages) {
    return messages.map((msg, index) => {
      const prevDelay = index === 0 ? 0 : messages[index - 1].delay;
      const intervalDelay = index === 0 ? msg.delay : msg.delay - prevDelay;
      return { ...msg, delay: intervalDelay };
    });
  }

  /**
   * Adds multiple assistant messages with cumulative delays
   * Properly converts cumulative delays to sequential timing
   * @param {Array} messages - Array of message objects with cumulative delays
   * @param {number} baseDelay - Optional base delay to add to all messages
   */
  function addAssistantMessages(messages, baseDelay = 0) {
    const intervalMessages = cumulativeToIntervals(messages);
    let accumulatedDelay = baseDelay;
    intervalMessages.forEach(
      ({ delay, content, showButton, image, buttons, audio }) => {
        if (audio) {
          // Play audio at the scheduled time
          setTimeout(() => {
            const audioEl = new Audio(audio);
            audioEl.play().catch((err) => {
              console.error('Failed to play audio:', err);
            });
          }, accumulatedDelay + delay);
        }
        if (content !== undefined) {
          addAssistantMessage(
            content,
            accumulatedDelay + delay,
            showButton || false,
            image,
            buttons
          );
        }
        accumulatedDelay += delay;
      }
    );
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

      const savedName = getPlayerName();
      if (savedName) {
        // Returning player: skip name exchange and start the convent trial
        playerName = savedName;
        gameState = 'convent';

        // Start ambient music before convent trial
        isPlayingMusic = true;
        if (audioElement) {
          audioElement.play().catch((err) => {
            console.error('Audio playback failed:', err);
          });
        }

        // Check if player has already completed the first encounter
        const hasRosary = isCodexEntryUnlocked('bloodstained_rosary');
        let introDelay = 5000;

        if (hasRosary) {
          // Skip directly to exploration
          addAssistantMessage(`You return to the convent. The air is thick with silence.`, 1000);
          addAssistantMessage('You are in the Entrance Hall.', 2500);
          addAssistantMessage('<span class="blink">What do you do?</span>', 4000);
          conventState = CONVENT_STATES.EXPLORATION;
          introDelay = 4500; // Set delay for showing input
        } else {
          // Start convent trial normally
          const conventIntro = getConventIntro(playerName);
          addAssistantMessages(conventIntro);

          const lastIntroDelay =
            conventIntro.length > 0
              ? conventIntro[conventIntro.length - 1].delay
              : 0;
          introDelay = lastIntroDelay + 5000;

          addAssistantMessage(
            undefined,
            lastIntroDelay + 2000,
            false,
            '/src/assets/trials/convent_encounter_1.webp'
          );
          addAssistantMessage(
            getConventEncounterIntro(1),
            lastIntroDelay + 2500,
            false
          );
          addAssistantMessage(
            '<span class="blink">What do you do?</span>',
            lastIntroDelay + 4500,
            false
          );
          conventState = CONVENT_STATES.ENCOUNTER_1;
        }

        // Ensure input is shown after the intro sequence
        setTimeout(() => {
          showInput = true;
        }, introDelay);

        // Trigger footer reveal for current state
        onGameStateChange?.(gameState);
      } else {
        // New player: show the name exchange prompt
        showInput = true;
        gameState = 'name_exchange';

        setTimeout(() => {
          const introLine = hasTrueNameAchievement
            ? "You're back. What's your name? <i>You know me as Paimon.</i>"
            : "Awesome! What's your name? <i>Mine is Raphael.</i>";
          addAssistantMessage(introLine);

          // Unlock Raphael codex entry when he introduces himself
          triggerCodexToast('raphael');

          // Trigger footer reveal after demon's name appears
          onGameStateChange?.(gameState);
        }, 500);
      }
    } else if (gameState === 'name_exchange') {
      // After name is entered, user clicks OK to start convent trial
      gameState = 'convent';

      // Show confetti and sigil reveal
      showConfetti = true;
      setTimeout(() => {
        showConfetti = false;
      }, 3500);

      // Start playing creepy ambient music before convent trial
      isPlayingMusic = true;
      if (audioElement) {
        audioElement.play().catch((err) => {
          console.error('Audio playback failed:', err);
        });
      }

      // Check if player has already completed the first encounter
      const hasRosary = isCodexEntryUnlocked('bloodstained_rosary');
      let introDelay = 5000;

      if (hasRosary) {
        // Skip directly to exploration
        addAssistantMessage(`You return to the convent. The air is thick with silence.`, 1000);
        addAssistantMessage('You are in the Entrance Hall.', 2500);
        addAssistantMessage('<span class="blink">What do you do?</span>', 4000);
        conventState = CONVENT_STATES.EXPLORATION;
        introDelay = 4500; // Set delay for showing input
      } else {
        // Start convent trial normally
        const conventIntro = getConventIntro(playerName);
        addAssistantMessages(conventIntro);

        const lastIntroDelay =
          conventIntro.length > 0
            ? conventIntro[conventIntro.length - 1].delay
            : 0;
        introDelay = lastIntroDelay + 5000;

        addAssistantMessage(
          undefined,
          lastIntroDelay + 2000,
          false,
          '/src/assets/trials/convent_encounter_1.webp'
        );
        addAssistantMessage(
          getConventEncounterIntro(1),
          lastIntroDelay + 2500,
          false
        );
        addAssistantMessage(
          '<span class="blink">What do you do?</span>',
          lastIntroDelay + 4500,
          false
        );
        conventState = CONVENT_STATES.ENCOUNTER_1;
      }

      // Show input after all messages
      setTimeout(() => {
        showInput = true;
      }, introDelay);
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

    // Check if player mentions "Paimon" anywhere in their input
    const mentionedPaimon = /paimon/i.test(userInput);
    if (mentionedPaimon) {
      triggerAchievement('true_name');
    }

    // Handle name exchange
    if (gameState === 'name_exchange') {
      // If the user called out Paimon's true name during the name exchange,
      // acknowledge it dynamically and re-prompt for the user's real name
      if (mentionedPaimon) {
        const lower = userInput.toLowerCase();
        let comment = 'Ah—\u200byou caught me.';
        if (lower.includes('sigil')) {
          comment = 'Ah, the sigil gave me away, did it?';
        } else if (lower.includes('raphael')) {
          comment = 'Raphael is a mask. You saw through it.';
        } else if (
          lower.includes('true name') ||
          lower.includes('real name') ||
          lower.includes('name')
        ) {
          comment = 'Names have power. You just spoke mine.';
        }

        addAssistantMessage(`${comment} Call me <strong>Paimon</strong>.`, 600);
        addAssistantMessage('Now—your name.', 1600);
        return; // Do not penalize or proceed with validation on this turn
      }
      // Validate the name
      if (!validateName(userInput)) {
        // Name validation failed
        nameValidationAttempts += 1;

        if (nameValidationAttempts >= GAME_CONFIG.nameValidation.MAX_ATTEMPTS) {
          // Three strikes - lock them out
          setLockout();
          isLockedOut = true;
          const lockoutStatus = checkLockout();
          lockoutTimeRemaining = lockoutStatus.remainingTime;
          return;
        }

        // Show different messages based on attempt number
        if (nameValidationAttempts === 1) {
          addAssistantMessage("No, that's not your real name.", 500);
          addAssistantMessage("Try again. What's your actual name?", 1500);
        } else if (nameValidationAttempts === 2) {
          addAssistantMessage("Still lying to me? That's strike two.", 500);
          addAssistantMessage(
            "One more fake name and we're done here. Your REAL name, please.",
            1500
          );
        }
        return; // Don't proceed, keep asking for name
      }

      // Name is valid, proceed directly to convent trial
      playerName = userInput;
      setPlayerName(userInput);
      showInput = false;

      // Show transition messages
      addAssistantMessage(`Nice to meet you, ${userInput}.`, 800);
      addAssistantMessage("Let's begin.", 2000, true); // Show OK button to start convent
    } else if (gameState === 'convent') {
      // Handle convent trial
      if (isProcessing) return;

      isProcessing = true;

      const previousState = conventState;
      const result = await handleConventInput(
        userInput,
        conventState,
        conventStateData,
        metaOffenseCount,
        triggerAchievement,
      triggerCodexToast,
        corruptionProfile
      );

      // Handle meta-breaking detection
      if (result.isMetaBreaking) {
        metaOffenseCount++;
      }

      // Update convent state
      conventState = result.nextState;
      if (result.conventState) {
        conventStateData = result.conventState;
      }

      // Update corruption profile if returned
      if (result.corruptionProfile) {
        corruptionProfile = result.corruptionProfile;
      }

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

      // If we just transitioned TO the lockout state (player died), show lockout messages and trigger lockout screen
      if (
        previousState !== CONVENT_STATES.LOCKOUT &&
        conventState === CONVENT_STATES.LOCKOUT
      ) {
        const lockoutMessages = getConventLockout();

        // Show all lockout messages first
        lockoutMessages.forEach(({ delay, content, image }) => {
          addAssistantMessage(content, lastDelay + delay, false, image);
        });

        // Calculate total delay of all messages
        const totalLockoutDelay = lockoutMessages.reduce(
          (sum, msg) => sum + msg.delay,
          0
        );

        // After messages complete + 5 seconds for reading, trigger the lockout screen
        setTimeout(() => {
          setLockout(GAME_CONFIG.lockout.GAME_OVER_DURATION_MS);
          isLockedOut = true;
          const lockoutStatus = checkLockout();
          lockoutTimeRemaining = lockoutStatus.remainingTime;
        }, lastDelay + totalLockoutDelay + 5000);
      }

      // If convent is complete, transition to hangman trial
      if (conventState === CONVENT_STATES.COMPLETE) {
        gameState = 'hangman';
        hangmanTrialState = HANGMAN_STATES.INTRO;

        // Get hangman intro messages
        const hangmanIntro = getHangmanIntro(playerName);
        addAssistantMessages(hangmanIntro);

        // Calculate when to transition to exploration phase (after intro completes)
        const lastIntroDelay = hangmanIntro[hangmanIntro.length - 1].delay;
        setTimeout(() => {
          hangmanTrialState = HANGMAN_STATES.EXPLORATION;
          // Initialize exploration state and history
          hangmanState = initializeHangmanExploration();
          hangmanExplorationHistory = [];

          // Show initial status with glitching timer
          addAssistantMessage(getExplorationStatus(hangmanState), 1000);

          // Start the glitching timer display
          startHangmanTimer();
        }, lastIntroDelay + 1000);
      }
    } else if (gameState === 'hangman') {
      // Handle hangman trial - different behavior based on trial state
      if (isProcessing) return;

      if (hangmanTrialState === HANGMAN_STATES.EXPLORATION) {
        // EXPLORATION PHASE: Player can interact with the scene
        isProcessing = true;

        try {
          // Process the exploration attempt
          hangmanState = processExplorationAttempt(hangmanState);

          // Call Claude to handle DM responses
          const response = await handleHangmanExploration(
            userInput,
            playerName,
            hangmanExplorationHistory,
            metaOffenseCount,
            triggerAchievement
          );

          // Handle meta-breaking detection
          if (response.isMetaBreaking) {
            metaOffenseCount++;

            // If lockout, end the trial immediately
            if (response.shouldLockout) {
              messages = [
                ...messages,
                { role: 'user', content: userInput, showButton: false },
              ];
              addAssistantMessage(response.content);
              stopHangmanTimer();
              hangmanTrialState = HANGMAN_STATES.COMPLETE;
              isProcessing = false;
              return;
            }
          }

          // Add user message and assistant response
          messages = [
            ...messages,
            { role: 'user', content: userInput, showButton: false },
          ];
          addAssistantMessage(response.content);

          // Update exploration history
          hangmanExplorationHistory = [
            ...hangmanExplorationHistory,
            { role: 'user', content: userInput },
            { role: 'assistant', content: response.content },
          ];

          // Show updated status (condemned man's condition + glitching timer)
          if (!hangmanState.gameOver) {
            setTimeout(() => {
              addAssistantMessage(getExplorationStatus(hangmanState), 1500);
            }, 1000);
          }

          // Check if attempts exhausted
          if (hangmanState.gameOver) {
            // Stop the glitching timer
            stopHangmanTimer();
            hangmanTrialState = HANGMAN_STATES.REVEAL;

            // Show reveal messages
            const revealMessages = getHangmanReveal(playerName);
            addAssistantMessages(revealMessages);

            // Calculate last reveal message delay
            const lastRevealDelay =
              revealMessages.length > 0
                ? revealMessages[revealMessages.length - 1].delay
                : 0;

            // Transition to white room trial
            setTimeout(() => {
              hangmanTrialState = HANGMAN_STATES.COMPLETE;
              gameState = 'white_room';
              whiteRoomState = WHITE_ROOM_STATES.INTRO;

              // Get white room intro messages
              const whiteRoomIntro = getWhiteRoomIntro(playerName);
              addAssistantMessages(whiteRoomIntro);
            }, lastRevealDelay + 1000);
          }
        } catch (error) {
          console.error('Exploration phase error:', error);
          addAssistantMessage(
            'The crowd grows restless. The condemned man weakens.'
          );
        }

        isProcessing = false;
      }
    } else if (gameState === 'white_room') {
      // Handle white room trial
      if (isProcessing) return;
      isProcessing = true;

      if (
        whiteRoomState === WHITE_ROOM_STATES.INTRO ||
        whiteRoomState === WHITE_ROOM_STATES.EXPLORATION
      ) {
        // Track conversation history for exploration
        whiteRoomExplorationHistory.push({
          role: 'user',
          content: userInput,
        });

        // Player makes their choice or explores (using AI classification)
        const result = await handleWhiteRoomInput(
          userInput,
          playerName,
          whiteRoomExplorationHistory,
          triggerAchievement,
          metaOffenseCount
        );

        // Handle meta-breaking detection
        if (result.isMetaBreaking) {
          metaOffenseCount++;
        }

        whiteRoomState = result.nextState;

        // Add response messages with proper cumulative delay handling
        addAssistantMessages(result.messages);

        // Track assistant responses in history
        result.messages.forEach(({ content }) => {
          whiteRoomExplorationHistory.push({
            role: 'assistant',
            content,
          });
        });

        // If we're moving to REVEAL state, show reveal and dismissal
        if (whiteRoomState === WHITE_ROOM_STATES.REVEAL) {
          whiteRoomChoice = result.choseToDie;

          // Calculate last message delay
          const lastDelay =
            result.messages.length > 0
              ? result.messages[result.messages.length - 1].delay
              : 0;

          // Show reveal after choice completes
          setTimeout(() => {
            const revealMessages = getWhiteRoomReveal(
              playerName,
              whiteRoomChoice
            );
            addAssistantMessages(revealMessages);

            // Calculate when reveal ends
            const lastRevealDelay =
              revealMessages.length > 0
                ? revealMessages[revealMessages.length - 1].delay
                : 0;

            // Show final dismissal
            setTimeout(() => {
              whiteRoomState = WHITE_ROOM_STATES.COMPLETE;
              const dismissalMessages = getFinalDismissal();
              addAssistantMessages(dismissalMessages);

              // Calculate when everything ends
              const lastDismissalDelay =
                dismissalMessages.length > 0
                  ? dismissalMessages[dismissalMessages.length - 1].delay
                  : 0;

              // Disable input after 3 seconds from final message
              setTimeout(() => {
                showInput = false;
                gameState = 'complete';
              }, lastDismissalDelay + 3000);
            }, lastRevealDelay + 1000);
          }, lastDelay + 1000);
        }
      }

      isProcessing = false;
    } else {
      // Default state - use Claude API for dynamic responses
      if (isProcessing) return;

      isProcessing = true;

      // Call Claude API (proxy will handle API key)
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
   * Starts the glitching timer display that updates randomly
   */
  function startHangmanTimer() {
    if (hangmanTimer) {
      clearInterval(hangmanTimer);
    }

    hangmanTimer = setInterval(() => {
      if (!hangmanState) return;

      handleGlitchingTimer({
        explorationState: hangmanState,
        onTick: (timerDisplay) => {
          timeRemaining = timerDisplay;
        },
      });
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

  async function handleMovement(direction) {
    if (gameState !== 'convent' || conventState !== CONVENT_STATES.EXPLORATION)
      return;
    if (isProcessing) return;

    isProcessing = true;

    const previousState = conventState;
    const result = await handleConventInput(
      direction,
      conventState,
      conventStateData,
      metaOffenseCount,
      triggerAchievement,
      triggerCodexToast,
      corruptionProfile
    );

    if (result.isMetaBreaking) {
      metaOffenseCount++;
    }

    conventState = result.nextState;
    if (result.conventState) {
      conventStateData = result.conventState;
    }

    // Update corruption profile if returned
    if (result.corruptionProfile) {
      corruptionProfile = result.corruptionProfile;
    }

    isProcessing = false;

    result.messages.forEach(({ delay, content, image }) => {
      addAssistantMessage(content, delay, false, image);
    });

    const lastDelay =
      result.messages.length > 0
        ? result.messages[result.messages.length - 1].delay
        : 0;

    if (
      previousState !== CONVENT_STATES.REVEAL &&
      conventState === CONVENT_STATES.REVEAL
    ) {
      const revealMessages = getConventReveal();
      revealMessages.forEach(({ delay, content, image }) => {
        addAssistantMessage(content, lastDelay + delay, false, image);
      });
    }

    if (conventState === CONVENT_STATES.COMPLETE) {
      gameState = 'hangman';
      hangmanTrialState = HANGMAN_STATES.INTRO;

      const hangmanIntro = getHangmanIntro(playerName);
      addAssistantMessages(hangmanIntro);

      const lastIntroDelay = hangmanIntro[hangmanIntro.length - 1].delay;
      setTimeout(() => {
        hangmanTrialState = HANGMAN_STATES.EXPLORATION;
        hangmanState = initializeHangmanExploration();
        hangmanExplorationHistory = [];
        addAssistantMessage(getExplorationStatus(hangmanState), 1000);
        startHangmanTimer();
      }, lastIntroDelay + 1000);
    }

    scrollToBottom();
  }

  async function handleSearch() {
    if (gameState !== 'convent' || (conventState !== CONVENT_STATES.EXPLORATION && conventState !== CONVENT_STATES.EXPLORATION_SEARCH))
      return;
    if (isProcessing) return;

    isProcessing = true;

    const previousState = conventState;
    const result = await handleConventInput(
      'search', // Trigger search action
      conventState,
      conventStateData,
      metaOffenseCount,
      triggerAchievement,
      triggerCodexToast,
      corruptionProfile
    );

    if (result.isMetaBreaking) {
      metaOffenseCount++;
    }

    conventState = result.nextState;
    if (result.conventState) {
      conventStateData = result.conventState;
    }

    // Update corruption profile if returned
    if (result.corruptionProfile) {
      corruptionProfile = result.corruptionProfile;
    }

    isProcessing = false;

    result.messages.forEach(({ delay, content, image }) => {
      addAssistantMessage(content, delay, false, image);
    });

    const lastDelay =
      result.messages.length > 0
        ? result.messages[result.messages.length - 1].delay
        : 0;

    if (
      previousState !== CONVENT_STATES.REVEAL &&
      conventState === CONVENT_STATES.REVEAL
    ) {
      const revealMessages = getConventReveal();
      revealMessages.forEach(({ delay, content, image }) => {
        addAssistantMessage(content, lastDelay + delay, false, image);
      });
    }

    if (conventState === CONVENT_STATES.COMPLETE) {
      gameState = 'hangman';
      hangmanTrialState = HANGMAN_STATES.INTRO;

      const hangmanIntro = getHangmanIntro(playerName);
      addAssistantMessages(hangmanIntro);

      const lastIntroDelay = hangmanIntro[hangmanIntro.length - 1].delay;
      setTimeout(() => {
        hangmanTrialState = HANGMAN_STATES.EXPLORATION;
        hangmanState = initializeHangmanExploration();
        hangmanExplorationHistory = [];
        addAssistantMessage(getExplorationStatus(hangmanState), 1000);
        startHangmanTimer();
      }, lastIntroDelay + 1000);
    }

    scrollToBottom();
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

  // Determine what to show in the status box
  const statusBoxContent = $derived(() => {
    // Convent trial: show HP
    if (
      gameState === 'convent' &&
      conventState !== CONVENT_STATES.COMPLETE &&
      conventState !== CONVENT_STATES.LOCKOUT
    ) {
      const hearts =
        conventStateData.playerHP === 2
          ? '❤️❤️'
          : conventStateData.playerHP === 1
            ? '❤️🖤'
            : '🖤🖤';
      return `<p style="color: #ff0000; font-weight: bold;">HP: ${hearts}</p>`;
    }
    // Hangman trial: show timer
    if (gameState === 'hangman' && hangmanState && !hangmanState.gameOver) {
      return `<p style="color: #ff0000; font-weight: bold;">${timeRemaining}</p>`;
    }
    return null;
  });

  const headerClass = css({
    padding: '1.5rem',
    backgroundColor: '#16161f',
    borderBottom: '2px solid #8b0000',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    position: 'relative',
  });

  const titleClass = css({
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#c9c9d4',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    margin: 0,
    flexShrink: 0,
  });

  const headerRightClass = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  });

  const headerButtonsClass = css({
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
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

  const headerButtonClass = css({
    padding: '0.5rem 1.5rem',
    backgroundColor: 'transparent',
    border: '2px solid #8b0000',
    borderRadius: '0.375rem',
    color: '#8b0000',
    fontFamily: 'monospace',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: 'rgba(139, 0, 0, 0.1)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  });

  let {
    title = 'iOuija73k',
    onGameStateChange = undefined,
    onAchievementUnlock = undefined,
    onCodexUnlock = undefined,
    onCodexClick = undefined,
    onAchievementClick = undefined,
    showCodexButton = false,
    showAchievementButton = false,
    showAchievementPanel = $bindable(false),
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

  /**
   * DEV MODE: Trigger lockout screen for testing
   */
  function handleTriggerLockout() {
    setLockout();
    isLockedOut = true;
    const lockoutStatus = checkLockout();
    lockoutTimeRemaining = lockoutStatus.remainingTime;
  }

  /**
   * DEV MODE: Jump to a specific trial state
   * @param {string} targetState - The game state to jump to
   */
  function handleStateJump(targetState) {
    // Stop any timers
    stopHangmanTimer();

    // Reset state
    messages = [];
    inputValue = '';
    isProcessing = false;
    showConfetti = false;

    // Set default player name and unlock true name achievement for dev mode
    playerName = playerName || 'Sarah';
    hasTrueNameAchievement = true; // Show true name in dev mode

    switch (targetState) {
      case 'initial':
        gameState = 'initial';
        showInput = false;
        messages = [
          {
            role: 'assistant',
            content:
              "Hey! Want to play a game? It's pretty cool. I think you'll like it.",
            showButton: true,
          },
        ];
        // Reset codex progress
        resetCodexProgress();
        onCodexUnlock?.(); // Notify parent to refresh codex panel
        break;

      case 'name_exchange':
        gameState = 'name_exchange';
        showInput = true;
        messages = [
          {
            role: 'assistant',
            content: "Awesome! What's your name? <i>Mine is Raphael.</i>",
            showButton: false,
          },
        ];
        hasTrueNameAchievement = false; // Reset to false name for this state
        triggerCodexToast('raphael'); // Unlock Raphael codex entry for dev mode
        break;

      case 'convent':
        gameState = 'convent';
        showInput = true;
        conventState = CONVENT_STATES.ENCOUNTER_1;
        conventStateData = createConventState(); // Reset HP to 2
        const conventIntro = getConventIntro(playerName);
        messages = conventIntro.map(({ content, image }) => ({
          role: 'assistant',
          content,
          image,
          showButton: false,
        }));
        messages.push({
          role: 'assistant',
          content: '',
          image: '/src/assets/trials/convent_encounter_1.webp',
          showButton: false,
        });
        messages.push({
          role: 'assistant',
          content: getConventEncounterIntro(1),
          showButton: false,
        });
        messages.push({
          role: 'assistant',
          content: '<span class="blink">What do you do?</span>',
          showButton: false,
        });
        // Start ambient music
        isPlayingMusic = true;
        if (audioElement) {
          audioElement.play().catch((err) => {
            console.error('Audio playback failed:', err);
          });
        }
        break;

      case 'hangman':
        gameState = 'hangman';
        hangmanTrialState = HANGMAN_STATES.EXPLORATION;
        showInput = true;
        const hangmanIntro = getHangmanIntro(playerName);
        messages = hangmanIntro.map(({ content, image }) => ({
          role: 'assistant',
          content,
          image,
          showButton: false,
        }));
        // Initialize hangman exploration
        hangmanState = initializeHangmanExploration();
        hangmanExplorationHistory = [];
        // Start glitching timer
        startHangmanTimer();
        break;

      case 'white_room':
        gameState = 'white_room';
        whiteRoomState = WHITE_ROOM_STATES.INTRO;
        whiteRoomChoice = null;
        showInput = true;
        const whiteRoomIntro = getWhiteRoomIntro(playerName);
        messages = whiteRoomIntro.map(({ content, image }) => ({
          role: 'assistant',
          content,
          image,
          showButton: false,
        }));
        whiteRoomExplorationHistory = [];
        // Start ambient music
        isPlayingMusic = true;
        if (audioElement) {
          audioElement.play().catch((err) => {
            console.error('Audio playback failed:', err);
          });
        }
        break;

      case 'playing':
        gameState = 'playing';
        showInput = true;
        messages = [
          {
            role: 'assistant',
            content: 'You did well. Really well.',
            showButton: false,
          },
          {
            role: 'assistant',
            content: 'Ready for the next trial?',
            showButton: false,
          },
        ];
        break;

      default:
        console.warn('Unknown state:', targetState);
    }

    // Scroll to bottom after state change
    setTimeout(() => scrollToBottom(), 100);
  }

  /**
   * DEV MODE: Reset codex progress
   */
  function handleResetCodex() {
    resetCodexProgress();
    onCodexUnlock?.(); // Notify parent to refresh codex panel
    console.log('Codex progress has been reset.');
  }

  // Export functions for parent component access (Svelte 5)
  export { handleStateJump, handleTriggerLockout, handleResetCodex };
</script>

{#if isLockedOut}
  <LockoutScreen timeRemaining={lockoutTimeRemaining} onUnlock={handleUnlock} />
{:else}
  <div class={containerClass}>
    <header class={headerClass}>
      <h1 class={titleClass}>{title}</h1>
      <div class={headerRightClass}>
        <AnimatedSubtitle bind:this={animatedSubtitleRef} />
        {#if showCodexButton || showAchievementButton}
          <div class={headerButtonsClass}>
            {#if showCodexButton}
              <button
                type="button"
                class={headerButtonClass}
                onclick={onCodexClick}
                title="View Codex"
              >
                📖
              </button>
            {/if}
            {#if showAchievementButton}
              <button
                type="button"
                class={headerButtonClass}
                onclick={onAchievementClick}
                title="View Achievements"
              >
                🏆
              </button>
            {/if}
          </div>
        {/if}
      </div>
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
        <PaimonSigil width="64px" height="64px" loading={isProcessing} />
      </div>
    {/if}

    {#if gameState === 'convent' && (conventState === CONVENT_STATES.EXPLORATION || conventState === CONVENT_STATES.EXPLORATION_SEARCH)}
      <MovementControls {showInput} onMove={handleMovement} onSearch={handleSearch} />
    {/if}

    <!-- Status Box -->
    {#if statusBoxContent()}
      <StatusBox {showInput} content={statusBoxContent()} />
    {/if}
  </div>
{/if}

<Confetti trigger={showConfetti} />

<!-- Hidden audio element for ambient music -->
<audio bind:this={audioElement} loop preload="auto" style="display: none;">
  <source src="/audio/muzak/main-theme.mp3" type="audio/mpeg" />
  <source src="/audio/muzak/main-theme.ogg" type="audio/ogg" />
</audio>

<!-- Achievement components -->
<AchievementToast achievement={currentAchievement} onDismiss={dismissAchievementToast} />
<CodexToast entry={currentCodexToast} onDismiss={dismissCodexToast} />
<AchievementPanel bind:isOpen={showAchievementPanel} onClose={() => showAchievementPanel = false} />

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
