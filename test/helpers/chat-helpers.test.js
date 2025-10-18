/**
 * Tests for Chat Helper Functions
 */

import { describe, it, expect } from 'vitest';
import { intervalsToCumulative } from '../../src/lib/helpers/chat.js';

describe('Chat Helpers', () => {
  describe('intervalsToCumulative', () => {
    it('should convert interval delays to cumulative delays', () => {
      const messages = [
        { text: 'Hello', delay: 100 },
        { text: 'World', delay: 200 },
        { text: 'Test', delay: 150 },
      ];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([
        { text: 'Hello', delay: 100 },
        { text: 'World', delay: 300 },
        { text: 'Test', delay: 450 },
      ]);
    });

    it('should handle empty array', () => {
      const messages = [];
      const result = intervalsToCumulative(messages);
      expect(result).toEqual([]);
    });

    it('should handle single message', () => {
      const messages = [{ text: 'Single', delay: 500 }];
      const result = intervalsToCumulative(messages);
      expect(result).toEqual([{ text: 'Single', delay: 500 }]);
    });

    it('should handle zero delays', () => {
      const messages = [
        { text: 'First', delay: 0 },
        { text: 'Second', delay: 0 },
        { text: 'Third', delay: 100 },
      ];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([
        { text: 'First', delay: 0 },
        { text: 'Second', delay: 0 },
        { text: 'Third', delay: 100 },
      ]);
    });

    it('should handle messages with additional properties', () => {
      const messages = [
        { text: 'Message 1', delay: 100, speaker: 'Alice', type: 'question' },
        { text: 'Message 2', delay: 200, speaker: 'Bob', type: 'answer' },
      ];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([
        {
          text: 'Message 1',
          delay: 100,
          speaker: 'Alice',
          type: 'question',
        },
        { text: 'Message 2', delay: 300, speaker: 'Bob', type: 'answer' },
      ]);
    });

    it('should not mutate original array', () => {
      const messages = [
        { text: 'Hello', delay: 100 },
        { text: 'World', delay: 200 },
      ];

      const originalMessages = JSON.parse(JSON.stringify(messages));
      intervalsToCumulative(messages);

      expect(messages).toEqual(originalMessages);
    });

    it('should handle large delay values', () => {
      const messages = [
        { text: 'First', delay: 10000 },
        { text: 'Second', delay: 50000 },
        { text: 'Third', delay: 100000 },
      ];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([
        { text: 'First', delay: 10000 },
        { text: 'Second', delay: 60000 },
        { text: 'Third', delay: 160000 },
      ]);
    });

    it('should handle negative delays (edge case)', () => {
      const messages = [
        { text: 'First', delay: 100 },
        { text: 'Second', delay: -50 },
        { text: 'Third', delay: 200 },
      ];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([
        { text: 'First', delay: 100 },
        { text: 'Second', delay: 50 },
        { text: 'Third', delay: 250 },
      ]);
    });

    it('should handle decimal delays', () => {
      const messages = [
        { text: 'First', delay: 100.5 },
        { text: 'Second', delay: 200.3 },
        { text: 'Third', delay: 150.2 },
      ];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([
        { text: 'First', delay: 100.5 },
        { text: 'Second', delay: 300.8 },
        { text: 'Third', delay: 451 },
      ]);
    });

    it('should handle messages with only delay property', () => {
      const messages = [{ delay: 100 }, { delay: 200 }, { delay: 300 }];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([{ delay: 100 }, { delay: 300 }, { delay: 600 }]);
    });

    it('should create new objects (not modify references)', () => {
      const message1 = { text: 'Hello', delay: 100 };
      const message2 = { text: 'World', delay: 200 };
      const messages = [message1, message2];

      const result = intervalsToCumulative(messages);

      expect(result[0]).not.toBe(message1);
      expect(result[1]).not.toBe(message2);
      expect(message1.delay).toBe(100); // Original unchanged
      expect(message2.delay).toBe(200); // Original unchanged
    });

    it('should handle many messages efficiently', () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        text: `Message ${i}`,
        delay: 10,
      }));

      const result = intervalsToCumulative(messages);

      expect(result).toHaveLength(100);
      expect(result[0].delay).toBe(10);
      expect(result[50].delay).toBe(510);
      expect(result[99].delay).toBe(1000);
    });

    it('should handle complex nested properties', () => {
      const messages = [
        {
          text: 'First',
          delay: 100,
          metadata: { id: 1, tags: ['important'] },
        },
        {
          text: 'Second',
          delay: 200,
          metadata: { id: 2, tags: ['urgent'] },
        },
      ];

      const result = intervalsToCumulative(messages);

      expect(result).toEqual([
        {
          text: 'First',
          delay: 100,
          metadata: { id: 1, tags: ['important'] },
        },
        {
          text: 'Second',
          delay: 300,
          metadata: { id: 2, tags: ['urgent'] },
        },
      ]);
    });

    it('should maintain correct cumulative sum across all messages', () => {
      const messages = [
        { delay: 50 },
        { delay: 100 },
        { delay: 75 },
        { delay: 125 },
        { delay: 200 },
      ];

      const result = intervalsToCumulative(messages);

      // Verify each cumulative value
      expect(result[0].delay).toBe(50);
      expect(result[1].delay).toBe(150);
      expect(result[2].delay).toBe(225);
      expect(result[3].delay).toBe(350);
      expect(result[4].delay).toBe(550);
    });
  });
});
