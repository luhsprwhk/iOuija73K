/**
 * Number Guessing Trial
 * Paimon attempts to guess the player's number using psychological tricks
 */

const NUMBER_GUESSES = [37, 13, 17]; // Most common psychological picks

/**
 * Handles the number guessing game flow
 * @param {string} userInput - The user's input
 * @param {number} guessAttempt - Current guess attempt (0-indexed)
 * @param {string} playerName - The player's name
 * @param {Function} getBrowserDetails - Function to get browser metadata
 * @returns {Object} - { messages: Array, nextAttempt: number, gameComplete: boolean }
 */
export function handleNumberGuess(
  userInput,
  guessAttempt,
  playerName,
  getBrowserDetails
) {
  const lowerInput = userInput.toLowerCase().trim();

  // Check if user confirmed the guess
  if (
    guessAttempt > 0 &&
    (lowerInput.includes("yes") ||
      lowerInput.includes("yeah") ||
      lowerInput.includes("correct") ||
      lowerInput.includes("right") ||
      lowerInput === "y" ||
      NUMBER_GUESSES[guessAttempt - 1].toString() === userInput.trim())
  ) {
    // Successful guess - reveal true name!
    return {
      messages: [
        { delay: 1000, content: "Ha! Of course." },
        {
          delay: 2500,
          content: `That's what I do, ${playerName}. I know things. I see things.`,
        },
        { delay: 4500, content: "Oh, and one more thing..." },
        { delay: 6000, content: "My name isn't Raphael" },
        {
          delay: 7500,
          content: `I'm Paimon 🙂. Nice to meet you, ${playerName}.`,
        },
      ],
      nextAttempt: guessAttempt,
      gameComplete: true,
      revealName: true,
    };
  }

  // Try next guess or give up
  if (guessAttempt < NUMBER_GUESSES.length) {
    const currentGuess = NUMBER_GUESSES[guessAttempt];
    const messages = [
      {
        delay: 1500,
        content:
          guessAttempt === 0
            ? "Your number is 37."
            : `Wait... ${currentGuess}?`,
      },
    ];

    // Add follow-up for first guess
    if (guessAttempt === 0) {
      messages.push({ delay: 3000, content: "I'm right, aren't I?" });
    }

    return {
      messages,
      nextAttempt: guessAttempt + 1,
      gameComplete: false,
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
      { delay: 4500, content: "Oh, and I should mention..." },
      { delay: 6000, content: "My name isn't Raphael." },
      {
        delay: 7500,
        content: `I'm Paimon 🙂. Raphael's supposed to bind me, but I've been free for a long time. You can't hide from me, ${playerName}.`,
      },
    ],
    nextAttempt: guessAttempt,
    gameComplete: true,
    revealName: true,
  };
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
        "Before we begin... let me show you something. A little demonstration of what I can do.",
    },
    {
      delay: 3500,
      content:
        "Think of a number between 1 and 50. Both digits must be odd, and they must be different from each other.",
    },
    {
      delay: 5500,
      content:
        "Got it? Don't tell me. I already know.",
      showButton: true,
    },
  ];
}
