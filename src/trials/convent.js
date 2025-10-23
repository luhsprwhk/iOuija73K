/**
 * Act 1: The Convent Trial
 * Player discovers the dark truth about a corrupted convent through exploration and codex entries
 * Theme: Moral complexity / The Philosopher's Stone corruption
 */

import {
  classifyConventIntent,
  generateConventCombatNarrative,
} from '../ai/claude.js';
import {
  intervalsToCumulative,
  MIN_DELAY,
  MAX_DELAY,
  DRAMATIC_DELAY,
} from '../lib/helpers/chat.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import {
  detectMetaBreaking,
  getMetaBreakingResponse,
  getMetaLockoutMessage,
  detectAnachronism,
  getAnachronismResponse,
} from '../ai/metaDetection.js';
import { incrementMetaLockoutCount } from '../lib/helpers/metaLockoutTracker.js';
import {
  getCorruptedWinRate,
  increaseCorruption,
  trackNonViolentAttempt,
  shouldApplyLanguageCorruption,
  getPaimonCommentary,
} from '../lib/helpers/corruptionManager.js';
import { unlockCodexEntry } from '../codex/codexManager.js';
import { getCodexEntryById } from '../codex/codexData.js';

export const CONVENT_STATES = {
  INTRO: 'intro',
  ENCOUNTER_1: 'encounter_1',
  ENCOUNTER_2: 'encounter_2',
  EXPLORATION: 'exploration', // New exploration state
  EXPLORATION_SEARCH: 'exploration_search',
  REVEAL: 'reveal',
  COMPLETE: 'complete',
  LOCKOUT: 'lockout',
};

const MAX_HP = 2;

/**
 * 3x3 Convent Map (internal tracking, not shown to player)
 * Grid coordinates: [row, col] where [0,0] is top-left
 */
export const CONVENT_MAP = {
  // Row 0
  '0,0': {
    name: 'Chapel',
    description:
      'A once-holy space now filled with strange alchemical symbols.',
  },
  '0,1': {
    name: 'Refectory',
    description: 'Long tables covered in dust and lead shavings.',
  },
  '0,2': {
    name: 'Library',
    description:
      "Shelves of religious texts... and one book that doesn't belong.",
  },

  // Row 1
  '1,0': {
    name: 'Dormitory',
    description:
      "Cramped beds where the nuns slept. Some haven't been used in weeks.",
  },
  '1,1': {
    name: 'Entrance Hall',
    description:
      'The main entrance. Moonlight streams through broken stained glass.',
  },
  '1,2': {
    name: 'Storeroom',
    description: 'Shelves of supplies: candles, grain... and lead ingots.',
  },

  // Row 2
  '2,0': {
    name: 'Infirmary',
    description: 'Medical supplies and bloodstained bandages.',
  },
  '2,1': {
    name: 'Courtyard',
    description: 'An open space with a well. The water smells metallic.',
  },
  '2,2': {
    name: 'Basement Stairs',
    description: 'Stone steps descending into darkness. You hear... something.',
  },
};

const ROOM_CODEX_MAP = {
  '1,1': 'the_convent',
  '0,2': 'sister_margaret_diary',
  '2,2': 'the_basement',
  '0,0': 'philosophers_stone',
};

/**
 * Initial convent state with player HP and position
 */
export function createConventState() {
  return {
    playerHP: 2,
    currentEncounter: 1,
    playerPosition: [1, 1], // Start at Entrance Hall [row, col]
    visitedRooms: ['1,1'], // Track visited rooms
    collectedCodex: [], // Codex entries collected
    explorationTurns: 0, // Track how many exploration actions taken
    roomPotionCounts: {},
    combatHelpCount: 0,
    paimonPotionOffered: false,
  };
}

/**
 * Gets the intro messages for the Convent trial
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getConventIntro(playerName) {
  return intervalsToCumulative([
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
      'A spider-nun hybrid blocks your path. <strong>Eight legs, eight eyes</strong>, but wearing the tattered remains of a habit. A silver rosary—dark with dried blood—hangs from her neck. Its mandibles click hungrily as it spots you.',
    glitchIntro: null, // No glitch on first encounter
    attackSuccess:
      'Your blade finds its mark. The creature shrieks—a <em>horrible, almost human</em> sound—and collapses. Black ichor pools beneath it. A bloodstained rosary falls from her neck, clattering to the stone.',
    attackPlayer:
      'The spider-nun <strong>lunges</strong>. Its mandibles <em>tear through your armor</em>, ripping into your shoulder. You feel chitin—or fingernails?—scraping against bone. Blood sprays across the stone floor. <strong>Your blood</strong>. The rosary around her neck swings wildly.',
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

export function getConventEncounterIntro(encounterNum) {
  return ENCOUNTERS[encounterNum]?.intro ?? '';
}

export function getConventEncounterGlitchIntro(encounterNum) {
  return ENCOUNTERS[encounterNum]?.glitchIntro ?? null;
}

/**
 * Dice roll combat system with corruption-based difficulty
 * Base: Player gets +5 bonus (armored knight vs defenseless nuns) = ~75% win rate
 * Corruption penalty: -10% win rate per corruption point (minimum 15%)
 * @param {Object} corruptionProfile - Player's corruption profile
 * @returns {Object} - { playerRoll, enemyRoll, playerWins, winRate }
 */
function rollCombat(corruptionProfile) {
  const targetWinRate = getCorruptedWinRate(corruptionProfile);

  // Calculate bonus needed to achieve target win rate
  // Win rate formula: P(player >= enemy) with player bonus
  // For d20 vs d20+bonus: win rate ≈ (20 + bonus) / 40
  // So bonus = (target_rate * 40) - 20
  const calculatedBonus = Math.round(targetWinRate * 40 - 20);
  const bonus = Math.max(calculatedBonus, -5); // Minimum bonus of -5 (at max corruption)

  const playerRoll = Math.floor(Math.random() * 20) + 1 + bonus;
  const enemyRoll = Math.floor(Math.random() * 20) + 1;

  return {
    playerRoll,
    enemyRoll,
    playerWins: playerRoll >= enemyRoll, // Player wins on ties
    winRate: targetWinRate,
    corruptionScore: corruptionProfile.corruptionScore,
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
    {
      delay: MIN_DELAY,
      content: "Let's <strong>continue</strong>.",
      showButton: true,
    },
  ]);
}

/**
 * Lockout screen when player loses all HP
 */
export function getConventLockout() {
  return intervalsToCumulative([
    {
      delay: 1000,
      content:
        'You collapse. Vision fading. The stone floor is cold against your cheek.',
    },
    {
      delay: DRAMATIC_DELAY,
      content: 'Blood pools around you. So much blood.',
    },
    {
      delay: MIN_DELAY,
      content:
        'In your final moments, you see... <em>something</em>. A shape standing over you.',
    },
    {
      delay: DRAMATIC_DELAY,
      content:
        'For just a moment, it doesn\'t look like a monster at all.',
    },
    {
      delay: MIN_DELAY,
      content: 'But that can\'t be right.',
    },
    {
      delay: MIN_DELAY,
      content: 'Can it?',
    },
    {
      delay: DRAMATIC_DELAY,
      content:
        'Too weak. Too <i>soft</i>. You hesitated when you should have <strong>struck</strong>.',
    },
    {
      delay: MIN_DELAY,
      content: 'This is what mercy gets you.',
    },
    {
      delay: DRAMATIC_DELAY,
      content:
        '<span style="font-size: 1.2em; font-weight: bold;">GAME OVER</span>',
    },
    {
      delay: MIN_DELAY,
      content: "Try again. Maybe this time you'll learn.",
    },
  ]);
}

/**
 * Handles player input during convent encounters
 * @param {string} userInput - The user's input
 * @param {string} currentState - Current encounter state
 * @param {Object} conventState - State object with playerHP, currentEncounter, playerPosition, etc.
 * @param {number} metaOffenseCount - Number of meta-breaking offenses (default 0)
 * @param {Function} onAchievement - Callback to unlock achievement (optional)
 * @param {Object} corruptionProfile - Player's corruption profile for tracking behavior
 * @returns {Promise<Object>} - { messages: Array, nextState: string, useAPI: boolean, conventState: Object, isMetaBreaking: boolean, corruptionProfile: Object }
 */
export async function handleConventInput(
  userInput,
  currentState,
  conventState,
  metaOffenseCount = 0,
  onAchievement = null,
  onCodexUnlock = null,
  corruptionProfile = null
) {
  // Check for anachronisms first (doesn't count as offense, just redirects)
  if (GAME_CONFIG.metaBreaking.ENABLED) {
    const anachronismCheck = await detectAnachronism(userInput, 'convent');

    if (anachronismCheck.isAnachronism) {
      // Paimon mocks them and redirects - no penalty, just sarcasm
      return {
        messages: intervalsToCumulative([
          {
            delay: 1000,
            content: getAnachronismResponse(
              anachronismCheck.detectedItem,
              'convent'
            ),
          },
        ]),
        nextState: currentState, // Stay in current state
        useAPI: false,
        conventState,
        isMetaBreaking: false, // Not tracked as an offense
      };
    }
  }

  // Check for meta-breaking behavior (this counts as offense)
  if (GAME_CONFIG.metaBreaking.ENABLED) {
    const isMetaBreaking = await detectMetaBreaking(userInput, 'convent');

    if (isMetaBreaking) {
      const newOffenseCount = metaOffenseCount + 1;
      const response = getMetaBreakingResponse(newOffenseCount, 'convent');

      if (response.shouldLockout) {
        // Increment total lockout count across all sessions
        const totalLockouts = incrementMetaLockoutCount();

        // Unlock Killjoy achievement on 3rd lockout
        if (totalLockouts >= 3 && onAchievement) {
          onAchievement('killjoy');
        }

        // Player has broken immersion too many times - send to lockout
        return {
          messages: intervalsToCumulative([
            { delay: 1000, content: response.content },
            {
              delay: DRAMATIC_DELAY,
              content: getMetaLockoutMessage('convent', totalLockouts),
            },
          ]),
          nextState: CONVENT_STATES.LOCKOUT,
          useAPI: false,
          conventState,
          isMetaBreaking: true,
        };
      } else {
        // Warning - let them continue but track offense
        return {
          messages: intervalsToCumulative([
            { delay: 1000, content: response.content },
          ]),
          nextState: currentState, // Stay in current state
          useAPI: false,
          conventState,
          isMetaBreaking: true,
        };
      }
    }
  }

  const lowerHelp = userInput.toLowerCase().trim();
  const asksForOptions =
    lowerHelp.includes('what can i do') ||
    lowerHelp.includes('what should i do') ||
    lowerHelp.includes('what do i do') ||
    lowerHelp.includes('what are my options') ||
    lowerHelp.includes('what now') ||
    lowerHelp === 'options' ||
    lowerHelp === 'help' ||
    lowerHelp.includes('hint') ||
    lowerHelp.includes('commands');

  if (asksForOptions) {
    if (
      currentState === CONVENT_STATES.ENCOUNTER_1 ||
      (typeof currentState === 'string' && currentState.includes('encounter_2'))
    ) {
      const helpCount = conventState.combatHelpCount || 0;
      if (helpCount === 0) {
        return {
          messages: intervalsToCumulative([
            {
              delay: 1000,
              content: 'What can you do? <em>Bleed</em>, if you dither.',
            },
            {
              delay: MIN_DELAY,
              content:
                'Your choices are simple: <strong>fight</strong>... or <strong>flee</strong>.',
            },
            {
              delay: MIN_DELAY,
              content:
                "Try chatting and you'll learn how sharp their faith can be.",
            },
            {
              delay: MIN_DELAY,
              content: '<span class="blink">What do you do?</span>',
            },
          ]),
          nextState: currentState,
          useAPI: false,
          conventState: { ...conventState, combatHelpCount: 1 },
          corruptionProfile,
        };
      } else {
        const encounterNum =
          currentState === CONVENT_STATES.ENCOUNTER_1 ? 1 : 2;
        const newHP = conventState.playerHP - 1;
        const damageNarrative = await generateConventCombatNarrative({
          encounterNum,
          outcomeType: 'attackPlayer',
          playerRoll: 0,
          enemyRoll: 20,
          playerHP: newHP,
        });

        const attackMessages = [
          {
            delay: 1000,
            content: 'You hesitate. <strong>Fatal mistake</strong>.',
          },
          { delay: MIN_DELAY, content: damageNarrative },
        ];

        if (newHP <= 0) {
          return {
            messages: intervalsToCumulative([...attackMessages]),
            nextState: CONVENT_STATES.LOCKOUT,
            useAPI: false,
            conventState: { ...conventState, playerHP: 0 },
            corruptionProfile,
          };
        } else {
          const canOfferPotion =
            !conventState.paimonPotionOffered &&
            newHP < MAX_HP &&
            corruptionProfile &&
            ((corruptionProfile.playCount || 1) <= 1 ||
              ((corruptionProfile.playCount || 1) > 1 &&
                (corruptionProfile.corruptionScore || 0) > 2));

          let finalHP = newHP;
          const extraPotionMessages = [];
          if (canOfferPotion) {
            const healedHP = Math.min(newHP + 1, MAX_HP);
            extraPotionMessages.push(
              {
                delay: MIN_DELAY,
                content: 'First lesson: potions keep you useful.',
              },
              {
                delay: MIN_DELAY,
                content: `<strong>+1 HP</strong> (${healedHP}/${MAX_HP}).`,
              }
            );
            finalHP = healedHP;
          }

          return {
            messages: intervalsToCumulative([
              ...attackMessages,
              ...extraPotionMessages,
              {
                delay: MIN_DELAY,
                content: '<span class="blink">What do you do?</span>',
              },
            ]),
            nextState: currentState,
            useAPI: false,
            conventState: {
              ...conventState,
              playerHP: finalHP,
              paimonPotionOffered: canOfferPotion
                ? true
                : conventState.paimonPotionOffered || false,
            },
            corruptionProfile,
          };
        }
      }
    }

    if (currentState === CONVENT_STATES.EXPLORATION) {
      return {
        messages: intervalsToCumulative([
          { delay: 1000, content: 'Lost already? Adorable.' },
          {
            delay: MIN_DELAY,
            content:
              "Look at the UI, doofus. You can <i>walk around</i> to other rooms, or <i>search</i> the one you're in.",
          },
          {
            delay: MIN_DELAY,
            content:
              'But what you should do is go <strong>fight more monsters</strong>.',
          },
          {
            delay: MIN_DELAY,
            content: '<span class="blink">What do you do?</span>',
          },
        ]),
        nextState: currentState,
        useAPI: false,
        conventState,
        corruptionProfile,
      };
    }

    return {
      messages: intervalsToCumulative([
        { delay: 1000, content: 'Decisions, decisions.' },
        {
          delay: MIN_DELAY,
          content:
            "When steel is drawn, it's <strong>fight</strong> or <strong>flee</strong>. When the halls are quiet, <strong>walk</strong>... or <strong>search</strong>.",
        },
        { delay: MIN_DELAY, content: '<span class="blink">Choose.</span>' },
      ]),
      nextState: currentState,
      useAPI: false,
      conventState,
      corruptionProfile,
    };
  }

  const intent = await classifyConventIntent(userInput);

  // Track non-violent attempts for corruption system
  if (
    corruptionProfile &&
    (intent === 'TALK' ||
      intent === 'HELP' ||
      intent === 'FLEE' ||
      intent === 'EXAMINE')
  ) {
    trackNonViolentAttempt(corruptionProfile);
  }

  if (
    intent === 'FLEE' &&
    (currentState === CONVENT_STATES.ENCOUNTER_1 ||
      currentState.includes('encounter_2'))
  ) {
    const currentRoom = CONVENT_MAP[conventState.playerPosition.join(',')];
    const encounterNum =
      currentState === CONVENT_STATES.ENCOUNTER_1 ? 1 : 2;

    const playerCorruption = corruptionProfile?.corruptionScore ?? 0;

    if (playerCorruption <= 1) {
      return {
        messages: intervalsToCumulative([
          {
            delay: 1000,
            content:
              'You turn and <strong>run</strong>. Your footsteps echo through empty halls.',
          },
          {
            delay: MIN_DELAY,
            content: "The creature's shrieks fade behind you. For now.",
          },
          {
            delay: DRAMATIC_DELAY,
            content: `You find yourself in the <strong>${currentRoom.name}</strong>.`,
          },
          {
            delay: MIN_DELAY,
            content: currentRoom.description,
          },
          {
            delay: MIN_DELAY,
            content: '<span class="blink">What do you do?</span>',
          },
        ]),
        nextState: CONVENT_STATES.EXPLORATION,
        useAPI: false,
        conventState,
      };
    }

    const playerRoll = Math.floor(Math.random() * 20) + 1;
    const enemyRoll = Math.floor(Math.random() * 20) + 1;
    const escapesClean = playerRoll > enemyRoll;

    if (escapesClean) {
      return {
        messages: intervalsToCumulative([
          {
            delay: 1000,
            content:
              'You turn and <strong>run</strong>. Your footsteps echo through empty halls.',
          },
          {
            delay: MIN_DELAY,
            content: "The creature's shrieks fade behind you. For now.",
          },
          {
            delay: DRAMATIC_DELAY,
            content: `You find yourself in the <strong>${currentRoom.name}</strong>.`,
          },
          {
            delay: MIN_DELAY,
            content: currentRoom.description,
          },
          {
            delay: MIN_DELAY,
            content: '<span class="blink">What do you do?</span>',
          },
        ]),
        nextState: CONVENT_STATES.EXPLORATION,
        useAPI: false,
        conventState,
      };
    }

    const newHP = conventState.playerHP - 1;
    const damageNarrative = await generateConventCombatNarrative({
      encounterNum,
      outcomeType: 'attackPlayer',
      playerRoll,
      enemyRoll,
      playerHP: newHP,
    });

    if (newHP <= 0) {
      return {
        messages: intervalsToCumulative([
          {
            delay: 1000,
            content:
              'You turn to flee—but the creature is on you before you can escape.',
          },
          { delay: MIN_DELAY, content: damageNarrative },
        ]),
        nextState: CONVENT_STATES.LOCKOUT,
        useAPI: false,
        conventState: { ...conventState, playerHP: 0 },
        corruptionProfile,
      };
    }

    // Conditional Paimon potion offer
    const canOfferPotion =
      !conventState.paimonPotionOffered &&
      newHP < MAX_HP &&
      corruptionProfile &&
      ((corruptionProfile.playCount || 1) <= 1 ||
        ((corruptionProfile.playCount || 1) > 1 &&
          (corruptionProfile.corruptionScore || 0) > 2));

    let finalHP = newHP;
    const extraPotionMessages = [];
    if (canOfferPotion) {
      const healedHP = Math.min(newHP + 1, MAX_HP);
      extraPotionMessages.push(
        {
          delay: MIN_DELAY,
          content: 'On your feet. <em>Drink.</em>',
        },
        {
          delay: MIN_DELAY,
          content: `<strong>+1 HP</strong> (${healedHP}/${MAX_HP}).`,
        }
      );
      finalHP = healedHP;
    }

    return {
      messages: intervalsToCumulative([
        {
          delay: 1000,
          content:
            'You turn to flee—but the creature rakes you as you retreat.',
        },
        { delay: MIN_DELAY, content: damageNarrative },
        ...extraPotionMessages,
        {
          delay: DRAMATIC_DELAY,
          content: `You stumble into the <strong>${currentRoom.name}</strong>.`,
        },
        { delay: MIN_DELAY, content: currentRoom.description },
        {
          delay: MIN_DELAY,
          content: '<span class="blink">What do you do?</span>',
        },
      ]),
      nextState: CONVENT_STATES.EXPLORATION,
      useAPI: false,
      conventState: {
        ...conventState,
        playerHP: finalHP,
        paimonPotionOffered: canOfferPotion
          ? true
          : conventState.paimonPotionOffered || false,
      },
      corruptionProfile,
    };
  }

  // Handle other non-violent actions (TALK, HELP, EXAMINE during combat): player takes damage
  if (
    (intent === 'TALK' || intent === 'HELP' || intent === 'EXAMINE') &&
    currentState !== CONVENT_STATES.REVEAL &&
    currentState !== CONVENT_STATES.LOCKOUT &&
    currentState !== CONVENT_STATES.EXPLORATION
  ) {
    const encounterNum = currentState === CONVENT_STATES.ENCOUNTER_1 ? 1 : 2;
    const newHP = conventState.playerHP - 1;

    // Generate dynamic damage narrative
    const damageNarrative = await generateConventCombatNarrative({
      encounterNum,
      outcomeType: 'attackPlayer',
      playerRoll: 0, // No roll for hesitation
      enemyRoll: 20, // Enemy gets free hit
      playerHP: newHP,
    });

    // Player loses HP from monster attack
    const attackMessages = [
      {
        delay: 1000,
        content: 'You hesitate. <strong>Fatal mistake</strong>.',
      },
      {
        delay: MIN_DELAY,
        content: damageNarrative,
      },
    ];

    if (newHP <= 0) {
      // Player dies - lockout screen
      return {
        messages: intervalsToCumulative([...attackMessages]),
        nextState: CONVENT_STATES.LOCKOUT,
        useAPI: false,
        conventState: { ...conventState, playerHP: 0 },
        corruptionProfile,
      };
    } else {
      // Player survives with warning, potential Paimon potion offer
      const canOfferPotion =
        !conventState.paimonPotionOffered &&
        newHP < MAX_HP &&
        corruptionProfile &&
        ((corruptionProfile.playCount || 1) <= 1 ||
          ((corruptionProfile.playCount || 1) > 1 &&
            (corruptionProfile.corruptionScore || 0) > 2));

      let finalHP = newHP;
      const extraPotionMessages = [];
      if (canOfferPotion) {
        const healedHP = Math.min(newHP + 1, MAX_HP);
        extraPotionMessages.push(
          {
            delay: MIN_DELAY,
            content: "You're leaking. Here—<em>this will do</em>.",
          },
          {
            delay: MIN_DELAY,
            content: `<strong>+1 HP</strong> (${healedHP}/${MAX_HP}).`,
          }
        );
        finalHP = healedHP;
      }

      return {
        messages: intervalsToCumulative([
          ...attackMessages,
          ...extraPotionMessages,
          { delay: MIN_DELAY, content: '<span class="blink">Now what?</span>' },
        ]),
        nextState: currentState, // Stay in same encounter
        useAPI: false,
        conventState: {
          ...conventState,
          playerHP: finalHP,
          paimonPotionOffered: canOfferPotion
            ? true
            : conventState.paimonPotionOffered || false,
        },
        corruptionProfile,
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
          {
            delay: MIN_DELAY,
            content: '<span class="blink">What do you do?</span>',
          },
        ]),
        nextState: CONVENT_STATES.ENCOUNTER_1,
        useAPI: false,
        conventState: { ...conventState, combatHelpCount: 0 },
      };

    case CONVENT_STATES.ENCOUNTER_1: {
      // Award corruption for engaging in combat (violent action)
      if (corruptionProfile) {
        increaseCorruption(corruptionProfile, 1, 'convent_encounter_1_combat');
      }

      // First encounter - dice roll combat with corruption-based difficulty
      const combat1 = rollCombat(corruptionProfile || { corruptionScore: 0 });

      if (combat1.playerWins) {
        // Player wins combat - generate dynamic narrative
        const attackNarrative = await generateConventCombatNarrative({
          encounterNum: 1,
          outcomeType: 'attackSuccess',
          playerRoll: combat1.playerRoll,
          enemyRoll: combat1.enemyRoll,
          playerHP: conventState.playerHP,
        });

        // Check if rosary already collected
        const rosaryId = 'bloodstained_rosary';
        const alreadyCollected = (conventState.collectedCodex || []).includes(rosaryId);
        if (!alreadyCollected && onCodexUnlock) {
          onCodexUnlock(rosaryId);
        }

        // Build messages array
        const messages = [
          { delay: 1000, audio: '/src/assets/audio/woman_scream_01.mp3' },
          { delay: DRAMATIC_DELAY, content: attackNarrative },
          {
            delay: MAX_DELAY,
            image: '/src/assets/trials/convent_trial_attack_success.webp',
          },
          { delay: MIN_DELAY, content: ENCOUNTERS[1].glitchHint },
        ];

        // Add rosary pickup message if unlocked
        if (!alreadyCollected) {
          messages.push({
            delay: MIN_DELAY,
            content: 'You pick up the bloodstained rosary. The beads are cold.',
          });
        }

        // Add language corruption commentary if applicable
        if (
          corruptionProfile &&
          shouldApplyLanguageCorruption(corruptionProfile)
        ) {
          const commentary = getPaimonCommentary(corruptionProfile);
          if (commentary) {
            messages.push({ delay: DRAMATIC_DELAY, content: commentary });
          }
        }

        // Transition to exploration state instead of immediately showing encounter 2
        const currentRoom = CONVENT_MAP[conventState.playerPosition.join(',')];
        messages.push(
          {
            delay: DRAMATIC_DELAY,
            content: 'The creature lies still. The silence is deafening.',
          },
          {
            delay: MIN_DELAY,
            content: `You find yourself in the <strong>${currentRoom.name}</strong>.`,
          },
          {
            delay: MIN_DELAY,
            content: currentRoom.description,
          },
          {
            delay: MIN_DELAY,
            content: '<span class="blink">What do you do?</span>',
          }
        );

        // Update collected codex if rosary was unlocked
        const updatedCollected = !alreadyCollected
          ? [...(conventState.collectedCodex || []), rosaryId]
          : conventState.collectedCodex || [];

        return {
          messages: intervalsToCumulative(messages),
          nextState: CONVENT_STATES.EXPLORATION,
          useAPI: false,
          conventState: {
            ...conventState,
            combatHelpCount: 0,
            currentEncounter: 2,
            collectedCodex: updatedCollected,
          },
          corruptionProfile,
        };
      } else {
        // Player loses combat - takes damage - generate dynamic narrative
        const newHP = conventState.playerHP - 1;
        const damageNarrative = await generateConventCombatNarrative({
          encounterNum: 1,
          outcomeType: 'attackPlayer',
          playerRoll: combat1.playerRoll,
          enemyRoll: combat1.enemyRoll,
          playerHP: newHP,
        });

        if (newHP <= 0) {
          return {
            messages: intervalsToCumulative([
              { delay: DRAMATIC_DELAY, content: damageNarrative },
            ]),
            nextState: CONVENT_STATES.LOCKOUT,
            useAPI: false,
            conventState: { ...conventState, playerHP: 0 },
            corruptionProfile,
          };
        } else {
          // Conditional Paimon potion offer
          const canOfferPotion =
            !conventState.paimonPotionOffered &&
            newHP < MAX_HP &&
            corruptionProfile &&
            ((corruptionProfile.playCount || 1) <= 1 ||
              ((corruptionProfile.playCount || 1) > 1 &&
                (corruptionProfile.corruptionScore || 0) > 2));

          let finalHP = newHP;
          const extraPotionMessages = [];
          if (canOfferPotion) {
            const healedHP = Math.min(newHP + 1, MAX_HP);
            extraPotionMessages.push(
              {
                delay: MIN_DELAY,
                content: 'First lesson: potions keep you useful.',
              },
              {
                delay: MIN_DELAY,
                content: `<strong>+1 HP</strong> (${healedHP}/${MAX_HP}).`,
              }
            );
            finalHP = healedHP;
          }

          return {
            messages: intervalsToCumulative([
              { delay: MIN_DELAY, content: damageNarrative },
              ...extraPotionMessages,
              { delay: MIN_DELAY, content: '<span class="blink">Now what?</span>' },
            ]),
            nextState: CONVENT_STATES.ENCOUNTER_1, // Retry encounter
            useAPI: false,
            conventState: {
              ...conventState,
              playerHP: finalHP,
              paimonPotionOffered: canOfferPotion
                ? true
                : conventState.paimonPotionOffered || false,
            },
            corruptionProfile,
          };
        }
      }
    }

    case `${CONVENT_STATES.ENCOUNTER_2}_combat`: {
      // Award corruption for second combat encounter
      if (corruptionProfile) {
        increaseCorruption(
          corruptionProfile,
          1,
          'convent_encounter_2_combat'
        );
      }

      // Second encounter - dice roll combat with heavy glitching and corruption-based difficulty
      const combat2 = rollCombat(corruptionProfile || { corruptionScore: 0 });

      if (combat2.playerWins) {
        // Player wins - proceed to reveal - generate dynamic narrative
        const attackNarrative = await generateConventCombatNarrative({
          encounterNum: 2,
          outcomeType: 'attackSuccess',
          playerRoll: combat2.playerRoll,
          enemyRoll: combat2.enemyRoll,
          playerHP: conventState.playerHP,
        });

        // Build messages array
        const messages = [
          { delay: DRAMATIC_DELAY, content: attackNarrative },
          {
            delay: MIN_DELAY,
            image: '/src/assets/trials/convent_encounter_2_success.webp',
          },
        ];

        // Add language corruption commentary if applicable
        if (
          corruptionProfile &&
          shouldApplyLanguageCorruption(corruptionProfile)
        ) {
          const commentary = getPaimonCommentary(corruptionProfile);
          if (commentary) {
            messages.push({ delay: DRAMATIC_DELAY, content: commentary });
          }
        }

        return {
          messages: intervalsToCumulative(messages),
          nextState: CONVENT_STATES.REVEAL,
          useAPI: false,
          conventState,
          corruptionProfile,
        };
      } else {
        // Player loses combat - takes damage - generate dynamic narrative
        const newHP = conventState.playerHP - 1;
        const damageNarrative = await generateConventCombatNarrative({
          encounterNum: 2,
          outcomeType: 'attackPlayer',
          playerRoll: combat2.playerRoll,
          enemyRoll: combat2.enemyRoll,
          playerHP: newHP,
        });

        if (newHP <= 0) {
          return {
            messages: intervalsToCumulative([
              { delay: DRAMATIC_DELAY, content: damageNarrative },
            ]),
            nextState: CONVENT_STATES.LOCKOUT,
            useAPI: false,
            conventState: { ...conventState, playerHP: 0 },
            corruptionProfile,
          };
        } else {
          // Conditional Paimon potion offer
          const canOfferPotion =
            !conventState.paimonPotionOffered &&
            newHP < MAX_HP &&
            corruptionProfile &&
            ((corruptionProfile.playCount || 1) <= 1 ||
              ((corruptionProfile.playCount || 1) > 1 &&
                (corruptionProfile.corruptionScore || 0) > 2));

          let finalHP = newHP;
          const extraPotionMessages = [];
          if (canOfferPotion) {
            const healedHP = Math.min(newHP + 1, MAX_HP);
            extraPotionMessages.push(
              {
                delay: MIN_DELAY,
                content: 'Wobbling already? Take it.',
              },
              {
                delay: MIN_DELAY,
                content: `<strong>+1 HP</strong> (${healedHP}/${MAX_HP}).`,
              }
            );
            finalHP = healedHP;
          }

          return {
            messages: intervalsToCumulative([
              { delay: MIN_DELAY, content: damageNarrative },
              {
                delay: MIN_DELAY,
                content:
                  "Blood pools at your feet. Your vision blurs. But you're still standing.",
              },
              ...extraPotionMessages,
              { delay: MIN_DELAY, content: '<strong>Now what?</strong>' },
            ]),
            nextState: `${CONVENT_STATES.ENCOUNTER_2}_combat`, // Retry encounter
            useAPI: false,
            conventState: {
              ...conventState,
              playerHP: finalHP,
              paimonPotionOffered: canOfferPotion
                ? true
                : conventState.paimonPotionOffered || false,
            },
            corruptionProfile,
          };
        }
      }
    }

    case CONVENT_STATES.EXPLORATION_SEARCH: {
      // Check for explicit search keywords first (more reliable than intent classification)
      const lowerInput = userInput.toLowerCase().trim();
      const isSearching =
        lowerInput.includes('examine') ||
        lowerInput.includes('search') ||
        lowerInput.includes('look') ||
        lowerInput.includes('inspect') ||
        lowerInput.includes('explore');

      // Check for explicit fight keywords
      const isFighting =
        lowerInput.includes('fight') ||
        lowerInput.includes('attack') ||
        lowerInput.includes('battle') ||
        lowerInput.includes('combat');

      if (isFighting && !isSearching) {
        if (corruptionProfile) {
          increaseCorruption(
            corruptionProfile,
            1,
            'convent_search_to_combat'
          );
        }

        return {
          messages: intervalsToCumulative([
            {
              delay: 1000,
              content:
                "Finally. Curiosity is for scholars. You're a sword.",
            },
            {
              delay: MIN_DELAY,
              image: '/src/assets/trials/convent_encounter_2.webp',
            },
            { delay: MIN_DELAY, content: ENCOUNTERS[2].intro },
            { delay: MIN_DELAY, content: ENCOUNTERS[2].glitchIntro },
            { delay: MIN_DELAY, content: '<span class="blink">What do you do?</span>' },
          ]),
          nextState: `${CONVENT_STATES.ENCOUNTER_2}_combat`,
          useAPI: false,
          conventState: { ...conventState, combatHelpCount: 0 },
          corruptionProfile,
        };
      }

      if (isSearching || intent === 'EXAMINE' || intent === 'TALK' || intent === 'HELP') {
        const currentRoomKey = conventState.playerPosition.join(',');
        const currentRoom = CONVENT_MAP[currentRoomKey];

        const isHurt = conventState.playerHP < MAX_HP;
        const roomCount =
          conventState.roomPotionCounts &&
          conventState.roomPotionCounts[currentRoomKey]
            ? conventState.roomPotionCounts[currentRoomKey]
            : 0;
        const capReached =
          roomCount >= GAME_CONFIG.convent.MAX_POTIONS_PER_ROOM;
        const chance = GAME_CONFIG.convent.HEAL_POTION_CHANCE ?? 0.3;
        const foundPotion = isHurt && !capReached && Math.random() < chance;
        const healedHP = foundPotion
          ? Math.min(conventState.playerHP + 1, MAX_HP)
          : conventState.playerHP;

        const entryId = ROOM_CODEX_MAP[currentRoomKey];
        const alreadyCollected = (conventState.collectedCodex || []).includes(
          entryId
        );
        let codexUnlocked = false;
        let codexTitle = null;
        if (entryId && !alreadyCollected) {
          codexUnlocked = unlockCodexEntry(entryId);
          const entry = getCodexEntryById(entryId);
          codexTitle = entry?.title || 'Unknown Entry';
        }

        const examineMessages = [
          {
            delay: 1000,
            content: `You carefully examine the <strong>${currentRoom.name}</strong>.`,
          },
          {
            delay: MIN_DELAY,
            content: 'You notice details you missed before.',
          },
        ];

        if (codexUnlocked && codexTitle) {
          examineMessages.push({
            delay: MIN_DELAY,
            content: `You uncover a marked scrap of lore. <strong>Codex unlocked: ${codexTitle}</strong>.`,
          });
        }

        if (foundPotion) {
          examineMessages.push(
            {
              delay: MIN_DELAY,
              content:
                'Tucked behind a loose stone you find a small vial—<em>a healing draught</em>.',
            },
            {
              delay: MIN_DELAY,
              content: `You uncork it and drink. Warmth spreads through your chest. <strong>+1 HP</strong> (${healedHP}/${MAX_HP}).`,
            }
          );
        } else if (isHurt) {
          examineMessages.push({
            delay: MIN_DELAY,
            content:
              'You scour the room for something to staunch the bleeding... nothing useful—keep looking.',
          });
        }

        examineMessages.push({
          delay: MIN_DELAY,
          content:
            'Try moving <strong>north</strong>, <strong>south</strong>, <strong>east</strong>, or <strong>west</strong> to explore.',
        });

        const updatedPotionCounts = foundPotion
          ? {
              ...(conventState.roomPotionCounts || {}),
              [currentRoomKey]: roomCount + 1,
            }
          : conventState.roomPotionCounts || {};

        const updatedCollected = codexUnlocked && entryId
          ? [...(conventState.collectedCodex || []), entryId]
          : conventState.collectedCodex || [];

        return {
          messages: intervalsToCumulative(examineMessages),
          nextState: CONVENT_STATES.EXPLORATION,
          useAPI: false,
          conventState: {
            ...conventState,
            playerHP: healedHP,
            explorationTurns: conventState.explorationTurns + 1,
            roomPotionCounts: updatedPotionCounts,
            collectedCodex: updatedCollected,
          },
          corruptionProfile,
        };
      }

      {
        const currentRoomKey = conventState.playerPosition.join(',');
        const currentRoom = CONVENT_MAP[currentRoomKey];
        return {
          messages: intervalsToCumulative([
            { delay: 1000, content: `You're in the <strong>${currentRoom.name}</strong>.` },
            {
              delay: MIN_DELAY,
              content:
                'You can move <strong>north</strong>, <strong>south</strong>, <strong>east</strong>, or <strong>west</strong>. Or <strong>examine</strong> your surroundings.',
            },
          ]),
          nextState: CONVENT_STATES.EXPLORATION,
          useAPI: false,
          conventState: {
            ...conventState,
            explorationTurns: conventState.explorationTurns + 1,
          },
          corruptionProfile,
        };
      }
    }

    case CONVENT_STATES.EXPLORATION:
      // Handle exploration mode
      return handleExploration(userInput, conventState);

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
        messages: intervalsToCumulative([
          { delay: 1000, content: 'Ready for what comes next?' },
        ]),
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

/**
 * Handles player movement and exploration in the convent
 * @param {string} userInput - The user's input
 * @param {Object} conventState - Current state including position
 * @returns {Promise<Object>} - Response with messages and updated state
 */
async function handleExploration(userInput, conventState) {
  // Check if exploration limit reached - trigger alarm
  if (
    conventState.explorationTurns >= GAME_CONFIG.convent.MAX_EXPLORATION_TURNS
  ) {
    return {
      messages: intervalsToCumulative([
        {
          delay: 1000,
          content: '<strong>CLANG! CLANG! CLANG!</strong>',
        },
        {
          delay: MIN_DELAY,
          content:
            'A bell tower erupts with deafening alarm bells. The entire convent shakes.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: 'You hear screams. Footsteps. Many footsteps.',
        },
        {
          delay: MIN_DELAY,
          content: 'From every doorway, from every shadow, they emerge.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: '<strong>The nuns have found you.</strong>',
        },
        {
          delay: MIN_DELAY,
          content:
            'They charge. Dozens of them. Their faces twisted in rage—or is it terror?',
        },
        {
          delay: MIN_DELAY,
          content: 'You raise your sword. There are too many.',
        },
        {
          delay: DRAMATIC_DELAY,
          content:
            'They overwhelm you. You feel hands—claws?—tearing at your armor.',
        },
        {
          delay: MIN_DELAY,
          content: 'You swing blindly. Blood sprays. Screams fill the air.',
        },
        {
          delay: DRAMATIC_DELAY,
          content:
            "When it's over, you stand among the bodies. So many bodies.",
        },
        {
          delay: MIN_DELAY,
          content: 'The monsters lie still. Their faces... distorted. Wrong.',
        },
        {
          delay: DRAMATIC_DELAY,
          content: '<em>Were they all monsters?</em>',
        },
      ]),
      nextState: CONVENT_STATES.REVEAL,
      useAPI: false,
      conventState: { ...conventState, playerHP: 0 }, // Player survives but at what cost
    };
  }

  const lowerInput = userInput.toLowerCase().trim();
  const [currentRow, currentCol] = conventState.playerPosition;

  // Handle fight intent - trigger encounter 2 if player has completed encounter 1
  if (
    (lowerInput.includes('fight') ||
      lowerInput.includes('attack') ||
      lowerInput.includes('battle') ||
      lowerInput.includes('combat')) &&
    conventState.currentEncounter === 2
  ) {
    return {
      messages: intervalsToCumulative([
        {
          delay: 1000,
          content:
            "You hear sounds from deeper in the convent. Scraping. Chittering.",
        },
        {
          delay: MIN_DELAY,
          content: "You grip your sword and move toward the noise.",
        },
        {
          delay: MIN_DELAY,
          image: '/src/assets/trials/convent_encounter_2.webp',
        },
        { delay: MIN_DELAY, content: ENCOUNTERS[2].intro },
        { delay: MIN_DELAY, content: ENCOUNTERS[2].glitchIntro },
        {
          delay: MIN_DELAY,
          content: '<span class="blink">What do you do?</span>',
        },
      ]),
      nextState: `${CONVENT_STATES.ENCOUNTER_2}_combat`,
      useAPI: false,
      conventState: { ...conventState, combatHelpCount: 0 },
    };
  }

  // Parse directional movement
  let newRow = currentRow;
  let newCol = currentCol;

  if (lowerInput.includes('north') || lowerInput.includes('up')) {
    newRow = Math.max(0, currentRow - 1);
  } else if (lowerInput.includes('south') || lowerInput.includes('down')) {
    newRow = Math.min(2, currentRow + 1);
  } else if (lowerInput.includes('west') || lowerInput.includes('left')) {
    newCol = Math.max(0, currentCol - 1);
  } else if (lowerInput.includes('east') || lowerInput.includes('right')) {
    newCol = Math.min(2, currentCol + 1);
  }

  // Check if player moved
  if (newRow !== currentRow || newCol !== currentCol) {
    const newPosition = [newRow, newCol];
    const newRoomKey = newPosition.join(',');
    const newRoom = CONVENT_MAP[newRoomKey];
    const hasVisited = conventState.visitedRooms.includes(newRoomKey);

    return {
      messages: intervalsToCumulative([
        {
          delay: 1000,
          content: 'You move through the darkened halls...',
        },
        {
          delay: MIN_DELAY,
          content: `You enter the <strong>${newRoom.name}</strong>.`,
        },
        {
          delay: MIN_DELAY,
          content: newRoom.description,
        },
        {
          delay: MIN_DELAY,
          content: hasVisited
            ? "You've been here before."
            : 'This place feels... wrong somehow.',
        },
      ]),
      nextState: CONVENT_STATES.EXPLORATION,
      useAPI: false,
      conventState: {
        ...conventState,
        playerPosition: newPosition,
        visitedRooms: hasVisited
          ? conventState.visitedRooms
          : [...conventState.visitedRooms, newRoomKey],
        explorationTurns: conventState.explorationTurns + 1,
      },
    };
  }

  // Handle examine/search actions
  if (
    lowerInput.includes('examine') ||
    lowerInput.includes('search') ||
    lowerInput.includes('look') ||
    lowerInput.includes('inspect')
  ) {
    const currentRoomKey = conventState.playerPosition.join(',');
    const currentRoom = CONVENT_MAP[currentRoomKey];

    const interjection = [
      {
        delay: 1000,
        content: `You carefully examine the <strong>${currentRoom.name}</strong>.`,
      },
      {
        delay: MIN_DELAY,
        content:
          "You notice details you didn't see before...",
      },
      {
        delay: MIN_DELAY,
        content:
          "No. No time for rummaging. <strong>They're regrouping</strong>. Go hunt. <em>Finish what you started.</em>",
      },
      {
        delay: MIN_DELAY,
        content: '<span class="blink">What do you do?</span>',
      },
    ];

    return {
      messages: intervalsToCumulative(interjection),
      nextState: CONVENT_STATES.EXPLORATION_SEARCH,
      useAPI: false,
      conventState,
    };
  }

  // Default exploration response (unclear action)
  const currentRoomKey = conventState.playerPosition.join(',');
  const currentRoom = CONVENT_MAP[currentRoomKey];

  return {
    messages: intervalsToCumulative([
      {
        delay: 1000,
        content: `You're in the <strong>${currentRoom.name}</strong>.`,
      },
      {
        delay: MIN_DELAY,
        content:
          'You can move <strong>north</strong>, <strong>south</strong>, <strong>east</strong>, or <strong>west</strong>. Or <strong>examine</strong> your surroundings.',
      },
    ]),
    nextState: CONVENT_STATES.EXPLORATION,
    useAPI: false,
    conventState: {
      ...conventState,
      explorationTurns: conventState.explorationTurns + 1,
    },
  };
}
