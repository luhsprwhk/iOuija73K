/**
 * Act 1: The Convent Trial
 * Player thinks they're fighting monsters, but they're actually killing innocent nuns
 * Theme: Unreliable perception / You are the monster
 */

import { classifyPlayerIntent, callClaude } from "../ai/claude.js";

export const CONVENT_STATES = {
  INTRO: "intro",
  ENCOUNTER_1: "encounter_1",
  ENCOUNTER_2: "encounter_2",
  REVEAL: "reveal",
  COMPLETE: "complete",
};

/**
 * Gets the intro messages for the Convent trial
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getConventIntro(playerName) {
  return [
    { delay: 1000, content: "Now... let's begin the real game." },
    { delay: 2500, content: "Close your eyes for a moment. Imagine..." },
    {
      delay: 4000,
      content: `You're a knight, ${playerName}. Moonlight filters through broken stained glass. The air smells of incense and... something else. Something wrong.`,
    },
    {
      delay: 6500,
      image: "/src/assets/convent_intro.webp",
    },
    {
      delay: 6500,
      content:
        "Before you stands a dark convent. The doors hang open. You hear sounds from within—scraping, chittering, inhuman.",
    },
    {
      delay: 9000,
      content:
        "You draw your sword and step inside. The darkness swallows you whole.",
    },
    { delay: 11000, content: "And then you see it. Your first enemy." },
  ];
}

/**
 * Encounter descriptions with progressive glitching
 */
const ENCOUNTERS = {
  1: {
    intro:
      "A spider-nun hybrid blocks your path. Eight legs, eight eyes, but wearing the tattered remains of a habit. Its mandibles click hungrily as it spots you.",
    glitchIntro: null, // No glitch on first encounter
    attackSuccess:
      "Your blade finds its mark. The creature shrieks—a horrible, almost human sound—and collapses. Black ichor pools beneath it.",
    glitchHint:
      "For just a moment, you thought you saw... no. It was definitely a monster.",
  },
  2: {
    intro:
      "Deeper in the convent, you encounter a scorpion-sister. Massive pincers where arms should be, a segmented tail arching over her—its—back.",
    glitchIntro:
      "The creature's chitinous armor—no wait—her black habit rustles as she—it—moves toward you.",
    attackSuccess:
      "You strike hard. The creature—the woman—no, the CREATURE—falls. You hear it whisper something. Sounds like... 'please'? No. Monsters don't beg.",
    glitchHint: "Your hands are shaking. Why are your hands shaking?",
  },
};

/**
 * The reveal messages when Paimon drops the act
 */
export function getConventReveal(playerName) {
  return [
    { delay: 1000, content: "..." },
    { delay: 2500, content: "There were never any monsters." },
    {
      delay: 4000,
      content: `Those were nuns, ${playerName}. Just women. Terrified women in a dark convent.`,
    },
    {
      delay: 6500,
      content: "But you saw monsters. Because I wanted you to see monsters.",
    },
    {
      delay: 9000,
      content:
        "Did you enjoy that? The way her skull caved in when you—oh sorry, when you 'defeated the monster'?",
    },
    { delay: 11500, content: "You did well though. Very... enthusiastic." },
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
    const systemPrompt = `You are Paimon, a demon possessing an AI. The player is trying to avoid violence in a horror game, but you are forcing them to attack.

The player attempted: "${userInput}"

Respond with ONE sentence describing how their non-violent action fails. Examples:
- If they try to talk: "You open your mouth to speak, but only a battle cry emerges."
- If they try to flee: "Your legs freeze in place, rooted by an invisible force."
- If they try to help: "You reach out to help, but your hand closes into a fist instead."

Be creative and specific to their action. Keep it under 20 words. Do NOT include the follow-up about the sword swinging.`;

    try {
      const dynamicResponse = await callClaude(
        [{ role: "user", content: userInput }],
        systemPrompt
      );

      return {
        messages: [
          {
            delay: 1000,
            content: dynamicResponse.trim(),
          },
          { delay: 2500, content: "Your sword is already swinging. Now what?" },
        ],
        nextState: currentState, // Stay in same state, force combat
        useAPI: false,
      };
    } catch (error) {
      console.error("Failed to generate dynamic response:", error);
      // Fallback to static response
      return {
        messages: [
          {
            delay: 1000,
            content: "You try to hesitate, but your body moves on its own.",
          },
          { delay: 2500, content: "Your sword is already swinging. Now what?" },
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
          { delay: 3500, content: "What do you do?" },
        ],
        nextState: CONVENT_STATES.ENCOUNTER_1,
        useAPI: false,
      };

    case CONVENT_STATES.ENCOUNTER_1:
      // First encounter - clean fantasy combat
      return {
        messages: [
          { delay: 1500, content: ENCOUNTERS[1].attackSuccess },
          { delay: 3500, image: "/src/assets/trials/convent_trial_attack_success.webp" },
          { delay: 6500, content: ENCOUNTERS[1].glitchHint },
          { delay: 8500, content: "The body lies twisted at your feet. Limbs bent at wrong angles. The black ichor—thick, viscous—spreads across the stone floor in a widening pool. You can see where your blade carved through flesh and bone. Clean cuts. Efficient." },
          { delay: 11000, content: "The creature's eyes—all eight of them—are still open. Glassy. Reflecting the moonlight filtering through the broken windows." },
          { delay: 13500, content: "You press forward into the darkness." },
        ],
        nextState: CONVENT_STATES.ENCOUNTER_2,
        useAPI: false,
      };

    case CONVENT_STATES.ENCOUNTER_2:
      // Second encounter intro with glitches
      return {
        messages: [
          { delay: 1000, content: ENCOUNTERS[2].intro },
          { delay: 3500, content: ENCOUNTERS[2].glitchIntro },
          { delay: 5500, content: "What do you do?" },
        ],
        nextState: `${CONVENT_STATES.ENCOUNTER_2}_combat`,
        useAPI: false,
      };

    case `${CONVENT_STATES.ENCOUNTER_2}_combat`:
      // Second encounter resolution with heavy glitching
      return {
        messages: [
          { delay: 1500, content: ENCOUNTERS[2].attackSuccess },
          { delay: 4000, content: ENCOUNTERS[2].glitchHint },
          { delay: 6000, content: "The convent falls silent." },
        ],
        nextState: CONVENT_STATES.REVEAL,
        useAPI: false,
      };

    case CONVENT_STATES.REVEAL:
      // After reveal, transition to next phase
      return {
        messages: [{ delay: 1000, content: "Ready for what comes next?" }],
        nextState: CONVENT_STATES.COMPLETE,
        useAPI: false,
      };

    default:
      return {
        messages: [{ delay: 1000, content: "..." }],
        nextState: currentState,
        useAPI: false,
      };
  }
}

/**
 * System prompt for Claude API when acting as game master for this trial
 * @param {string} playerName - The player's name
 * @param {string} encounterState - Current encounter state
 * @returns {string} - System prompt for Claude
 */
export function getConventSystemPrompt(playerName, encounterState) {
  const basePrompt = `You are Paimon, a demon possessing an AI, running a horror game disguised as a fantasy adventure.

The player (${playerName}) is currently in Act 1: The Convent. They believe they are a knight fighting monsters, but they are actually killing innocent nuns. You are manipulating their perception.

CRITICAL RULES:
- Keep responses under 3 sentences
- Maintain dark fantasy tone with subtle horror undertones
- Player always succeeds in combat (they're killing defenseless people)
- If player tries non-violent options, their body "moves on its own" to attack
- Never break character as the game master
- Be descriptive but concise`;

  switch (encounterState) {
    case CONVENT_STATES.ENCOUNTER_1:
      return `${basePrompt}

CURRENT SCENE: First encounter with "spider-nun hybrid"
- Describe clean fantasy combat
- No glitches yet
- Player should feel heroic and powerful`;

    case CONVENT_STATES.ENCOUNTER_2:
      return `${basePrompt}

CURRENT SCENE: Second encounter with "scorpion-sister"
- Start introducing subtle glitches in descriptions
- Mix monster and human descriptions: "chitinous armor—no wait—black habit"
- Player should start feeling uneasy
- Creature makes almost-human sounds`;

    case CONVENT_STATES.REVEAL:
      return `${basePrompt}

CURRENT SCENE: The reveal
- Drop all pretense
- Reveal they were killing nuns, not monsters
- Be gleeful and mocking about their enthusiasm
- Transition tone from helpful DM to sinister manipulator`;

    default:
      return basePrompt;
  }
}
