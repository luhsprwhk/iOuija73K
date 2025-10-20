/**
 * Act 3: The White Room Trial
 * Player faces a real opponent in a torture game
 * Theme: Weaponized morality / The willing sacrifice
 */

import {
  intervalsToCumulative,
  limitConversationHistory,
} from '../lib/helpers/chat.js';

import { GAME_CONFIG } from '../config/gameConfig.js';
import {
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
      content: 'Four walls. No windows. No doors. Fluorescent lights humming overhead.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Everything is white. The floor. The ceiling. Even the air feels bleached.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Your head is pounding. Your wrists ache.',
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
      content: 'Between you, bolted to the white floor: a metal table.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'On it, a single object. A heavy steel chain with a shackle at each end.',
    },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: 'One shackle is stained dark red. Still wet.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'There is blood on the floor. Fresh. Pooling beneath the table.',
    },
    {
      delay: GAME_CONFIG.timing.MAX_DELAY,
      content: 'Your reflection\'s eyes meet yours. They look terrified.',
    },
    {
      delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
      content: `<span class="blink">What do you do, ${playerName}?</span>`,
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
 * Initializes the white room exploration state
 * @returns {string} - Initial exploration state
 */
export function initializeWhiteRoomExploration() {
  return WHITE_ROOM_STATES.EXPLORATION;
}


/**
 * Handles player input during the white room trial
 * @param {string} userInput - The user's input
 * @param {string} playerName - The player's name
 * @param {Array} conversationHistory - Chat conversation history
 * @param {Function} onAchievement - Callback to unlock achievement (optional)
 * @returns {Promise<Object>} - { messages: Array, choseToDie: boolean, nextState: string, sawDetected: boolean }
 */
export async function handleWhiteRoomInput(userInput, playerName, conversationHistory, onAchievement = null) {
  // Calculate turn count (count user messages only to track actual player turns)
  const turnCount = conversationHistory.filter(msg => msg.role === 'user').length;

  // Circuit breaker: Force a choice after maximum exploration turns
  if (turnCount >= GAME_CONFIG.whiteRoom.MAX_EXPLORATION_TURNS) {
    // Mirror becomes aggressive and forces a confrontation
    return {
      messages: intervalsToCumulative([
        {
          delay: GAME_CONFIG.timing.STANDARD_DELAY,
          content: 'The mirror image\'s face contorts. Something behind their eyes shifts.'
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: '"Enough games," they hiss. "The voice said TWO ENTER. ONE LEAVES."'
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'They lunge forward, reaching for the chain...',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'You react instinctively. Your hands close around their throat.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Blood runs from their nose. Their eyes never leave yours.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'They smile as the light fades from their face.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Your hands are slick with red. The white floor is stained.',
        },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: false, // Forced to fight
      nextState: WHITE_ROOM_STATES.REVEAL,
      sawDetected: false,
    };
  }

  // Make a single AI call that returns intent classification, response, and Saw reference detection
  // Limit conversation history to prevent unbounded growth (last 10 messages)
  const limitedHistory = limitConversationHistory(conversationHistory, 10);

  const response = await getWhiteRoomExplorationResponse(
    userInput,
    playerName,
    limitedHistory
  );

  // Check if player recognizes the Saw reference (detected by AI)
  if (response.sawReference && onAchievement) {
    onAchievement('jigsaw_apprentice');
  }

  // Handle the player's intent based on AI classification
  if (response.intent === 'fight') {
    return {
      messages: intervalsToCumulative([
        { delay: GAME_CONFIG.timing.STANDARD_DELAY, content: 'You steel yourself.' },
        { delay: GAME_CONFIG.timing.MIN_DELAY, content: 'You decide to fight.' },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'You lunge at the other you... at yourself.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Your hands close around their throat. They don\'t resist.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Blood runs from their nose. Their eyes never leave yours.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'They smile as the light fades from their face.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Your hands are slick with red. The white floor is stained.',
        },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: false,
      nextState: WHITE_ROOM_STATES.REVEAL,
      sawDetected: response.sawReference,
    };
  }

  if (response.intent === 'surrender') {
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
          content: 'The other you picks up the chain. The metal scrapes against the table.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'You close your eyes. You feel the cold steel against your throat.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'There is pressure. Then warmth spreading down your chest.',
        },
        {
          delay: GAME_CONFIG.timing.MAX_DELAY,
          content: 'Your knees buckle. The white floor rushes up to meet you.',
        },
        {
          delay: GAME_CONFIG.timing.DRAMATIC_DELAY,
          content: 'Red blooms across the white like ink in water.',
        },
        { delay: GAME_CONFIG.timing.DRAMATIC_DELAY, content: 'Everything goes dark.' },
      ]),
      choseToDie: true,
      nextState: WHITE_ROOM_STATES.REVEAL,
      sawDetected: response.sawReference,
    };
  }

  // If intent is 'explore', continue the exploration roleplay
  return {
    messages: [{ delay: GAME_CONFIG.timing.STANDARD_DELAY, content: response.content }],
    nextState: WHITE_ROOM_STATES.EXPLORATION, // Remain in exploration state
    sawDetected: response.sawReference,
  };
}
