import { describe, it, expect, vi } from 'vitest';
import { handleNumberGuess, getNumberTrialIntro } from './numberGuessing.js';

describe('numberGuessing trial', () => {
  describe('getNumberTrialIntro', () => {
    it('should return intro messages with player name', () => {
      const messages = getNumberTrialIntro('Alice');

      expect(messages).toHaveLength(4);
      expect(messages[0].content).toContain('Alice');
      expect(messages[0].delay).toBe(800);
      expect(messages[3].showButton).toBe(true);
    });

    it('should include instructions about the number game', () => {
      const messages = getNumberTrialIntro('Bob');
      const content = messages.map(m => m.content).join(' ');

      expect(content).toContain('Think of a number');
      expect(content).toContain('between 1 and 50');
      expect(content).toContain('odd');
    });
  });

  describe('handleNumberGuess - first guess attempt', () => {
    it('should guess 37 on first attempt', () => {
      const result = handleNumberGuess('ready', 0, 'Alice', mockGetBrowserDetails);

      expect(result.nextAttempt).toBe(1);
      expect(result.gameComplete).toBe(false);
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toBe('Your number is 37.');
      expect(result.messages[1].content).toContain("I'm right");
    });

    it('should not reveal name on first guess', () => {
      const result = handleNumberGuess('no', 0, 'Alice', mockGetBrowserDetails);

      expect(result.revealName).toBeUndefined();
    });
  });

  describe('handleNumberGuess - confirmation responses', () => {
    it('should detect "yes" as confirmation', () => {
      const result = handleNumberGuess('yes', 1, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
      expect(result.messages.some(m => m.content.includes('Paimon'))).toBe(true);
    });

    it('should detect "yeah" as confirmation', () => {
      const result = handleNumberGuess('yeah', 1, 'Bob', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
    });

    it('should detect "correct" as confirmation', () => {
      const result = handleNumberGuess('correct', 1, 'Charlie', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should detect "right" as confirmation', () => {
      const result = handleNumberGuess('right', 2, 'Dave', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should detect "y" as confirmation', () => {
      const result = handleNumberGuess('y', 1, 'Eve', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should detect number repetition as confirmation', () => {
      const result = handleNumberGuess('37', 1, 'Frank', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
    });

    it('should be case-insensitive for confirmations', () => {
      const result = handleNumberGuess('YES', 1, 'Grace', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should handle confirmation with extra whitespace', () => {
      const result = handleNumberGuess('  yes  ', 1, 'Hank', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });
  });

  describe('handleNumberGuess - subsequent guesses', () => {
    it('should guess 13 on second attempt', () => {
      const result = handleNumberGuess('no', 1, 'Alice', mockGetBrowserDetails);

      expect(result.nextAttempt).toBe(2);
      expect(result.gameComplete).toBe(false);
      expect(result.messages[0].content).toContain('13');
    });

    it('should guess 17 on third attempt', () => {
      const result = handleNumberGuess('nope', 2, 'Bob', mockGetBrowserDetails);

      expect(result.nextAttempt).toBe(3);
      expect(result.gameComplete).toBe(false);
      expect(result.messages[0].content).toContain('17');
    });

    it('should not add follow-up question after first guess', () => {
      const result = handleNumberGuess('no', 1, 'Alice', mockGetBrowserDetails);

      expect(result.messages).toHaveLength(1);
    });
  });

  describe('handleNumberGuess - fallback to browser details', () => {
    const mockGetBrowserDetails = () => ({
      timeOfDay: 'evening',
      browser: 'Chrome',
      os: 'macOS',
    });

    it('should use browser details after all guesses fail', () => {
      const result = handleNumberGuess('no', 3, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
      expect(result.revealName).toBe(true);
      expect(result.messages.some(m => m.content.includes('evening'))).toBe(true);
      expect(result.messages.some(m => m.content.includes('Chrome'))).toBe(true);
      expect(result.messages.some(m => m.content.includes('macOS'))).toBe(true);
    });

    it('should reveal Paimon name in fallback path', () => {
      const result = handleNumberGuess('no', 3, 'Bob', mockGetBrowserDetails);

      expect(result.messages.some(m => m.content.includes('Paimon'))).toBe(true);
      expect(result.messages.some(m => m.content.includes('Raphael'))).toBe(true);
    });

    it('should include player name in browser details response', () => {
      const result = handleNumberGuess('wrong', 3, 'Charlie', mockGetBrowserDetails);

      expect(result.messages.some(m => m.content.includes('Charlie'))).toBe(true);
    });

    it('should call getBrowserDetails function', () => {
      const mockFn = vi.fn(() => ({
        timeOfDay: 'morning',
        browser: 'Firefox',
        os: 'Linux',
      }));

      const result = handleNumberGuess('no', 3, 'Dave', mockFn);

      expect(mockFn).toHaveBeenCalledOnce();
      expect(result.messages.some(m => m.content.includes('morning'))).toBe(true);
    });
  });

  describe('handleNumberGuess - successful guess reveals name', () => {
    it('should reveal demon name in success path', () => {
      const result = handleNumberGuess('yes', 1, 'Alice', mockGetBrowserDetails);

      expect(result.messages.some(m => m.content.includes("My name isn't Raphael"))).toBe(true);
      expect(result.messages.some(m => m.content.includes("I'm Paimon"))).toBe(true);
    });

    it('should include player name in reveal messages', () => {
      const result = handleNumberGuess('correct', 2, 'TestPlayer', mockGetBrowserDetails);

      expect(result.messages.some(m => m.content.includes('TestPlayer'))).toBe(true);
    });

    it('should have proper message timing for reveal', () => {
      const result = handleNumberGuess('yes', 1, 'Alice', mockGetBrowserDetails);

      const delays = result.messages.map(m => m.delay);
      expect(delays).toEqual([1000, 2500, 4500, 6000, 7500]);
    });
  });

  describe('handleNumberGuess - edge cases', () => {
    it('should not trigger confirmation on attempt 0', () => {
      const result = handleNumberGuess('yes', 0, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(false);
    });

    it('should handle partial matches in confirmation text', () => {
      const result = handleNumberGuess('yes, that is correct!', 1, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(true);
    });

    it('should not confirm with wrong number', () => {
      const result = handleNumberGuess('42', 1, 'Alice', mockGetBrowserDetails);

      expect(result.gameComplete).toBe(false);
    });

    it('should handle empty input gracefully', () => {
      const result = handleNumberGuess('', 1, 'Alice', mockGetBrowserDetails);

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
