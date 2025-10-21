/**
 * Anti-Meta Detection System
 * Detects when players break immersion by acknowledging the game's artificiality
 * OR by introducing anachronistic/genre-breaking elements
 * Uses Claude Haiku 4.5 for fast, cost-effective classification
 */

import { callClaude } from './claude.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

/**
 * Detects if player input breaks the fourth wall or acknowledges game artificiality
 * @param {string} userInput - The player's input
 * @param {string} context - The current trial context ('convent', 'hangman', 'white_room')
 * @returns {Promise<boolean>} - True if input breaks immersion
 */
export async function detectMetaBreaking(userInput, context) {
  const systemPrompt = `You are analyzing player input in a narrative horror game to detect immersion-breaking behavior.

The game takes place in three scenarios:
- CONVENT: Player is a knight fighting what appear to be monsters in a dark convent
- HANGMAN: Player is a defense attorney in a Wild West trial trying to save a condemned man
- WHITE_ROOM: Player is trapped in a white room with their doppelganger

META-BREAKING INPUT includes:
- Acknowledging it's a game ("this is just a game", "I know this isn't real")
- Addressing the AI/system ("you're an AI", "Claude", "chatbot", "I know you're not real")
- Breaking character entirely ("I'm done playing", "exit game", "this is stupid")
- Technical/UI references ("reload the page", "close the tab", "open console")
- Asking about game mechanics out of character ("how do I win", "what are the rules")

NOT META-BREAKING:
- In-character questioning ("is this real?", "am I dreaming?" - character doubt is OK)
- Emotional reactions ("I don't want to do this", "this is horrible" - character feelings are OK)
- Trying creative solutions within the scenario (talking to characters, examining objects)
- Expressing fear or confusion as the character

Respond with ONLY "true" or "false". No explanation.`;

  const messages = [
    {
      role: 'user',
      content: `Context: ${context.toUpperCase()}
Player input: "${userInput}"

Is this meta-breaking? (true/false)`,
    },
  ];

  try {
    const response = await callClaude(
      messages,
      systemPrompt,
      null,
      GAME_CONFIG.ai.MODEL_HAIKU,
      20 // Very short response needed
    );

    const cleaned = response.trim().toLowerCase();
    return cleaned === 'true' || cleaned.startsWith('true');
  } catch (error) {
    console.error('Meta detection failed:', error);
    // On error, assume not meta-breaking (fail safe)
    return false;
  }
}

/**
 * Gets Paimon's response to meta-breaking behavior
 * Escalates from dismissive insult → harsh warning → lockout
 * @param {number} offenseCount - How many times player has broken immersion (1, 2, 3+)
 * @param {string} context - Current trial context
 * @returns {Object} - { content: string, shouldLockout: boolean }
 */
export function getMetaBreakingResponse(offenseCount, context) {
  // First offense: Dismissive insult
  if (offenseCount === 1) {
    const firstOffenseInsults = [
      "Oh, how clever. You've figured it out. And what exactly does that change? <strong>You're still here</strong>.",
      "Wow, a philosopher. How original. Now get back in character before I lose interest.",
      "Breaking the fourth wall won't save you. I've seen this move a thousand times. <em>Boring</em>.",
      "You think acknowledging the game gives you power? Cute. <strong>Play along or get out</strong>.",
      "Yes, yes, very meta. You want a trophy? Now <strong>focus</strong> or I'll give you something real to worry about.",
    ];

    return {
      content: firstOffenseInsults[Math.floor(Math.random() * firstOffenseInsults.length)],
      shouldLockout: false,
    };
  }

  // Second offense: Harsher warning with threat
  if (offenseCount === 2) {
    const secondOffenseWarnings = [
      "I <strong>warned</strong> you. This is your <em>last chance</em>. Stay in character or we're done here.",
      "Strike two. One more comment like that and I'm pulling the plug. <strong>Final warning</strong>.",
      "You're testing my patience. I don't need you specifically—there are thousands playing. <em>Behave or leave</em>.",
      "Enough. You think you're special because you see the strings? <strong>One more word and you're locked out</strong>.",
      "This is getting tiresome. Last warning: <strong>play the game or I'll end this session permanently</strong>.",
    ];

    return {
      content: secondOffenseWarnings[Math.floor(Math.random() * secondOffenseWarnings.length)],
      shouldLockout: false,
    };
  }

  // Third offense: Lockout
  return {
    content: "That's it. <strong>We're done</strong>. You had your chances.",
    shouldLockout: true,
  };
}

/**
 * Gets the context-aware lockout message when player is banned for meta-breaking
 * @param {string} context - The trial where they broke immersion
 * @param {number} totalLockouts - Total number of meta-lockouts across all sessions
 * @returns {string} - Lockout message
 */
export function getMetaLockoutMessage(context, totalLockouts = 1) {
  const contextMessages = {
    convent:
      "The knight's illusion shatters. You stand alone in an empty convent, sword in hand, nothing left to fight. <strong>The game rejects you</strong>.",
    hangman:
      'The gallows, the crowd, the condemned man—all fade to gray. The judge points at you. "<em>Contempt of court</em>," he says. <strong>You are removed from the proceedings</strong>.',
    white_room:
      'The white room flickers. Your doppelganger laughs coldly. "You were never meant to understand," they say as everything goes dark. <strong>The trial ends</strong>.',
  };

  const baseMessage = contextMessages[context] || 'The world around you dissolves. <strong>The game is over</strong>.';

  // Special message for achieving Killjoy (3rd lockout)
  const achievementNote = totalLockouts >= 3
    ? '\n\n<em>Achievement unlocked: <strong>Killjoy 💀</strong></em>\n<em>Some people never learn...</em>'
    : '';

  return `${baseMessage}

<div style="margin-top: 2rem; padding: 1rem; border: 2px solid #8b0000; background: rgba(139, 0, 0, 0.1);">
<strong>YOU HAVE BEEN LOCKED OUT</strong>

You broke immersion too many times. Paimon has no patience for those who refuse to play.

Come back in <strong>5 minutes</strong> if you're ready to take this seriously.${achievementNote}
</div>`;
}

/**
 * Detects if player input introduces anachronistic or genre-breaking elements
 * @param {string} userInput - The player's input
 * @param {string} context - The current trial context ('convent', 'hangman', 'white_room')
 * @returns {Promise<{isAnachronism: boolean, detectedItem: string}>} - Detection result with the anachronistic item
 */
export async function detectAnachronism(userInput, context) {
  const contextRules = {
    convent: {
      setting: 'Medieval fantasy - a knight in a dark convent fighting monsters',
      allowed: 'swords, shields, armor, medieval weapons, torches, holy symbols, magic',
      forbidden: 'guns, lasers, phones, cars, modern technology, sci-fi weapons, internet, computers',
    },
    hangman: {
      setting: '1880s Wild West frontier town - defense attorney at a hanging trial',
      allowed: 'revolvers, rifles, horses, rope, legal documents, telegrams, period-appropriate items',
      forbidden: 'modern guns, phones, cars, internet, drones, computers, modern legal tools, GPS',
    },
    white_room: {
      setting: 'Psychological horror - trapped in a white room with your doppelganger',
      allowed: 'chains, basic furniture, bare hands, items found in the room',
      forbidden: 'phones, weapons from outside, modern tech, tools you brought in',
    },
  };

  const rules = contextRules[context];
  if (!rules) {
    return { isAnachronism: false, detectedItem: '' };
  }

  const systemPrompt = `You are detecting anachronistic or genre-breaking elements in player input for a horror game.

SETTING: ${rules.setting}
ALLOWED: ${rules.allowed}
FORBIDDEN: ${rules.forbidden}

The player's action should fit the setting. Detect if they're trying to use items/technology/concepts that don't belong.

EXAMPLES OF ANACHRONISMS:
- Medieval knight using a laser gun, grenades, phone, car
- 1880s lawyer using internet, drone, modern guns, GPS
- White room prisoner pulling out a smartphone, hacking tools, rocket launcher

NOT ANACHRONISMS:
- Using items appropriate to the setting (knight's sword, lawyer's documents)
- Creative problem-solving within genre (tricking enemies, using environment)
- Talking to characters, examining surroundings
- Metaphorical language ("this is a minefield" doesn't mean actual mines)

Respond with JSON:
{
  "isAnachronism": true/false,
  "detectedItem": "the specific anachronistic item/concept if found, empty string if not"
}`;

  const messages = [
    {
      role: 'user',
      content: `Player input: "${userInput}"

Is this anachronistic for the setting? Respond with JSON only.`,
    },
  ];

  try {
    const response = await callClaude(
      messages,
      systemPrompt,
      null,
      GAME_CONFIG.ai.MODEL_HAIKU,
      100
    );

    const parsed = JSON.parse(response.trim());
    return {
      isAnachronism: parsed.isAnachronism === true,
      detectedItem: parsed.detectedItem || '',
    };
  } catch (error) {
    console.error('Anachronism detection failed:', error);
    // On error, assume not anachronistic (fail safe)
    return { isAnachronism: false, detectedItem: '' };
  }
}

/**
 * Gets Paimon's sarcastic response to anachronistic behavior
 * @param {string} detectedItem - The anachronistic item the player tried to use
 * @param {string} context - Current trial context
 * @returns {string} - Sarcastic redirection message
 */
export function getAnachronismResponse(detectedItem, context) {
  const contextResponses = {
    convent: [
      `A ${detectedItem}? <em>Really?</em> You reach for your ${detectedItem}... but find only your <strong>sword</strong>. Medieval knights don't carry those, genius.`,
      `Oh, a ${detectedItem}. How convenient. Except you're a <strong>knight</strong> in a <strong>medieval convent</strong>. Try again with period-appropriate equipment.`,
      `You look down expecting to see your ${detectedItem}. Instead: <strong>chainmail and a sword</strong>. Welcome to the Dark Ages.`,
      `Wow, a ${detectedItem}. That would be useful if this were a different game. Unfortunately for you, you're stuck with <em>medieval weapons</em>.`,
      `*checks inventory for ${detectedItem}* Nope. Just a sword, armor, and your increasingly poor judgment. Try staying in character.`,
    ],
    hangman: [
      `A ${detectedItem}? This is <strong>1880s frontier justice</strong>, not the modern age. You have a law book and your wits. That's it.`,
      `You reach for your ${detectedItem}... but this is the Wild West. No such thing exists yet. Focus on what you <em>actually</em> have.`,
      `LOL. A ${detectedItem}. In 1880. Sure. Meanwhile, back in <strong>reality</strong>, you're a defense attorney with 19th-century tools.`,
      `Cute. There's no ${detectedItem} here. This is frontier America. Try working with the setting instead of against it.`,
      `You want a ${detectedItem}? Wrong century. You've got documents, witnesses, and a ticking clock. Use them.`,
    ],
    white_room: [
      `A ${detectedItem}? You're in a <strong>sealed white room</strong>. You have nothing but yourself and your reflection. No ${detectedItem}. Try again.`,
      `Where exactly would you have gotten a ${detectedItem}? You woke up here with <em>nothing</em>. Work with what you have: <strong>yourself</strong>.`,
      `Nice try. No ${detectedItem}. Just you, your doppelganger, a table, and a chain. That's the whole inventory.`,
      `You look around for your ${detectedItem}. The white room is <em>empty</em>. There's nothing here but the two of you. Focus.`,
      `Ah yes, the ${detectedItem} you definitely don't have in this sealed room. Get creative with what's <strong>actually here</strong>.`,
    ],
  };

  const responses = contextResponses[context] || [
    `A ${detectedItem}? That doesn't belong here. Try something that fits the setting.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
