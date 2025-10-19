/**
 * Tests for Hangman Trial (Exploration-Based System)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeHangmanExploration,
  processExplorationAttempt,
  getCondemnedState,
  getGlitchingTimer,
  getGlitchTimerValue,
  getExplorationStatus,
} from '../../src/trials/hangman.js';

describe('Hangman Trial - Exploration System', () => {
  describe('initializeHangmanExploration', () => {
    it('should initialize exploration state with 0 attempts', () => {
      const state = initializeHangmanExploration();

      expect(state.attempts).toBe(0);
      expect(state.maxAttempts).toBe(6);
      expect(state.gameOver).toBe(false);
      expect(state.startTime).toBeDefined();
      expect(state.startTime).toBeCloseTo(Date.now(), -2);
    });
  });

  describe('getCondemnedState', () => {
    it('should return initial state for 0 attempts', () => {
      const state = getCondemnedState(0);
      expect(state).toContain('stands rigid');
      expect(state).toContain('terror');
    });

    it('should show worsening condition with more attempts', () => {
      const state0 = getCondemnedState(0);
      const state3 = getCondemnedState(3);
      const state6 = getCondemnedState(6);

      expect(state0).toContain('stands rigid');
      expect(state3).toContain('tremble');
      expect(state6).toContain('barely conscious');
    });

    it('should not exceed max state description', () => {
      const state10 = getCondemnedState(10);
      const state6 = getCondemnedState(6);
      expect(state10).toBe(state6); // Should cap at final state
    });
  });

  describe('getGlitchTimerValue', () => {
    it('should return a glitched timer value', () => {
      const value = getGlitchTimerValue();
      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    });

    it('should return different values on multiple calls', () => {
      const values = new Set();
      for (let i = 0; i < 20; i++) {
        values.add(getGlitchTimerValue());
      }
      // Should get at least a few different values in 20 tries
      expect(values.size).toBeGreaterThan(1);
    });
  });

  describe('processExplorationAttempt', () => {
    let explorationState;

    beforeEach(() => {
      explorationState = initializeHangmanExploration();
    });

    it('should increment attempts by 1', () => {
      const result = processExplorationAttempt(explorationState);
      expect(result.attempts).toBe(1);
      expect(result.gameOver).toBe(false);
    });

    it('should not end game before max attempts', () => {
      let state = explorationState;
      for (let i = 0; i < 5; i++) {
        state = processExplorationAttempt(state);
      }
      expect(state.attempts).toBe(5);
      expect(state.gameOver).toBe(false);
    });

    it('should end game after 6 attempts', () => {
      let state = explorationState;
      for (let i = 0; i < 6; i++) {
        state = processExplorationAttempt(state);
      }
      expect(state.attempts).toBe(6);
      expect(state.gameOver).toBe(true);
    });

    it('should preserve other state properties', () => {
      const result = processExplorationAttempt(explorationState);
      expect(result.maxAttempts).toBe(6);
      expect(result.startTime).toBe(explorationState.startTime);
    });
  });

  describe('getGlitchingTimer', () => {
    it('should return a timer display string', () => {
      const state = initializeHangmanExploration();
      const timer = getGlitchingTimer(state);

      expect(timer).toBeDefined();
      expect(typeof timer).toBe('string');
    });

    it('should sometimes return glitched values', () => {
      const state = {
        ...initializeHangmanExploration(),
        attempts: 5, // High attempts increase glitch probability
      };

      const timers = new Set();
      for (let i = 0; i < 50; i++) {
        timers.add(getGlitchingTimer(state));
      }

      // Should get variety of values (glitched and normal)
      expect(timers.size).toBeGreaterThan(1);
    });
  });

  describe('getExplorationStatus', () => {
    it('should show different conditions based on attempts', () => {
      const state0 = { ...initializeHangmanExploration(), attempts: 0 };
      const state5 = { ...initializeHangmanExploration(), attempts: 5 };

      const status0 = getExplorationStatus(state0);
      const status5 = getExplorationStatus(state5);

      expect(status0).not.toBe(status5);
    });
  });

  describe('Integration: Full exploration playthrough', () => {
    it('should progress through all attempts until game over', () => {
      let state = initializeHangmanExploration();

      // Make 6 exploration attempts
      for (let i = 1; i <= 6; i++) {
        expect(state.gameOver).toBe(false);
        state = processExplorationAttempt(state);
        expect(state.attempts).toBe(i);

        // Check condemned man's condition worsens
        const condition = getCondemnedState(state.attempts);
        expect(condition).toBeDefined();
      }

      expect(state.gameOver).toBe(true);
      expect(state.attempts).toBe(6);
    });

    it('should maintain consistent state throughout exploration', () => {
      let state = initializeHangmanExploration();
      const originalStartTime = state.startTime;

      // Make several attempts
      for (let i = 0; i < 3; i++) {
        state = processExplorationAttempt(state);
      }

      // Start time should not change
      expect(state.startTime).toBe(originalStartTime);
      expect(state.maxAttempts).toBe(6);
    });
  });
});
