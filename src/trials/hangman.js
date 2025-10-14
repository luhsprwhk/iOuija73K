/**
 * Act 2: The Gallows / Hangman Trial
 * Player thinks they can save a condemned man by winning Hangman
 * Reality: The word ensures guilt, the trapdoor always drops
 * Theme: False agency / Frontier justice
 */

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
  return [
    { delay: 1000, content: '...' },
    { delay: 2500, content: 'Good. Now for something different.' },
    {
      delay: 4000,
      content: 'Close your eyes again. New scene. New role.',
    },
    {
      delay: 6500,
      content: `You're a defense attorney now, ${playerName}. It's high noon in a dusty frontier town.`,
    },
    {
      delay: 9000,
      image: '/src/assets/trials/hangman_intro.webp',
    },
    {
      delay: 9000,
      content:
        'The town square is packed. A gallows stands in the center, freshly built. The wood still smells like pine.',
    },
    {
      delay: 11500,
      content:
        "Your client stands on the platform, noose around his neck. He can't speak—gag in his mouth. Or maybe he's just accepted his fate.",
    },
    {
      delay: 14000,
      image: '/src/assets/trials/hangman_cowboy_hanging.webp',
    },
    {
      delay: 16500,
      content:
        'The judge looks at you. "Counselor, you have <strong>50 seconds</strong> to prove his innocence. One word will save him."',
    },
    {
      delay: 19000,
      content:
        "The hangman's hand moves to the lever. The crowd holds its breath.",
    },
    {
      delay: 21000,
      content: 'The game is <strong>Hangman</strong>. Guess the word. Save your client.',
    },
    {
      delay: 23000,
      content: 'Your time starts... now.',
    },
  ];
}

/**
 * Gets the reveal messages when the trapdoor drops
 * @param {string} playerName - The player's name
 * @param {boolean} playerWon - Whether the player guessed the word (doesn't matter for outcome)
 * @param {string} word - The word that was being guessed
 * @returns {Array} - Array of message objects with delays
 */
export function getHangmanReveal(playerName, playerWon, word) {
  if (playerWon) {
    // Player guessed the word correctly - but it damns their client
    return [
      { delay: 1000, content: '...' },
      { delay: 2500, content: `The word was "${word}".` },
      {
        delay: 4000,
        content: 'You solved it. The crowd erupts.',
      },
      {
        delay: 6500,
        audio: '/public/audio/trapdoor_drop.wav',
      },
      {
        delay: 6500,
        content: 'The trapdoor opens.',
      },
      {
        delay: 8500,
        content: 'The rope snaps taut. The body swings. The crowd cheers.',
      },
      {
        delay: 11000,
        content: `Wait. ${playerName}. Did you see what the word was?`,
      },
      {
        delay: 13500,
        content: `"${word}". You didn't save him. You condemned him.`,
      },
      {
        delay: 16000,
        content: 'The jury has spoken. Justice is served.',
      },
      {
        delay: 18500,
        content: 'You played the game perfectly. And he still died.',
      },
    ];
  } else {
    // Player failed to guess in time or gave up
    return [
      { delay: 1000, content: "Time's up." },
      {
        delay: 2500,
        audio: '/public/audio/trapdoor_drop.wav',
      },
      {
        delay: 2500,
        content: 'The trapdoor opens.',
      },
      {
        delay: 4500,
        content: 'The rope snaps taut. The body swings.',
      },
      {
        delay: 7000,
        content: 'The crowd disperses. Another day in the West.',
      },
      {
        delay: 9500,
        content: `You were so close, weren't you, ${playerName}?`,
      },
      {
        delay: 12000,
        content: `The word was "${word}". Would it have mattered?`,
      },
      {
        delay: 14500,
        content: "I don't think it would have.",
      },
    ];
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
    maxWrongGuesses: 6,
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
      |
      |
      |
=========`,
    // 2 wrong guesses
    `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
    // 3 wrong guesses
    `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
    // 4 wrong guesses
    `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
    // 5 wrong guesses
    `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
    // 6 wrong guesses - game over
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
