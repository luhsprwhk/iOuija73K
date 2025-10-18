/**
 * Tests for Hangman Trial
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeHangmanGame,
  processGuess,
  getWordDisplay,
  getHangmanArt,
  getTimeRemaining,
} from './hangman.js';

describe('Hangman Trial', () => {
  describe('initializeHangmanGame', () => {
    it('should initialize a game with a word from the word list', () => {
      const game = initializeHangmanGame();

      expect(game.word).toBeDefined();
      expect(['GUILTY', 'HANGED', 'CONDEMNED']).toContain(game.word);
      expect(game.guessedLetters).toEqual([]);
      expect(game.wrongGuesses).toBe(0);
      expect(game.maxWrongGuesses).toBe(3);
      expect(game.gameOver).toBe(false);
      expect(game.won).toBe(false);
      expect(game.startTime).toBeDefined();
      expect(game.timeLimit).toBe(50000); // 50 seconds in milliseconds
    });
  });

  describe('getWordDisplay', () => {
    it('should show underscores for unguessed letters', () => {
      const display = getWordDisplay('GUILTY', []);
      expect(display).toBe('_ _ _ _ _ _');
    });

    it('should show guessed letters', () => {
      const display = getWordDisplay('GUILTY', ['G', 'L']);
      expect(display).toBe('G _ _ L _ _');
    });

    it('should show complete word when all letters guessed', () => {
      const display = getWordDisplay('GUILTY', ['G', 'U', 'I', 'L', 'T', 'Y']);
      expect(display).toBe('G U I L T Y');
    });
  });

  describe('getHangmanArt', () => {
    it('should return empty gallows for 0 wrong guesses', () => {
      const art = getHangmanArt(0);
      expect(art).toContain('+---+');
      expect(art).not.toContain('O'); // No head
    });

    it('should show head for 1 wrong guess', () => {
      const art = getHangmanArt(1);
      expect(art).toContain('O');
      // Body is represented by vertical line, but frame also has pipes
      // Check that body parts (/, \) are not present yet
      expect(art).not.toMatch(/\/|\\/); // No arms or legs yet
    });

    it('should show complete hangman for 6 wrong guesses', () => {
      const art = getHangmanArt(6);
      expect(art).toContain('O'); // Head
      expect(art).toContain('/|\\'); // Arms
      expect(art).toContain('/ \\'); // Legs
    });
  });

  describe('processGuess', () => {
    let gameState;

    beforeEach(() => {
      gameState = {
        word: 'GUILTY',
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
        startTime: Date.now(),
        timeLimit: 50000,
        gameOver: false,
        won: false,
      };
    });

    it('should accept correct letter guess', () => {
      const result = processGuess(gameState, 'G');

      expect(result.guessedLetters).toContain('G');
      expect(result.wrongGuesses).toBe(0);
      expect(result.lastGuess.correct).toBe(true);
      expect(result.gameOver).toBe(false);
    });

    it('should accept incorrect letter guess', () => {
      const result = processGuess(gameState, 'Z');

      expect(result.guessedLetters).toContain('Z');
      expect(result.wrongGuesses).toBe(1);
      expect(result.lastGuess.correct).toBe(false);
      expect(result.gameOver).toBe(false);
    });

    it('should reject duplicate letter guess', () => {
      const state1 = processGuess(gameState, 'G');
      const result = processGuess(state1, 'G');

      expect(result.error).toBe('You already guessed that letter');
      expect(result.guessedLetters.length).toBe(1); // Still only one G
    });

    it('should reject invalid input', () => {
      const result = processGuess(gameState, '12');
      expect(result.error).toBe('Please guess a single letter (A-Z)');
    });

    it('should convert lowercase to uppercase', () => {
      const result = processGuess(gameState, 'g');
      expect(result.guessedLetters).toContain('G');
      expect(result.lastGuess.letter).toBe('G');
    });

    it('should detect win when all letters guessed', () => {
      let state = gameState;
      ['G', 'U', 'I', 'L', 'T', 'Y'].forEach((letter) => {
        state = processGuess(state, letter);
      });

      expect(state.gameOver).toBe(true);
      expect(state.won).toBe(true);
    });

    it('should detect loss when too many wrong guesses', () => {
      let state = gameState;
      ['Z', 'X', 'W', 'V', 'K', 'Q'].forEach((letter) => {
        state = processGuess(state, letter);
      });

      expect(state.gameOver).toBe(true);
      expect(state.won).toBe(false);
      expect(state.wrongGuesses).toBe(6);
    });

    it('should detect timeout', () => {
      // Create game state that started 51 seconds ago
      const expiredState = {
        ...gameState,
        startTime: Date.now() - 51000,
      };

      const result = processGuess(expiredState, 'G');

      expect(result.gameOver).toBe(true);
      expect(result.timeExpired).toBe(true);
    });
  });

  describe('getTimeRemaining', () => {
    it('should return correct time remaining', () => {
      const gameState = {
        startTime: Date.now(),
        timeLimit: 50000,
      };

      const timeRemaining = getTimeRemaining(gameState);
      expect(timeRemaining).toBeGreaterThan(48);
      expect(timeRemaining).toBeLessThanOrEqual(50);
    });

    it('should return 0 when time expired', () => {
      const gameState = {
        startTime: Date.now() - 60000, // Started 60 seconds ago
        timeLimit: 50000, // 50 second limit
      };

      const timeRemaining = getTimeRemaining(gameState);
      expect(timeRemaining).toBe(0);
    });
  });


  describe('Integration: Full game playthrough', () => {
    it('should play through a winning game', () => {
      let game = initializeHangmanGame();
      game.word = 'GUILTY'; // Force specific word for testing

      // Guess all letters
      game = processGuess(game, 'G');
      expect(game.wrongGuesses).toBe(0);

      game = processGuess(game, 'U');
      expect(game.wrongGuesses).toBe(0);

      game = processGuess(game, 'I');
      expect(game.wrongGuesses).toBe(0);

      game = processGuess(game, 'L');
      expect(game.wrongGuesses).toBe(0);

      game = processGuess(game, 'T');
      expect(game.wrongGuesses).toBe(0);

      game = processGuess(game, 'Y');
      expect(game.wrongGuesses).toBe(0);

      expect(game.gameOver).toBe(true);
      expect(game.won).toBe(true);
    });

    it('should play through a losing game', () => {
      let game = initializeHangmanGame();
      game.word = 'GUILTY';

      // Make 6 wrong guesses
      const wrongLetters = ['Z', 'X', 'W', 'V', 'K', 'Q'];
      wrongLetters.forEach((letter) => {
        game = processGuess(game, letter);
      });

      expect(game.gameOver).toBe(true);
      expect(game.won).toBe(false);
      expect(game.wrongGuesses).toBe(6);
    });
  });
});
