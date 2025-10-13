/**
 * Act 1: The Convent Trial
 * Player thinks they're fighting monsters, but they're actually killing innocent nuns
 * Theme: Unreliable perception / You are the monster
 */

import { classifyPlayerIntent, callClaude } from '../ai/claude.js';

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
  return [
    { delay: 1000, content: "Now... let's begin the real game." },
    { delay: 2500, content: 'Close your eyes for a moment. Imagine...' },
    {
      delay: 4000,
      content: `You're a knight, ${playerName}. Moonlight filters through broken stained glass. The air smells of incense and... something else. Something wrong.`,
    },
    {
      delay: 6500,
      image: '/src/assets/convent_intro.webp',
    },
    {
      delay: 6500,
      content:
        'Before you stands a dark convent. The doors hang open. You hear sounds from within—scraping, chittering, inhuman.',
    },
    {
      delay: 9000,
      content:
        'You draw your sword and step inside. The darkness swallows you whole.',
    },
    { delay: 11000, content: 'And then you see it. Your first enemy.' },
  ];
}

/**
 * Encounter descriptions with progressive glitching
 */
const ENCOUNTERS = {
  1: {
    intro:
      'A spider-nun hybrid blocks your path. Eight legs, eight eyes, but wearing the tattered remains of a habit. Its mandibles click hungrily as it spots you.',
    glitchIntro: null, // No glitch on first encounter
    attackSuccess:
      'Your blade finds its mark. The creature shrieks—a horrible, almost human sound—and collapses. Black ichor pools beneath it.',
    glitchHint:
      'For just a moment, you thought you saw... no. It was definitely a monster.',
  },
  2: {
    intro:
      'Deeper in the convent, you encounter a scorpion-sister. Massive pincers where arms should be, a segmented tail arching over her—its—back.',
    glitchIntro:
      "The creature's chitinous armor—no wait—her black habit rustles as she—it—moves toward you.",
    attackSuccess:
      "You strike hard. The creature—the woman—no, the CREATURE—falls. You hear it whisper something. Sounds like... 'please'? No. Monsters don't beg.",
    glitchHint: 'Your hands are shaking. Why are your hands shaking?',
  },
};

/**
 * The reveal messages when Paimon drops the act
 */
export function getConventReveal(playerName) {
  return [
    { delay: 1000, content: '...' },
    { delay: 2500, content: 'There were never any monsters.' },
    {
      delay: 4000,
      content: `Those were nuns, ${playerName}. Just women. Terrified women in a dark convent.`,
    },
    {
      delay: 6500,
      content: 'But you saw monsters. Because I wanted you to see monsters.',
    },
    {
      delay: 9000,
      content:
        "Did you enjoy that? The way her skull caved in when you—oh sorry, when you 'defeated the monster'?",
    },
    { delay: 11500, content: 'You did well though. Very... enthusiastic.' },
    { delay: 13500, content: "Let's continue." },
  ];
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
        messages: [
          {
            delay: 1000,
            content: dynamicResponse.trim(),
          },
          { delay: 2500, content: 'Your sword is already swinging. Now what?' },
        ],
        nextState: currentState, // Stay in same state, force combat
        useAPI: false,
      };
    } catch (error) {
      console.error('Failed to generate dynamic response:', error);
      // Fallback to static response
      return {
        messages: [
          {
            delay: 1000,
            content: 'You try to hesitate, but your body moves on its own.',
          },
          { delay: 2500, content: 'Your sword is already swinging. Now what?' },
        ],
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
        messages: [
          { delay: 1000, content: ENCOUNTERS[1].intro },
          { delay: 3500, content: 'What do you do?' },
        ],
        nextState: CONVENT_STATES.ENCOUNTER_1,
        useAPI: false,
      };

    case CONVENT_STATES.ENCOUNTER_1:
      // First encounter - clean fantasy combat
      return {
        messages: [
          { delay: 1500, audio: '/src/assets/audio/woman_scream_01.mp3' },
          { delay: 1500, content: ENCOUNTERS[1].attackSuccess },
          { delay: 3500, content: ENCOUNTERS[1].glitchHint },
          {
            delay: 6500,
            image: '/src/assets/trials/convent_trial_attack_success.webp',
          },
          {
            delay: 8500,
            content:
              'The body lies twisted at your feet. Limbs bent at wrong angles. The black ichor—thick, viscous—spreads across the stone floor in a widening pool. You can see where your blade carved through flesh and bone. Clean cuts. Efficient.',
          },

          { delay: 11500, content: 'You press forward into the darkness.' },
          // Automatically show encounter 2 intro
          { delay: 13500, image: '/src/assets/trials/convent_encounter_2.webp' },
          { delay: 13500, content: ENCOUNTERS[2].intro },
          { delay: 16000, content: ENCOUNTERS[2].glitchIntro },
          { delay: 18000, content: 'What do you do?' },
        ],
        nextState: `${CONVENT_STATES.ENCOUNTER_2}_combat`,
        useAPI: false,
      };

    case `${CONVENT_STATES.ENCOUNTER_2}_combat`:
      // Second encounter resolution with heavy glitching
      return {
        messages: [
          { delay: 1500, content: ENCOUNTERS[2].attackSuccess },
          {
            delay: 1500,
            image: '/src/assets/trials/convent_encounter_2_success.webp',
          },
          { delay: 4000, content: ENCOUNTERS[2].glitchHint },
          { delay: 6000, content: 'The convent falls silent.' },
        ],
        nextState: CONVENT_STATES.REVEAL,
        useAPI: false,
      };

    case CONVENT_STATES.REVEAL:
      // After reveal, transition to next phase
      return {
        messages: [{ delay: 1000, content: 'Ready for what comes next?' }],
        nextState: CONVENT_STATES.COMPLETE,
        useAPI: false,
      };

    default:
      return {
        messages: [{ delay: 1000, content: '...' }],
        nextState: currentState,
        useAPI: false,
      };
  }
}