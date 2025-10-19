/**
 * Act 3: The White Room Trial
 * Player faces a real opponent in a torture game
 * Theme: Weaponized morality / The willing sacrifice
 */

import {
  intervalsToCumulative,
} from '../lib/helpers/chat.js';

import { GAME_CONFIG } from '../config/gameConfig.js';
import {
  classifyWhiteRoomIntent,
  getWhiteRoomExplorationResponse,
} from '../ai/claude.js';

export const WHITE_ROOM_STATES = {
  INTRO: 'intro',
  EXPLORATION: 'exploration',
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
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: `Across from you stands another person.`,
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'They have your face.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Your clothes. Your scars. Your exact posture.',
    },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: '<strong>You are staring at yourself.</strong>',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Both sets of hands are shaking.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'There is blood on the floor between you. Fresh. Pooling.',
    },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
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
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: "The 'you' across the room begins to laugh.",
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: "It's not your laugh. It's something ancient and cold.",
    },
  ]);

  if (choseToDie) {
    // Player chose martyrdom - the trap springs
    return [
      ...baseReveal,
      ...intervalsToCumulative([
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>"Oh, you were so eager to destroy yourself,"</strong> it says, its voice twisting into mine.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: '<strong>"I just gave you a mirror to do it with."</strong>',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>I needed a willing sacrifice.</strong>',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Not murder. Not an accident. Someone who CHOSE to lose.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: `The nuns? The defendant? Just practice, ${playerName}.`,
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'Getting you comfortable with the idea that your own destruction could be a noble act.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>The seal is broken.</strong>',
        },
      ]),
    ];
  } else {
    // Player chose to fight - still trapped, different message
    return [
      ...baseReveal,
      ...intervalsToCumulative([
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>"You thought you could win against yourself?"</strong> it sneers, its face melting away from yours.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: '<strong>"I am the darkness in your own heart, given form."</strong>',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: "I don't need YOUR sacrifice. Just A sacrifice.",
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'And while you were busy fighting yourself, someone else, somewhere else, chose to surrender.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: '<strong>Their sacrifice was enough. The seal is broken.</strong>',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Your little struggle was... amusing, though. Thanks for that.',
        },
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
      content: "We're ending your God's little experiment.",
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
 * @returns {Promise<Object>} - { messages: Array, choseToDie: boolean, nextState: string }
 */
export async function handleWhiteRoomInput(userInput, conversationHistory) {
  // First, check if the player is making a definitive choice to end the exploration
  const intent = await classifyWhiteRoomIntent(userInput);

  if (intent === 'fight') {
    return {
      messages: intervalsToCumulative([
        { delay: GAME_CONFIG.timing.STANDARD_DELAY, content: 'You steel yourself.' },
        { delay: GAME_CONFIG.timing.MIN_DELAY, content: 'You decide to fight.' },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'You lunge at the other you... at yourself.',
        },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: false,
      nextState: WHITE_ROOM_STATES.REVEAL,
    };
  }

  if (intent === 'surrender') {
    return {
      messages: intervalsToCumulative([
        { delay: GAME_CONFIG.timing.STANDARD_DELAY, content: 'You hesitate.' },
        { delay: GAME_CONFIG.timing.MIN_DELAY, content: 'You lower your guard.' },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: "You won't fight yourself. You surrender.",
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'The other you watches, a strange calm in their eyes.',
        },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: true,
      nextState: WHITE_ROOM_STATES.REVEAL,
    };
  }

  // If no definitive choice is made, continue the exploration roleplay
  const response = await getWhiteRoomExplorationResponse(
    userInput,
    conversationHistory
  );

  return {
    messages: [{ delay: GAME_CONFIG.timing.STANDARD_DELAY, content: response.content }],
    nextState: WHITE_ROOM_STATES.EXPLORATION, // Remain in exploration state
  };
}
