/**
 * Act 2: The Gallows / Hangman Trial
 * Player thinks they can save a condemned man by winning Hangman
 * Reality: The word ensures guilt, the trapdoor always drops
 * Theme: False agency / Frontier justice
 */

import { intervalsToCumulative } from './utils.js';

export const HANGMAN_STATES = {
  INTRO: 'intro',
  PLAYING: 'playing',
  REVEAL: 'reveal',
  COMPLETE: 'complete',
};

// Words that ensure the condemned is guilty - player can't win
const HANGMAN_WORDS = ['GUILTY', 'HANGED', 'CONDEMNED'];

// Timer duration in seconds
const TIMER_DURATION = 50;

/**
 * Gets the intro messages for the Hangman trial
 * @param {string} playerName - The player's name
 * @returns {Array} - Array of message objects with delays
 */
export function getHangmanIntro(playerName) {
  const minDelay = 3000;
  const maxDelay = 5000;

  return intervalsToCumulative([
    { delay: 1000, content: '...' },
    { delay: minDelay, content: 'Good. Now for something different.' },
    {
      delay: maxDelay,
      content: `<span style="font-weight: bold;">You're a defense attorney now, ${playerName}. It's high noon in a dusty frontier town.</span>`,
    },
    {
      delay: maxDelay,
      image: '/src/assets/trials/hangman_intro.webp',
    },
    {
      delay: maxDelay,
      content:
        'The town square is packed. A gallows stands in the center, freshly built. The wood still smells like pine.',
    },
    {
      delay: maxDelay,
      content:
        "Your client stands on the platform, noose around his neck. He can't speak—gag in his mouth. Or maybe he's just accepted his fate.",
    },
    {
      delay: maxDelay,
      image: '/src/assets/trials/hangman_cowboy_hanging.webp',
    },
    {
      delay: maxDelay,
      content:
        'The judge looks at you. "Counselor, you have <strong>5 minutes</strong> to prove his innocence."',
    },
    {
      delay: minDelay,
      content:
        "The hangman's hand moves to the lever. The crowd holds its breath.",
    },
    {
      delay: minDelay,
      content: 'First, let us recap the details of the case.',
    },
    {
      delay: maxDelay,
      content:
        'Your client, a small-time rancher, stands accused of murdering Clayton Hargrave—foreman to the most powerful cattle baron in the territory.',
    },
    {
      delay: maxDelay,
      content:
        "The cattle baron wants your client's land—it controls the only water source for miles. He's tried to buy it three times. Each time, refused.",
    },
    {
      delay: maxDelay,
      content:
        "Two weeks ago, cattle branded with your client's mark were found on his property. The baron claims they were stolen. Your client says they were mavericks—unbranded strays, his by right.",
    },
    {
      delay: minDelay,
      content:
        'Justice in the West is swift. And it is always entertaining, if sometimes, a little sad.',
    },
    {
      delay: minDelay,
      content: 'Your time starts... now.',
    },
  ]);
}

/**
 * Gets the reveal messages when the trapdoor drops
 * @param {string} playerName - The player's name
 * @param {boolean} playerWon - Whether the player guessed the word (doesn't matter for outcome)
 * @param {string} word - The word that was being guessed
 * @returns {Array} - Array of message objects with delays
 */
export function getHangmanReveal(playerName, playerWon, word) {
  const minDelay = 3000;
  const maxDelay = 5000;

  if (playerWon) {
    // Player guessed the word correctly - but it damns their client
    return intervalsToCumulative([
      { delay: 1000, content: '...' },
      { delay: minDelay, content: `The word was "${word}".` },
      {
        delay: minDelay,
        content: 'You solved it. The crowd erupts. Yayhooray!',
      },
      {
        delay: minDelay,
        audio: '/public/audio/trapdoor_drop.wav',
      },
      {
        delay: 0,
        content: 'The trapdoor opens.',
      },
      {
        delay: maxDelay,
        content: 'The rope snaps taut. The body swings. The crowd cheers.',
      },
      {
        delay: minDelay,
        content: "I'll be damned! Reckon that was justice,then?",
      },
    ]);
  } else {
    // Player failed to guess in time or gave up
    return intervalsToCumulative([
      { delay: 1000, content: "Time's up." },
      {
        delay: minDelay,
        audio: '/public/audio/trapdoor_drop.wav',
      },
      {
        delay: 0,
        content: 'The trapdoor opens.',
      },
      {
        delay: minDelay,
        content: 'The rope snaps taut. The body swings.',
      },
      {
        delay: minDelay,
        content: 'The crowd disperses. Another day in the West.',
      },
      {
        delay: minDelay,
        content: `You were so close, weren't you, ${playerName}?`,
      },
      {
        delay: maxDelay,
        content: `The word was "${word}". Would it have mattered?`,
      },
      {
        delay: minDelay,
        content: "I don't think it would have.",
      },
    ]);
  }
}

/**
 * Initializes a new hangman game
 * @returns {Object} - Game state object
 */
export function initializeHangmanGame() {
  const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];

  return {
    word,
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: 3,
    startTime: Date.now(),
    timeLimit: TIMER_DURATION * 1000, // Convert to milliseconds
    gameOver: false,
    won: false,
  };
}

/**
 * Gets the current display state of the word
 * @param {string} word - The target word
 * @param {Array} guessedLetters - Letters that have been guessed
 * @returns {string} - Display string with underscores for unguessed letters
 */
export function getWordDisplay(word, guessedLetters) {
  return word
    .split('')
    .map((letter) => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ');
}

/**
 * Gets the hangman ASCII art based on wrong guesses
 * @param {number} wrongGuesses - Number of wrong guesses
 * @returns {string} - ASCII art of hangman
 */
export function getHangmanArt(wrongGuesses) {
  const stages = [
    // 0 wrong guesses
    `
  +---+
  |   |
      |
      |
      |
      |
=========`,
    // 1 wrong guess
    `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
    // 2 wrong guesses
    `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
    // 3 wrong guesses - game over
    `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
  ];

  return stages[Math.min(wrongGuesses, stages.length - 1)];
}

/**
 * Processes a letter guess
 * @param {Object} gameState - Current game state
 * @param {string} letter - The guessed letter (single character)
 * @returns {Object} - Updated game state with result info
 */
export function processGuess(gameState, letter) {
  // Validate input
  if (!letter || letter.length !== 1 || !/[A-Z]/i.test(letter)) {
    return {
      ...gameState,
      error: 'Please guess a single letter (A-Z)',
    };
  }

  const upperLetter = letter.toUpperCase();

  // Check if already guessed
  if (gameState.guessedLetters.includes(upperLetter)) {
    return {
      ...gameState,
      error: 'You already guessed that letter',
    };
  }

  // Add to guessed letters
  const newGuessedLetters = [...gameState.guessedLetters, upperLetter];

  // Check if letter is in word
  const isCorrect = gameState.word.includes(upperLetter);
  const newWrongGuesses = isCorrect
    ? gameState.wrongGuesses
    : gameState.wrongGuesses + 1;

  // Check win condition (all letters guessed)
  const won = gameState.word
    .split('')
    .every((letter) => newGuessedLetters.includes(letter));

  // Check lose condition (too many wrong guesses or time expired)
  const timeElapsed = Date.now() - gameState.startTime;
  const timeExpired = timeElapsed >= gameState.timeLimit;
  const lost = newWrongGuesses >= gameState.maxWrongGuesses || timeExpired;

  return {
    ...gameState,
    guessedLetters: newGuessedLetters,
    wrongGuesses: newWrongGuesses,
    gameOver: won || lost,
    won,
    timeExpired,
    lastGuess: {
      letter: upperLetter,
      correct: isCorrect,
    },
    error: null,
  };
}

/**
 * Gets the time remaining in seconds
 * @param {Object} gameState - Current game state
 * @returns {number} - Seconds remaining (or 0 if expired)
 */
export function getTimeRemaining(gameState) {
  const elapsed = Date.now() - gameState.startTime;
  const remaining = Math.max(0, gameState.timeLimit - elapsed);
  return Math.ceil(remaining / 1000);
}

/**
 * Gets just the game info text (without ASCII art)
 * @param {Object} gameState - Current game state
 * @returns {string} - Formatted game info message
 */
export function getGameInfo(gameState) {
  const wordDisplay = getWordDisplay(gameState.word, gameState.guessedLetters);
  const timeRemaining = getTimeRemaining(gameState);
  const guessedLettersDisplay =
    gameState.guessedLetters.length > 0
      ? gameState.guessedLetters.join(', ')
      : 'None';

  let status = `**Word:** ${wordDisplay}\n**Time remaining:** ${timeRemaining}s\n**Wrong guesses:** ${gameState.wrongGuesses}/${gameState.maxWrongGuesses}\n**Guessed letters:** ${guessedLettersDisplay}`;

  if (gameState.lastGuess) {
    if (gameState.lastGuess.correct) {
      status += `\n\n✓ "${gameState.lastGuess.letter}" is in the word!`;
    } else {
      status += `\n\n✗ "${gameState.lastGuess.letter}" is not in the word.`;
    }
  }

  if (gameState.error) {
    status += `\n\n⚠ ${gameState.error}`;
  }

  if (!gameState.gameOver) {
    status += '\n\nGuess a letter:';
  }

  return status;
}

/**
 * Formats the current game status for display
 * @param {Object} gameState - Current game state
 * @returns {string} - Formatted status message
 */
export function getGameStatus(gameState) {
  const wordDisplay = getWordDisplay(gameState.word, gameState.guessedLetters);
  const hangmanArt = getHangmanArt(gameState.wrongGuesses);
  const timeRemaining = getTimeRemaining(gameState);
  const guessedLettersDisplay =
    gameState.guessedLetters.length > 0
      ? gameState.guessedLetters.join(', ')
      : 'None';

  let status = `\`\`\`
${hangmanArt}

Word: ${wordDisplay}
Time remaining: ${timeRemaining}s
Wrong guesses: ${gameState.wrongGuesses}/${gameState.maxWrongGuesses}
Guessed letters: ${guessedLettersDisplay}
\`\`\``;

  if (gameState.lastGuess) {
    if (gameState.lastGuess.correct) {
      status += `\n\n✓ "${gameState.lastGuess.letter}" is in the word!`;
    } else {
      status += `\n\n✗ "${gameState.lastGuess.letter}" is not in the word.`;
    }
  }

  if (gameState.error) {
    status += `\n\n⚠ ${gameState.error}`;
  }

  if (!gameState.gameOver) {
    status += '\n\nGuess a letter:';
  }

  return status;
}
