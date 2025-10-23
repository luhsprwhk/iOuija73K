/**
 * Tests for meta-breaking detection system
 */

import { describe, it, expect } from 'vitest';
import {
  getMetaBreakingResponse,
  getMetaLockoutMessage,
} from './metaDetection.js';

describe('Meta-Breaking Detection System', () => {
  describe('getMetaBreakingResponse', () => {
    it('should return dismissive insult on first offense', () => {
      const response = getMetaBreakingResponse(1, 'convent');

      expect(response.shouldLockout).toBe(false);
      expect(response.content).toBeTruthy();
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should return harsh warning on second offense', () => {
      const response = getMetaBreakingResponse(2, 'convent');

      expect(response.shouldLockout).toBe(false);
      expect(response.content).toBeTruthy();
      // Second offense should be more severe than first
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should trigger lockout on third offense', () => {
      const response = getMetaBreakingResponse(3, 'convent');

      expect(response.shouldLockout).toBe(true);
      expect(response.content).toBeTruthy();
    });

    it('should trigger lockout on any offense >= 3', () => {
      const response = getMetaBreakingResponse(5, 'hangman');

      expect(response.shouldLockout).toBe(true);
    });
  });

  describe('getMetaLockoutMessage', () => {
    it('should return context-specific lockout for convent', () => {
      const message = getMetaLockoutMessage('convent');

      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toContain('locked out');
      expect(message.toLowerCase()).toContain('5 minutes');
    });

    it('should return context-specific lockout for hangman', () => {
      const message = getMetaLockoutMessage('hangman');

      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toContain('locked out');
      expect(message.toLowerCase()).toContain('gallows');
    });

    it('should return context-specific lockout for white_room', () => {
      const message = getMetaLockoutMessage('white_room');

      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toContain('locked out');
      expect(message.toLowerCase()).toContain('white room');
    });

    it('should return fallback message for unknown context', () => {
      const message = getMetaLockoutMessage('unknown');

      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toContain('locked out');
    });
  });
});
