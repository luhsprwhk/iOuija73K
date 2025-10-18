/**
 * Act 2: The Gallows / Hangman Trial
 * Player thinks they can save a condemned man by winning Hangman
 * Reality: The word ensures guilt, the trapdoor always drops
 * Theme: False agency / Frontier justice
 */

import {
  intervalsToCumulative,
  MIN_DELAY,
  MAX_DELAY,
} from '../lib/helpers/chat.js';

export const HANGMAN_STATES = {
  INTRO: 'intro',
  EXPLORATION: 'exploration', // Player can explore and interact before game starts
  PLAYING: 'playing',
  REVEAL: 'reveal',
  COMPLETE: 'complete',
};

// Maximum number of exploration attempts before execution
const MAX_ATTEMPTS = 6;

// Glitching timer values for red herring effect
const GLITCH_TIMER_VALUES = [
  '99:99',
  '06:66',
  '13:37',
  '00:00',
  '42:00',
  '??:??',
  '88:88',
  '01:23',
  'TIME IS A FLAT CIRCLE',
  '∞',
  '---',
];

/**
 * Gets the intro messages for the Hangman trial
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getHangmanIntro(playerName) {
  return intervalsToCumulative([
    { delay: 1000, content: '...' },
    { delay: MIN_DELAY, content: 'Good. Now for something different.' },
    {
      delay: MAX_DELAY,
      content: `<span style="font-weight: bold;">You're a defense attorney now, ${playerName}. It's high noon in a dusty frontier town.</span>`,
    },
    {
      delay: MAX_DELAY,
      image: '/src/assets/trials/hangman_intro.webp',
    },
    {
      delay: MAX_DELAY,
      content:
        'The town square is packed. A gallows stands in the center, freshly built. The wood still smells like pine.',
    },
    {
      delay: MAX_DELAY,
      content:
        "Your client stands on the platform, noose around his neck. He can't speak—gag in his mouth. Or maybe he's just accepted his fate.",
    },
    {
      delay: MAX_DELAY,
      image: '/src/assets/trials/hangman_cowboy_hanging.webp',
    },
    {
      delay: MAX_DELAY,
      content:
        "Strangely, they've already started to crucify him. His hands are nailed to the cross. He is in agony. And since the wounds look fresh, it's clear he's just been pinned there.",
    },
    {
      delay: MAX_DELAY,
      content:
        'The judge looks at you. "Counselor, you have <strong>5 minutes</strong> to prove his innocence."',
    },
    {
      delay: MIN_DELAY,
      content:
        "The hangman's hand moves to the lever. The crowd holds its breath.",
    },
    {
      delay: MIN_DELAY,
      content: 'First, let us recap the details of the case.',
    },
    {
      delay: MAX_DELAY,
      content:
        'Your client, a small-time rancher and former buffalo soldier, the man you see nailed to the cross, stands accused of murdering Clayton Hargrave—foreman to the most powerful cattle baron in the territory.',
    },
    {
      delay: MAX_DELAY,
      content:
        "The cattle baron wants your client's land—it controls the only water source for miles. He's tried to buy it three times. Each time, refused.",
    },
    {
      delay: MAX_DELAY,
      content:
        "Two weeks ago, cattle branded with your client's mark were found on his property. The baron claims they were stolen. Your client says they were mavericks—unbranded strays, his by right.",
    },
    {
      delay: MIN_DELAY,
      content:
        'The most important thing to remember is this: Justice in the West can be swift. Or not. But it is always entertaining, if sometimes, a little sad.',
    },
    {
      delay: MIN_DELAY,
      content: 'Your time starts... now. What do you do?',
    },
  ]);
}

/**
 * Gets the reveal messages when the trapdoor drops
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getHangmanReveal(playerName) {
  return intervalsToCumulative([
    { delay: 1000, content: '...' },
    { 
      delay: MIN_DELAY, 
      content: "Oh, were you watching the timer?" 
    },
    {
      delay: MIN_DELAY,
      content: "How cute.",
    },
    {
      delay: MAX_DELAY,
      audio: '/public/audio/trapdoor_drop.wav',
    },
    {
      delay: 0,
      content: 'The trapdoor opens.',
    },
    {
      delay: MAX_DELAY,
      content: 'The rope snaps taut. The body swings. The crowd cheers.',
    },
    {
      delay: MIN_DELAY,
      content: "Time doesn't matter here, " + playerName + ".",
    },
    {
      delay: MAX_DELAY,
      content: "But you're out of chances.",
    },
    {
      delay: MAX_DELAY,
      content: `And even if you had more... did you really think he was going to climb down with his hands nailed through? You're crazy!`,
    },
    {
      delay: MIN_DELAY,
      content: "Justice is served. Another day in the West.",
    },
  ]);
}

/**
 * Initializes the hangman exploration state
 * @returns {Object} - Exploration state object
 */
export function initializeHangmanExploration() {
  return {
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    gameOver: false,
    startTime: Date.now(),
  };
}

/**
 * Gets a random glitching timer value
 * @returns {string} - A glitched timer display value
 */
export function getGlitchTimerValue() {
  return GLITCH_TIMER_VALUES[
    Math.floor(Math.random() * GLITCH_TIMER_VALUES.length)
  ];
}

/**
 * Gets the condemned man's condition description based on attempts
 * @param {number} attempts - Number of exploration attempts made
 * @returns {string} - Description of the condemned man's worsening state
 */
export function getCondemnedState(attempts) {
  const states = [
    'The condemned man stands rigid, eyes wide with terror. His chest heaves with panicked breaths.',
    'Blood drips slowly from his nailed hands. He tries to shift his weight but the noose tightens.',
    'His breathing becomes ragged. The wounds in his hands are widening. He whimpers through the gag.',
    'His legs tremble violently. Sweat and blood mix on his face. His eyes plead silently.',
    'He can barely stand now. The cross creaks under his shifting weight. His skin has gone pale.',
    'His body sags. The noose pulls tighter. His eyes begin to glaze over. Time is almost up.',
    'He is barely conscious. The crowd leans forward in anticipation.',
  ];

  return states[Math.min(attempts, states.length - 1)];
}

/**
 * Processes an exploration attempt
 * @param {Object} explorationState - Current exploration state
 * @returns {Object} - Updated exploration state
 */
export function processExplorationAttempt(explorationState) {
  const newAttempts = explorationState.attempts + 1;
  const gameOver = newAttempts >= explorationState.maxAttempts;

  return {
    ...explorationState,
    attempts: newAttempts,
    gameOver,
  };
}

/**
 * Gets a glitching timer display that changes randomly
 * @param {Object} explorationState - Current exploration state
 * @returns {string} - Glitched timer value
 */
export function getGlitchingTimer(explorationState) {
  // Timer glitches more frequently as attempts increase
  const shouldGlitch = Math.random() < 0.3 + explorationState.attempts * 0.1;
  
  if (shouldGlitch) {
    return getGlitchTimerValue();
  }
  
  // Sometimes show a "normal" countdown that doesn't make sense
  const elapsed = Math.floor((Date.now() - explorationState.startTime) / 1000);
  const fakeRemaining = Math.max(0, 50 - elapsed + Math.floor(Math.random() * 20 - 10));
  const minutes = Math.floor(fakeRemaining / 60);
  const seconds = fakeRemaining % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Gets the exploration status display
 * @param {Object} explorationState - Current exploration state
 * @returns {string} - Formatted status message with glitching timer
 */
export function getExplorationStatus(explorationState) {
  const timer = getGlitchingTimer(explorationState);
  const conditionDesc = getCondemnedState(explorationState.attempts);
  
  return `🐟 **Time Remaining:** <span style="color: #ff0000; font-weight: bold;">${timer}</span>\n\n${conditionDesc}`;
}

/**
 * Handles the glitching timer updates
 * @param {Object} options - The options for the timer handler.
 * @param {Object} options.explorationState - The current exploration state.
 * @param {Function} options.onTick - Callback function for each timer tick.
 */
export function handleGlitchingTimer({ explorationState, onTick }) {
  // Update timer display with glitching values
  const timerDisplay = getGlitchingTimer(explorationState);
  onTick(timerDisplay);
}
