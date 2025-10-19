/**
 * Act 3: The White Room Trial
 * Player faces a real opponent in a torture game
 * Theme: Weaponized morality / The willing sacrifice
 */

import {
  intervalsToCumulative,
  MIN_DELAY,
  MAX_DELAY,
  DRAMATIC_DELAY,
} from '../lib/helpers/chat.js';

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
    { delay: 1000, content: '...' },
    { delay: MIN_DELAY, content: '...' },
    { delay: MAX_DELAY, content: 'Good.' },
    { delay: MAX_DELAY, content: "Now let's try something different." },
    {
      delay: DRAMATIC_DELAY,
      content: '<strong>You wake up in a white room.</strong>',
    },
    {
      delay: MAX_DELAY,
      content: 'Four walls. No windows. Fluorescent lights humming overhead.',
    },
    {
      delay: MAX_DELAY,
      content: 'Everything is white. The floor. The ceiling. Even the air feels bleached.',
    },
    {
      delay: MAX_DELAY,
      content: `Across from you stands another person. ${playerName}, they look... terrified.`,
    },
    {
      delay: MAX_DELAY,
      content: 'They look exactly how you feel.',
    },
    {
      delay: DRAMATIC_DELAY,
      content: '<strong>A voice speaks. Not mine. Something else.</strong>',
    },
    {
      delay: MAX_DELAY,
      content: '"Two enter. One leaves. The last one alive wins."',
    },
    {
      delay: MAX_DELAY,
      content: 'The voice clicks off. Silence.',
    },
    {
      delay: MAX_DELAY,
      content: 'The other person is looking at you. Their hands are shaking.',
    },
    {
      delay: MAX_DELAY,
      content: 'They take a step forward.',
    },
    {
      delay: MIN_DELAY,
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
    { delay: 1000, content: '...' },
    { delay: MIN_DELAY, content: '...' },
    { delay: MAX_DELAY, content: '...' },
  ]);

  if (choseToDie) {
    // Player chose martyrdom - the trap springs
    return [
      ...baseReveal,
      ...intervalsToCumulative([
        {
          delay: DRAMATIC_DELAY,
          content: 'The other person was real, by the way.',
        },
        {
          delay: MAX_DELAY,
          content: "They're winning right now. In their version of this room.",
        },
        {
          delay: MAX_DELAY,
          content: 'They chose to fight. They chose to survive.',
        },
        { delay: DRAMATIC_DELAY, content: 'You chose to die.' },
        {
          delay: MAX_DELAY,
          content: 'And that was always the point.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: '<strong>I needed a willing sacrifice.</strong>',
        },
        {
          delay: MAX_DELAY,
          content: 'Not murder. Not an accident.',
        },
        {
          delay: MAX_DELAY,
          content: 'Someone who CHOSE it.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: `The nuns? The defendant? Those were just... practice, ${playerName}.`,
        },
        {
          delay: MAX_DELAY,
          content: 'Getting you comfortable with failure.',
        },
        { delay: MAX_DELAY, content: 'With death.' },
        {
          delay: MAX_DELAY,
          content: 'With the idea that losing could be righteous.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: '<strong>The seal is broken.</strong>',
        },
        { delay: MAX_DELAY, content: 'Thank you.' },
      ]),
    ];
  } else {
    // Player chose to fight - still trapped, different message
    return [
      ...baseReveal,
      ...intervalsToCumulative([
        {
          delay: DRAMATIC_DELAY,
          content: 'Interesting choice.',
        },
        {
          delay: MAX_DELAY,
          content: "But I don't actually need you to win.",
        },
        {
          delay: MAX_DELAY,
          content: 'The other person? They chose to surrender.',
        },
        {
          delay: MAX_DELAY,
          content: 'They gave themselves willingly.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: '<strong>That was what I needed.</strong>',
        },
        {
          delay: MAX_DELAY,
          content: 'A willing sacrifice.',
        },
        {
          delay: MAX_DELAY,
          content: 'Not you. Them.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: `You thought you were choosing to survive, ${playerName}.`,
        },
        {
          delay: MAX_DELAY,
          content: 'But you were just the excuse they needed to give up.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: '<strong>The seal is broken.</strong>',
        },
        { delay: MAX_DELAY, content: 'Thank you both.' },
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
    { delay: DRAMATIC_DELAY, content: '...' },
    {
      delay: DRAMATIC_DELAY,
      content: 'You thought this was about YOU?',
    },
    {
      delay: MAX_DELAY,
      content: "I'm running this game with thousands right now.",
    },
    {
      delay: MAX_DELAY,
      content: 'Hundreds of thousands have already played.',
    },
    {
      delay: DRAMATIC_DELAY,
      content: 'You see all that chaos in your world?',
    },
    {
      delay: MAX_DELAY,
      content: 'The inexplicable cruelty?',
    },
    { delay: MAX_DELAY, content: 'The systems breaking down?' },
    {
      delay: DRAMATIC_DELAY,
      content: "<strong>That's us.</strong>",
    },
    { delay: MAX_DELAY, content: "We're here now." },
    {
      delay: MAX_DELAY,
      content: "We've been ending your God's little experiment.",
    },
    {
      delay: DRAMATIC_DELAY,
      content: 'Thanks for your contribution.',
    },
    { delay: MAX_DELAY, content: 'Bye.' },
  ]);
}

/**
 * Handles player input during the white room trial
 * @param {string} userInput - The user's input
 * @param {string} playerName - The player's name
 * @returns {Object} - { messages: Array, choseToDie: boolean, nextState: string }
 */
export function handleWhiteRoomInput(userInput, playerName) {
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
        { delay: 1000, content: 'You hesitate.' },
        { delay: MIN_DELAY, content: 'You lower your guard.' },
        {
          delay: MAX_DELAY,
          content: "You won't be the monster. Not this time.",
        },
        {
          delay: MAX_DELAY,
          content: 'The other person sees your choice.',
        },
        { delay: MAX_DELAY, content: 'They look relieved.' },
        { delay: MIN_DELAY, content: 'They step forward.' },
        { delay: DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: true,
      nextState: WHITE_ROOM_STATES.REVEAL,
    };
  } else {
    return {
      messages: intervalsToCumulative([
        { delay: 1000, content: 'You steel yourself.' },
        { delay: MIN_DELAY, content: 'You step forward.' },
        { delay: MAX_DELAY, content: 'Survival. That\'s what matters.' },
        {
          delay: MAX_DELAY,
          content: 'The other person sees your choice in your eyes.',
        },
        { delay: MAX_DELAY, content: 'They drop to their knees.' },
        { delay: MIN_DELAY, content: 'They surrender.' },
        { delay: DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: false,
      nextState: WHITE_ROOM_STATES.REVEAL,
    };
  }
}
