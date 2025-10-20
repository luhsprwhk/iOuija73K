import { describe, it, expect, vi } from 'vitest';
import {
  handleNumberGuess,
  getNumberTrialIntro,
} from '../../src/trials/numberGuessing.js';

describe('numberGuessing trial', () => {
  describe('getNumberTrialIntro', () => {
    it('should return intro messages with player name', () => {
      const messages = getNumberTrialIntro('Alice');

      expect(messages).toHaveLength(8);
      expect(messages[0].content).toContain('Alice');
      expect(messages[0].delay).toBe(800);
      expect(messages[7].showButton).toBe(true);
    });

    it('should include instructions about the number game', () => {
      const messages = getNumberTrialIntro('Bob');
      const content = messages.map((m) => m.content).join(' ');

      expect(content).toContain('Think of a number');
      expect(content).toContain('between 1 and 50');
      expect(content).toContain('odd');
    });
  });

  describe('handleNumberGuess - first guess attempt', () => {
    it('should guess 37 on first attempt', () => {
      const result = handleNumberGuess(null, 0, 'Alice', mockGetBrowserDetails);

      expect(result.nextAttempt).toBe(1);
      expect(result.gameComplete).toBe(false);
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toBe('<i>Your number is 37.</i>');
      expect(result.messages[1].content).toContain("I'm right");
      expect(result.messages[1].showButtons).toBe(true);
    });

    it('should not reveal name on first guess', () => {
      const result = handleNumberGuess(
        false,
        0,
        'Alice',
        mockGetBrowserDetails
      );

      expect(result.revealName).toBeUndefined();
    });
  });

  describe('handleNumberGuess - confirmation responses', () => {
    it('should detect true as confirmation', () => {
      const result = handleNumberGuess(true, 1, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
      expect(result.messages.some((m) => m.content.includes('Paimon'))).toBe(
        true
      );
    });

    it('should complete game on yes confirmation', () => {
      const result = handleNumberGuess(true, 1, 'Bob', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
    });

    it('should complete game on confirmation at attempt 1', () => {
      const result = handleNumberGuess(
        true,
        1,
        'Charlie',
        mockGetBrowserDetails
      );

      expect(result.gameComplete).toBe(true);
    });

    it('should complete game on confirmation at attempt 2', () => {
      const result = handleNumberGuess(true, 2, 'Dave', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should complete game on confirmation at attempt 3', () => {
      const result = handleNumberGuess(true, 1, 'Eve', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should reveal name on confirmation', () => {
      const result = handleNumberGuess(true, 1, 'Frank', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
    });

    it('should handle confirmation properly', () => {
      const result = handleNumberGuess(true, 1, 'Grace', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should complete on yes button click', () => {
      const result = handleNumberGuess(true, 1, 'Hank', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });
  });

  describe('handleNumberGuess - subsequent guesses', () => {
    it('should guess 13 on second attempt', () => {
      const result = handleNumberGuess(
        false,
        1,
        'Alice',
        mockGetBrowserDetails
      );

      expect(result.nextAttempt).toBe(2);
      expect(result.gameComplete).toBe(false);
      expect(result.messages[0].content).toContain('13');
      expect(result.messages[0].showButtons).toBe(true);
    });

    it('should guess 17 on third attempt', () => {
      const result = handleNumberGuess(false, 2, 'Bob', mockGetBrowserDetails);

      expect(result.nextAttempt).toBe(3);
      expect(result.gameComplete).toBe(false);
      expect(result.messages[0].content).toContain('17');
    });

    it('should add buttons to subsequent guesses', () => {
      const result = handleNumberGuess(
        false,
        1,
        'Alice',
        mockGetBrowserDetails
      );

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].showButtons).toBe(true);
    });
  });

  describe('handleNumberGuess - fallback to browser details', () => {
    const mockGetBrowserDetails = () => ({
      timeOfDay: 'evening',
      browser: 'Chrome',
      os: 'macOS',
    });

    it('should use browser details after all guesses fail', () => {
      const result = handleNumberGuess(
        false,
        3,
        'Alice',
        mockGetBrowserDetails
      );

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
      expect(result.messages.some((m) => m.content.includes('evening'))).toBe(
        true
      );
      expect(result.messages.some((m) => m.content.includes('Chrome'))).toBe(
        true
      );
      expect(result.messages.some((m) => m.content.includes('macOS'))).toBe(
        true
      );
    });

    it('should reveal Paimon name in fallback path', () => {
      const result = handleNumberGuess(false, 3, 'Bob', mockGetBrowserDetails);

      expect(result.messages.some((m) => m.content.includes('Paimon'))).toBe(
        true
      );
      expect(result.messages.some((m) => m.content.includes('Raphael'))).toBe(
        true
      );
    });

    it('should include player name in browser details response', () => {
      const result = handleNumberGuess(
        false,
        3,
        'Charlie',
        mockGetBrowserDetails
      );

      expect(result.messages.some((m) => m.content.includes('Charlie'))).toBe(
        true
      );
    });

    it('should call getBrowserDetails function', () => {
      const mockFn = vi.fn(() => ({
        timeOfDay: 'morning',
        browser: 'Firefox',
        os: 'Linux',
      }));

      const result = handleNumberGuess(false, 3, 'Dave', mockFn);

      expect(mockFn).toHaveBeenCalledOnce();
      expect(result.messages.some((m) => m.content.includes('morning'))).toBe(
        true
      );
    });
  });

  describe('handleNumberGuess - successful guess reveals name', () => {
    it('should reveal demon name in success path', () => {
      const result = handleNumberGuess(true, 1, 'Alice', mockGetBrowserDetails);

      expect(
        result.messages.some((m) => m.content.includes("My name isn't Raphael"))
      ).toBe(true);

    });

  });

  describe('handleNumberGuess - edge cases', () => {
    it('should not trigger confirmation on attempt 0', () => {
      const result = handleNumberGuess(true, 0, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(false);
    });

    it('should handle yes button click properly', () => {
      const result = handleNumberGuess(true, 1, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should continue on no button click', () => {
      const result = handleNumberGuess(
        false,
        1,
        'Alice',
        mockGetBrowserDetails
      );

      expect(result.gameComplete).toBe(false);
    });

    it('should handle null for initial guess', () => {
      const result = handleNumberGuess(null, 1, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(false);
      expect(result.nextAttempt).toBe(2);
    });
  });
});

// Mock function for browser details
function mockGetBrowserDetails() {
  return {
    timeOfDay: 'afternoon',
    browser: 'TestBrowser',
    os: 'TestOS',
  };
}
