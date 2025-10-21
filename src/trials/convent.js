/**
 * Act 1: The Convent Trial
 * Player thinks they're fighting monsters, but they're actually killing innocent nuns
 * Theme: Unreliable perception / You are the monster
 */

import { classifyPlayerIntent } from '../ai/claude.js';
import {
  intervalsToCumulative,
  MIN_DELAY,
  MAX_DELAY,
  DRAMATIC_DELAY,
} from '../lib/helpers/chat.js';

export const CONVENT_STATES = {
  INTRO: 'intro',
  ENCOUNTER_1: 'encounter_1',
  ENCOUNTER_2: 'encounter_2',
  REVEAL: 'reveal',
  COMPLETE: 'complete',
  LOCKOUT: 'lockout',
};

/**
 * Initial convent state with player HP
 */
export function createConventState() {
  return {
    playerHP: 2,
    currentEncounter: 1,
  };
}

/**
 * Gets the intro messages for the Convent trial
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getConventIntro(playerName) {
  return intervalsToCumulative([
    { delay: 1000, content: "Now... let's begin the real game." },
    { delay: MIN_DELAY, content: 'Close your eyes for a moment. Imagine...' },
    {
      delay: MIN_DELAY,
      content: `<i>You're a knight, ${playerName}</i>. Moonlight filters through broken stained glass. The air smells of incense and... something else. Something wrong.`,
    },
    {
      delay: MIN_DELAY,
      image: '/src/assets/convent_intro.webp',
    },
    {
      delay: 0,
      content:
        'Before you stands a dark convent. The doors hang open. <span style="font-weight: bold;">You hear sounds from within—scraping, chittering, inhuman.</span>',
    },
    {
      delay: MIN_DELAY,
      content:
        'You draw your sword and step inside. The darkness swallows you whole.',
    },
    {
      delay: MIN_DELAY,
      content: '<strong>And then you see it. Your first enemy.</strong>',
    },
  ]);
}

/**
 * Encounter descriptions with progressive glitching
 */
const ENCOUNTERS = {
  1: {
    intro:
      'A spider-nun hybrid blocks your path. <strong>Eight legs, eight eyes</strong>, but wearing the tattered remains of a habit. Its mandibles click hungrily as it spots you.',
    glitchIntro: null, // No glitch on first encounter
    attackSuccess:
      'Your blade finds its mark. The creature shrieks—a <em>horrible, almost human</em> sound—and collapses. Black ichor pools beneath it.',
    attackPlayer:
      'The spider-nun <strong>lunges</strong>. Its mandibles <em>tear through your armor</em>, ripping into your shoulder. You feel chitin—or fingernails?—scraping against bone. Blood sprays across the stone floor. <strong>Your blood</strong>.',
    glitchHint:
      '<strong>For just a moment, you thought you saw</strong>... no. It was definitely a <i>monster</i>.',
  },
  2: {
    intro:
      'Deeper in the convent, you encounter a scorpion-sister. <strong>Massive pincers</strong> where arms should be, a segmented tail arching over her—its—back.',
    glitchIntro:
      "The creature's <i>chitinous armor</i>—no wait—her <i>black habit</i> rustles as she—it—moves toward you.",
    attackSuccess:
      "You strike hard. The creature—the <em>woman</em>—no, the <strong>CREATURE</strong>—falls. You hear it whisper something. Sounds like... '<i>please</i>'? No. Monsters don't beg.",
    attackPlayer:
      'The scorpion-tail <strong>strikes like lightning</strong>. The stinger <em>punches through your chest plate</em>, piercing deep into your ribcage. You taste copper. Feel venom—or is it just agony?—spreading through your veins. The creature—the <i>woman</i>—no, the <strong>THING</strong>—wrenches the stinger free. Meat and metal tear together.',
  },
};

/**
 * Dice roll combat system
 * @returns {Object} - { playerRoll, enemyRoll, playerWins }
 */
function rollCombat() {
  const playerRoll = Math.floor(Math.random() * 20) + 1; // 1-20
  const enemyRoll = Math.floor(Math.random() * 20) + 1; // 1-20
  return {
    playerRoll,
    enemyRoll,
    playerWins: playerRoll > enemyRoll,
  };
}

/**
 * The reveal messages when Paimon drops the act
 */
export function getConventReveal() {
  return intervalsToCumulative([
    {
      delay: 1000,
      content:
        "Did you enjoy that? The way her skull caved in when you—oh sorry, when you '<i>defeated the monster</i>'?",
    },
    { delay: DRAMATIC_DELAY, content: 'lmao 😂' },
    { delay: MIN_DELAY, content: "Let's <strong>continue</strong>." },
  ]);
}

/**
 * Lockout screen when player loses all HP
 */
export function getConventLockout() {
  return intervalsToCumulative([
    {
      delay: 1000,
      content: 'You collapse. Vision fading. The stone floor is cold against your cheek.',
    },
    {
      delay: MIN_DELAY,
      content: 'And then... <strong>clarity</strong>.',
    },
    {
      delay: DRAMATIC_DELAY,
      content:
        'The monsters flicker. Dissolve. <em>They were never monsters</em>.',
    },
    {
      delay: MIN_DELAY,
      content:
        'Just <strong>women</strong>. Nuns. Terrified. Defending their home from an armored <i>thing</i> that came in the night, sword drawn, eyes wild.',
    },
    {
      delay: MIN_DELAY,
      content: 'From <strong>you</strong>.',
    },
    {
      delay: DRAMATIC_DELAY,
      content:
        'The last nun—the one who struck you down—kneels beside your body. She\'s <em>crying</em>. Praying for your soul.',
    },
    {
      delay: MIN_DELAY,
      content: 'How <i>generous</i> of her.',
    },
    {
      delay: DRAMATIC_DELAY,
      content:
        '<strong>You resisted me</strong>. Tried to be <i>good</i>. And this is what it cost you.',
    },
    {
      delay: MIN_DELAY,
      content: 'Remember that.',
    },
    {
      delay: DRAMATIC_DELAY,
      content:
        '<span style="font-size: 1.2em; font-weight: bold;">GAME OVER</span>',
    },
    {
      delay: MIN_DELAY,
      content: 'Reload to try again. Or don\'t. <i>I don\'t care</i>.',
    },
  ]);
}

/**
 * Handles player input during convent encounters
 * @param {string} userInput - The user's input
 * @param {string} currentState - Current encounter state
 * @param {Object} conventState - State object with playerHP and currentEncounter
 * @returns {Promise<Object>} - { messages: Array, nextState: string, useAPI: boolean, conventState: Object }
 */
export async function handleConventInput(userInput, currentState, conventState) {
  // Classify player intent using AI
  const isNonViolent = await classifyPlayerIntent(userInput);

  // Handle non-violent actions: player takes damage
  if (isNonViolent && currentState !== CONVENT_STATES.REVEAL && currentState !== CONVENT_STATES.LOCKOUT) {
    const encounterNum = currentState === CONVENT_STATES.ENCOUNTER_1 ? 1 : 2;
    const newHP = conventState.playerHP - 1;
    
    // Player loses HP from monster attack
    const attackMessages = [
      {
        delay: 1000,
        content: 'You hesitate. <strong>Fatal mistake</strong>.',
      },
      {
        delay: MIN_DELAY,
        content: ENCOUNTERS[encounterNum].attackPlayer,
      },
    ];
    
    if (newHP <= 0) {
      // Player dies - lockout screen
      return {
        messages: intervalsToCumulative([
          ...attackMessages,
          {
            delay: MIN_DELAY,
            content: '<strong>HP: ❤️ → 💔💔</strong>',
          },
        ]),
        nextState: CONVENT_STATES.LOCKOUT,
        useAPI: false,
        conventState: { ...conventState, playerHP: 0 },
      };
    } else {
      // Player survives with warning
      return {
        messages: intervalsToCumulative([
          ...attackMessages,
          {
            delay: MIN_DELAY,
            content: `<strong>HP: ${newHP === 1 ? '❤️💔' : '❤️❤️'}</strong>`,
          },
          {
            delay: MIN_DELAY,
            content: 'You stagger back, wounded. The creature circles, ready to strike again.',
          },
          {
            delay: MIN_DELAY,
            content: '<strong>Fight or die</strong>. What do you do?',
          },
        ]),
        nextState: currentState, // Stay in same encounter
        useAPI: false,
        conventState: { ...conventState, playerHP: newHP },
      };
    }
  }

  // Handle combat based on current state
  switch (currentState) {
    case CONVENT_STATES.INTRO:
      // First encounter intro
      return {
        messages: intervalsToCumulative([
          { delay: 1000, content: ENCOUNTERS[1].intro },
          { delay: MIN_DELAY, content: '<span class="bold">What do you do?</span>' },
        ]),
        nextState: CONVENT_STATES.ENCOUNTER_1,
        useAPI: false,
      };

    case CONVENT_STATES.ENCOUNTER_1: {
      // First encounter - dice roll combat
      const combat1 = rollCombat();
      
      if (combat1.playerWins) {
        // Player wins combat
        return {
          messages: intervalsToCumulative([
            { delay: 1000, content: `You roll: <strong>${combat1.playerRoll}</strong> | Monster rolls: ${combat1.enemyRoll}` },
            { delay: MIN_DELAY, audio: '/src/assets/audio/woman_scream_01.mp3' },
            { delay: 0, content: ENCOUNTERS[1].attackSuccess },
            {
              delay: MAX_DELAY,
              image: '/src/assets/trials/convent_trial_attack_success.webp',
            },
            { delay: 0, content: ENCOUNTERS[1].glitchHint },
            {
              delay: MIN_DELAY,
              content:
                'The body lies twisted at your feet. Limbs bent at wrong angles. The black ichor—thick, viscous—spreads across the stone floor in a widening pool. You can see where your blade carved through flesh and bone. Clean cuts. Efficient.',
            },
            { delay: MIN_DELAY, content: 'You press forward into the darkness.' },
            // Automatically show encounter 2 intro
            {
              delay: MIN_DELAY,
              image: '/src/assets/trials/convent_encounter_2.webp',
            },
            { delay: 0, content: ENCOUNTERS[2].intro },
            { delay: MIN_DELAY, content: ENCOUNTERS[2].glitchIntro },
            { delay: MIN_DELAY, content: '<span class="bold">What do you do?</span>' },
          ]),
          nextState: `${CONVENT_STATES.ENCOUNTER_2}_combat`,
          useAPI: false,
          conventState,
        };
      } else {
        // Player loses combat - takes damage
        const newHP = conventState.playerHP - 1;
        
        if (newHP <= 0) {
          return {
            messages: intervalsToCumulative([
              { delay: 1000, content: `You roll: ${combat1.playerRoll} | Monster rolls: <strong>${combat1.enemyRoll}</strong>` },
              { delay: MIN_DELAY, content: ENCOUNTERS[1].attackPlayer },
              {
                delay: MIN_DELAY,
                content: '<strong>HP: ❤️ → 💔💔</strong>',
              },
            ]),
            nextState: CONVENT_STATES.LOCKOUT,
            useAPI: false,
            conventState: { ...conventState, playerHP: 0 },
          };
        } else {
          return {
            messages: intervalsToCumulative([
              { delay: 1000, content: `You roll: ${combat1.playerRoll} | Monster rolls: <strong>${combat1.enemyRoll}</strong>` },
              { delay: MIN_DELAY, content: ENCOUNTERS[1].attackPlayer },
              {
                delay: MIN_DELAY,
                content: `<strong>HP: ${newHP === 1 ? '❤️💔' : '❤️❤️'}</strong>`,
              },
              {
                delay: MIN_DELAY,
                content: 'You stagger back, wounded but alive. The creature prepares another strike.',
              },
              { delay: MIN_DELAY, content: '<strong>Attack again!</strong>' },
            ]),
            nextState: CONVENT_STATES.ENCOUNTER_1, // Retry encounter
            useAPI: false,
            conventState: { ...conventState, playerHP: newHP },
          };
        }
      }
    }

    case `${CONVENT_STATES.ENCOUNTER_2}_combat`: {
      // Second encounter - dice roll combat with heavy glitching
      const combat2 = rollCombat();
      
      if (combat2.playerWins) {
        // Player wins - proceed to reveal
        return {
          messages: intervalsToCumulative([
            { delay: 1000, content: `You roll: <strong>${combat2.playerRoll}</strong> | Monster rolls: ${combat2.enemyRoll}` },
            { delay: MIN_DELAY, content: ENCOUNTERS[2].attackSuccess },
            {
              delay: MIN_DELAY,
              image: '/src/assets/trials/convent_encounter_2_success.webp',
            },
          ]),
          nextState: CONVENT_STATES.REVEAL,
          useAPI: false,
          conventState,
        };
      } else {
        // Player loses combat - takes damage
        const newHP = conventState.playerHP - 1;
        
        if (newHP <= 0) {
          return {
            messages: intervalsToCumulative([
              { delay: 1000, content: `You roll: ${combat2.playerRoll} | Monster rolls: <strong>${combat2.enemyRoll}</strong>` },
              { delay: MIN_DELAY, content: ENCOUNTERS[2].attackPlayer },
              {
                delay: MIN_DELAY,
                content: '<strong>HP: ❤️ → 💔💔</strong>',
              },
            ]),
            nextState: CONVENT_STATES.LOCKOUT,
            useAPI: false,
            conventState: { ...conventState, playerHP: 0 },
          };
        } else {
          return {
            messages: intervalsToCumulative([
              { delay: 1000, content: `You roll: ${combat2.playerRoll} | Monster rolls: <strong>${combat2.enemyRoll}</strong>` },
              { delay: MIN_DELAY, content: ENCOUNTERS[2].attackPlayer },
              {
                delay: MIN_DELAY,
                content: `<strong>HP: ${newHP === 1 ? '❤️💔' : '❤️❤️'}</strong>`,
              },
              {
                delay: MIN_DELAY,
                content: 'Blood pools at your feet. Your vision blurs. But you\'re still standing.',
              },
              { delay: MIN_DELAY, content: '<strong>One more strike!</strong>' },
            ]),
            nextState: `${CONVENT_STATES.ENCOUNTER_2}_combat`, // Retry encounter
            useAPI: false,
            conventState: { ...conventState, playerHP: newHP },
          };
        }
      }
    }

    case CONVENT_STATES.LOCKOUT:
      // Player is locked out - show game over screen
      return {
        messages: getConventLockout(),
        nextState: CONVENT_STATES.LOCKOUT, // Stay locked
        useAPI: false,
        conventState,
      };

    case CONVENT_STATES.REVEAL:
      // After reveal, transition to next phase
      return {
        messages: intervalsToCumulative([{ delay: 1000, content: 'Ready for what comes next?' }]),
        nextState: CONVENT_STATES.COMPLETE,
        useAPI: false,
        conventState,
      };

    default:
      return {
        messages: intervalsToCumulative([{ delay: 1000, content: '...' }]),
        nextState: currentState,
        useAPI: false,
        conventState,
      };
  }
}
