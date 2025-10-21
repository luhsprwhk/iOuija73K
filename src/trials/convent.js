/**
 * Act 1: The Convent Trial
 * Player thinks they're fighting monsters, but they're actually killing innocent nuns
 * Theme: Unreliable perception / You are the monster
 */

import { classifyPlayerIntent, callClaude } from '../ai/claude.js';
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
};

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
  },
};

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
 * Handles player input during convent encounters
 * @param {string} userInput - The user's input
 * @param {string} currentState - Current encounter state
 * @returns {Promise<Object>} - { messages: Array, nextState: string, useAPI: boolean, systemPrompt: string }
 */
export async function handleConventInput(userInput, currentState) {
  // Classify player intent using AI
  const isNonViolent = await classifyPlayerIntent(userInput);

  // Paimon subverts non-violent choices with dynamic response. Forces combat.
  if (isNonViolent && currentState !== CONVENT_STATES.REVEAL) {
    const systemPrompt = `You are Paimon, a demon possessing an AI in a horror game. The player is trying to avoid violence in a horror game, but you are forcing them to attack.

The player attempted: "${userInput}"

Respond with ONE sentence describing how their non-violent action fails. Examples:
- If they try to talk: "You open your mouth to speak, but only a battle cry emerges."
- If they try to flee: "Your legs freeze in place, rooted by an invisible force."
- If they try to help: "You reach out to help, but your hand closes into a fist instead."
- If they try to end game by attacking themselves: "You raise your sword to strike yourself, but you plunge it into the monster instead."
- If they try to end the game by doing nothing: "You try to resist, but your body moves on its own."

Be creative and specific to their action. Keep it under 20 words. Do NOT include the follow-up about the sword swinging.`;

    try {
      const dynamicResponse = await callClaude(
        [{ role: 'user', content: userInput }],
        systemPrompt
      );

      return {
        messages: intervalsToCumulative([
          {
            delay: 1000,
            content: dynamicResponse.trim(),
          },
          { delay: MIN_DELAY, content: 'Your sword is already swinging. Now what?' },
        ]),
        nextState: currentState, // Stay in same state, force combat
        useAPI: false,
      };
    } catch (error) {
      console.error('Failed to generate dynamic response:', error);
      // Fallback to static response
      return {
        messages: intervalsToCumulative([
          {
            delay: 1000,
            content: 'You try to hesitate, but your body moves on its own.',
          },
          { delay: MIN_DELAY, content: 'Your sword is already swinging. Now what?' },
        ]),
        nextState: currentState,
        useAPI: false,
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

    case CONVENT_STATES.ENCOUNTER_1:
      // First encounter - clean fantasy combat
      return {
        messages: intervalsToCumulative([
          { delay: 1500, audio: '/src/assets/audio/woman_scream_01.mp3' },
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
      };

    case `${CONVENT_STATES.ENCOUNTER_2}_combat`:
      // Second encounter resolution with heavy glitching
      return {
        messages: intervalsToCumulative([
          { delay: 1500, content: ENCOUNTERS[2].attackSuccess },
          {
            delay: MIN_DELAY,
            image: '/src/assets/trials/convent_encounter_2_success.webp',
          },
        ]),
        nextState: CONVENT_STATES.REVEAL,
        useAPI: false,
      };

    case CONVENT_STATES.REVEAL:
      // After reveal, transition to next phase
      return {
        messages: intervalsToCumulative([{ delay: 1000, content: 'Ready for what comes next?' }]),
        nextState: CONVENT_STATES.COMPLETE,
        useAPI: false,
      };

    default:
      return {
        messages: intervalsToCumulative([{ delay: 1000, content: '...' }]),
        nextState: currentState,
        useAPI: false,
      };
  }
}
