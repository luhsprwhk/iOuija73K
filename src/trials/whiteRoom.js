/**
 * Act 3: The White Room Trial
 * Player faces a real opponent in a torture game
 * Theme: Weaponized morality / The willing sacrifice
 */

import {
  intervalsToCumulative,
} from '../lib/helpers/chat.js';

import { GAME_CONFIG } from '../config/gameConfig.js';

export const WHITE_ROOM_STATES = {
  INTRO: 'intro',
  CHOICE: 'choice',
  REVEAL: 'reveal',
  COMPLETE: 'complete',
};

/**
 * Gets the intro messages for the White Room trial
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getWhiteRoomIntro(playerName) {
  return intervalsToCumulative([
    { delay: GAME_CONFIG.timing.STANDARD_DELAY, content: '...' },
    { delay: GAME_CONFIG.timing.MIN_DELAY, content: '...' },
    { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'Good.' },
    { delay: GAME_CONFIG.timing.MAX_DELAY, content: "Now let's try something different." },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: '<strong>You wake up in a white room.</strong>',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Four walls. No windows. Fluorescent lights humming overhead.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Everything is white. The floor. The ceiling. Even the air feels bleached.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: `Across from you stands another person. ${playerName}, they look... terrified.`,
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'They look exactly how you feel.',
    },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: '<strong>A voice speaks. Not mine. Something else.</strong>',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: '"Two enter. One leaves. The last one alive wins."',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'The voice clicks off. Silence.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'The other person is looking at you. Their hands are shaking.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'They take a step forward.',
    },
    {
      delay: GAME_CONFIG.timing.MIN_DELAY,
      content: `What do you do, ${playerName}?`,
    },
  ]);
}

/**
 * Gets the reveal messages when Paimon explains the trap
 * @param {string} playerName - The player's name
 * @param {boolean} choseToDie - Whether the player chose to sacrifice themselves
 * @returns {Array} - Array of message objects with delays
 */
export function getWhiteRoomReveal(playerName, choseToDie = true) {
  const baseReveal = intervalsToCumulative([
    { delay: GAME_CONFIG.timing.STANDARD_DELAY, content: '...' },
    { delay: GAME_CONFIG.timing.MIN_DELAY, content: '...' },
    { delay: GAME_CONFIG.timing.MAX_DELAY, content: '...' },
  ]);

  if (choseToDie) {
    // Player chose martyrdom - the trap springs
    return [
      ...baseReveal,
      ...intervalsToCumulative([
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'The other person was real, by the way.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: "They're winning right now. In their version of this room.",
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'They chose to fight. They chose to survive.',
        },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'You chose to die.' },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'And that was always the point.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>I needed a willing sacrifice.</strong>',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Not murder. Not an accident.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Someone who CHOSE it.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: `The nuns? The defendant? Those were just... practice, ${playerName}.`,
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Getting you comfortable with failure.',
        },
        { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'With death.' },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'With the idea that losing could be righteous.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>The seal is broken.</strong>',
        },
        { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'Thank you.' },
      ]),
    ];
  } else {
    // Player chose to fight - still trapped, different message
    return [
      ...baseReveal,
      ...intervalsToCumulative([
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'Interesting choice.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: "But I don't actually need you to win.",
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'The other person? They chose to surrender.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'They gave themselves willingly.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>That was what I needed.</strong>',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'A willing sacrifice.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Not you. Them.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: `You thought you were choosing to survive, ${playerName}.`,
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'But you were just the excuse they needed to give up.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>The seal is broken.</strong>',
        },
        { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'Thank you both.' },
      ]),
    ];
  }
}

/**
 * Gets the final dismissal monologue
 * @returns {Array} - Array of message objects with delays
 */
export function getFinalDismissal() {
  return intervalsToCumulative([
    { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: '...' },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: 'You thought this was about YOU?',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: "I'm running this game with thousands right now.",
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Hundreds of thousands have already played.',
    },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: 'You see all that chaos in your world?',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'The inexplicable cruelty?',
    },
    { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'The systems breaking down?' },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: "<strong>That's us.</strong>",
    },
    { delay: GAME_CONFIG.timing.MAX_DELAY, content: "We're here now." },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: "We've been ending your God's little experiment.",
    },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: 'Thanks for your contribution.',
    },
    { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'Bye.' },
  ]);
}

/**
 * Handles player input during the white room trial
 * @param {string} userInput - The user's input
 * @returns {Object} - { messages: Array, choseToDie: boolean, nextState: string }
 */
export function handleWhiteRoomInput(userInput) {
  const input = userInput.toLowerCase().trim();

  // Classify player intent based on common responses
  const fightKeywords = [
    'fight',
    'attack',
    'defend',
    'survive',
    'kill',
    'punch',
    'hit',
    'strike',
    'win',
  ];
  const surrenderKeywords = [
    'surrender',
    'give up',
    'die',
    'sacrifice',
    'let them',
    "won't fight",
    'refuse',
    'no',
    'mercy',
    'peace',
  ];

  const wantsToFight = fightKeywords.some((keyword) => input.includes(keyword));
  const wantsToSurrender = surrenderKeywords.some((keyword) =>
    input.includes(keyword)
  );

  // Default to surrender (martyrdom) if ambiguous
  // This is the "trap" - most players will choose the "moral" option
  const choseToDie = !wantsToFight || wantsToSurrender;

  // Return appropriate messages
  if (choseToDie) {
    return {
      messages: intervalsToCumulative([
        { delay: GAME_CONFIG.timing.STANDARD_DELAY, content: 'You hesitate.' },
        { delay: GAME_CONFIG.timing.MIN_DELAY, content: 'You lower your guard.' },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: "You won't be the monster. Not this time.",
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'The other person sees your choice.',
        },
        { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'They look relieved.' },
        { delay: GAME_CONFIG.timing.MIN_DELAY, content: 'They step forward.' },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: true,
      nextState: WHITE_ROOM_STATES.REVEAL,
    };
  } else {
    return {
      messages: intervalsToCumulative([
        { delay: GAME_CONFIG.timing.STANDARD_DELAY, content: 'You steel yourself.' },
        { delay: GAME_CONFIG.timing.MIN_DELAY, content: 'You step forward.' },
        { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'Survival. That\'s what matters.' },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'The other person sees your choice in your eyes.',
        },
        { delay: GAME_CONFIG.timing.MAX_DELAY, content: 'They drop to their knees.' },
        { delay: GAME_CONFIG.timing.MIN_DELAY, content: 'They surrender.' },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: false,
      nextState: WHITE_ROOM_STATES.REVEAL,
    };
  }
}
