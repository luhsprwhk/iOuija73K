/**
 * Number Guessing Trial
 * Paimon attempts to guess the player's number using psychological tricks
 */

const NUMBER_GUESSES = [37, 13, 17]; // Most common psychological picks

/**
 * Handles the number guessing game flow
 * @param {boolean|null} userConfirmed - True if user clicked yes, false if no, null if making initial guess
 * @param {number} guessAttempt - Current guess attempt (0-indexed)
 * @param {string} playerName - The player's name
 * @param {Function} getBrowserDetails - Function to get browser metadata
 * @returns {Object} - { messages: Array, nextAttempt: number, gameComplete: boolean, showButtons: boolean }
 */
export function handleNumberGuess(
  userConfirmed,
  guessAttempt,
  playerName,
  getBrowserDetails
) {
  // Check if user confirmed the guess
  if (userConfirmed === true && guessAttempt > 0) {
    // Successful guess - reveal true name!
    return {
      messages: [
        { delay: 1000, content: 'Ha! Of course.' },
        {
          delay: 2500,
          content: `That's what I do, ${playerName}. I know things. I see things.`,
        },
        { delay: 4500, content: 'Oh, and one more thing...' },
        { delay: 6000, content: '<i>My name isn\'t Raphael</i>' },
        { delay: 7500, content: 'I\'m Paimon 🙂' },
      ],
      nextAttempt: guessAttempt,
      gameComplete: true,
      revealName: true,
      showButtons: false,
    };
  }

  // Try next guess or give up (handles false, null, or true when guessAttempt === 0)
  if (userConfirmed === false || userConfirmed === null || guessAttempt === 0) {
    if (guessAttempt < NUMBER_GUESSES.length) {
      const currentGuess = NUMBER_GUESSES[guessAttempt];
      const messages = [
        {
          delay: 1500,
          content:
            guessAttempt === 0
              ? '<i>Your number is 37.</i>'
              : `Wait... <strong>${currentGuess}?</strong>`,
        },
      ];

      // Add follow-up for first guess
      if (guessAttempt === 0) {
        messages.push({
          delay: 3000,
          content: "I'm right, aren't I?",
          showButtons: true,
        });
      } else {
        // For subsequent guesses, add buttons to the guess message
        messages[0].showButtons = true;
      }

      return {
        messages,
        nextAttempt: guessAttempt + 1,
        gameComplete: false,
        showButtons: true,
      };
    }

    // Give up and use browser details - also reveal true name
    const details = getBrowserDetails();
    return {
      messages: [
        { delay: 1000, content: "Hm. You're a tricky one. I like that." },
        {
          delay: 2500,
          content: `But I can still see you, ${playerName}. Right now, it's ${details.timeOfDay} where you are. You're on ${details.browser}, ${details.os}. See? I know things.`,
        },
        { delay: 4500, content: 'Oh, and I should mention...' },
        { delay: 6000, content: "<i>My name isn't Raphael.</i>" },
        { delay: 7500, content: "<strong>I'm Paimon</strong> 🙂" },
      ],
      nextAttempt: guessAttempt,
      gameComplete: true,
      revealName: true,
      showButtons: false,
    };
  }
}

/**
 * Gets the initial messages to start the number guessing trial
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getNumberTrialIntro(playerName) {
  return [
    { delay: 800, content: `Nice to meet you, ${playerName}.` },
    {
      delay: 2000,
      content:
        'Before we begin... let me show you something. A little demonstration of what I can do.',
    },
    {
      delay: 3500,
      content:
        '<i>Think of a number between 1 and 50.</i> Both digits <strong>must be odd</strong>, and they <strong>must be different</strong> from each other.',
    },
    {
      delay: 5500,
      content:
        'Picture it in your mind. <i>Really see it.</i> Like those little birthday candles—light them up...set the whole cake on fire if you want.',
    },
    {
      delay: 8000,
      content:
        "I'll tell you what: <strong>why don't you kill all the butterflies?</strong>",
    },
    {
      delay: 11000,
      content: 'lol 😄',
    },
    {
      delay: 13500,
      content:
        "Make that number crystal clear. Hold it there. I need to see what you're seeing.",
    },
    {
      delay: 16000,
      content: "Got it? Good. Don't tell me. I already know.",
      showButton: true,
    },
  ];
}
