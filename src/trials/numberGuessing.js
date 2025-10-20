/**
 * Number Guessing Trial
 * Paimon attempts to guess the player's number using psychological tricks
 */

import { intervalsToCumulative, MIN_DELAY } from '../lib/helpers/chat.js';
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
      messages: intervalsToCumulative([
        {
          delay: 1000,
          content: 'Ha! Of course. Look at us: we are connected now.',
        },
        { delay: 3500, content: 'Oh, and one more thing...' },
        { delay: 1500, content: "<i>My name isn't Raphael</i>" },
        {
          delay: 1500,
          content: '<span class="bold">I\'m Paimon 🙂</span>',
        },
      ]),
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
          delay: 1500,
          content: "I'm right, aren't I?",
          showButtons: true,
        });
      } else {
        // For subsequent guesses, add buttons to the guess message
        messages[0].showButtons = true;
      }

      return {
        messages: intervalsToCumulative(messages),
        nextAttempt: guessAttempt + 1,
        gameComplete: false,
        showButtons: true,
      };
    }

    // Give up and use browser details - also reveal true name
    const details = getBrowserDetails();
    return {
      messages: intervalsToCumulative([
        { delay: 1000, content: "Hm. You're a tricky one. I like that." },
        {
          delay: 1500,
          content: `But I can still see you, ${playerName}. Right now, it's ${details.timeOfDay} where you are. You're on ${details.browser}, ${details.os}. See? I know things.`,
        },
        { delay: 2000, content: 'Oh, and I should mention...' },
        { delay: 1500, content: "<i>My name isn't Raphael.</i>" },
        { delay: 1500, content: "<strong>I'm Paimon</strong> 🙂" },
      ]),
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
  return intervalsToCumulative([
    { delay: 800, content: `Nice to meet you, ${playerName}.` },
    {
      delay: 1200,
      content:
        'Before we begin... we gotta get this done. It\'s protocol.',
    },
    {
      delay: 1500,
      content:
        '<strong>Think of a number between 1 and 50</strong>. Both digits <i>must be odd</i>, and they <i>must be different</i> from each other.',
    },
    {
      delay: 2000,
      content:
        'Picture it in your mind. Like those little birthday candles—light them up...set the whole cake on fire if you want.',
    },
    {
      delay: 2500,
      content:
        "I'll tell you what: <span class='blink'>why don't you kill all the butterflies?</span>",
    },
    {
      delay: MIN_DELAY,
      content: '<span class="bold">lol 😄</span>',
    },
    {
      delay: 2500,
      content:
        "Make that number crystal clear. Hold it there. I need to see what you're seeing.",
    },
    {
      delay: 2500,
      content: "Got it? Good. Don't tell me. I already know.",
      showButton: true,
    },
  ]);
}
