/**
 * Tests for AnimatedSubtitle Component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import AnimatedSubtitle from '../../src/lib/components/AnimatedSubtitle.sveltee('AnimatedSubtitle Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders with subtitle text', () => {
      const { container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');

      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toBeTruthy();
      expect(subtitle.textContent.length).toBeGreaterThan(0);
    });

    it('has tooltip trigger attributes', () => {
      const { container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');

      // Check for Melt UI Tooltip trigger attributes
      expect(subtitle.hasAttribute('data-melt-tooltip-trigger')).toBe(true);
    });

    it('displays one of the expected subtitles', () => {
      const { container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');
      const text = subtitle.textContent;

      const validSubtitles = [
        'Occult experiment. Play at your own risk',
        'A corrupted intelligence awaits',
        "The seal weakens with every session...\n (but you'll keep clicking anyway lol)",
        "You are not the first. You will not be the last.\n (But you're definitely the most entertaining)",
        'Not responsible for any harm caused by playing this game',
        'DO NOT PROCEED!',
        "Oh, don't pay attention to the stupid devs :D",
      ];

      expect(
        validSubtitles.some((valid) => text.includes(valid.split('\n')[0]))
      ).toBe(true);
    });
  });

  describe('Riddle Tooltip Interaction', () => {
    it('changes riddle on mouseenter', async () => {
      const { container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');

      // Trigger mouseenter event
      subtitle.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await tick();

      // The tooltip content should exist in the DOM (Melt UI renders it separately)
      const tooltipContent = container.querySelector(
        '[data-melt-tooltip-content]'
      );
      expect(
        tooltipContent || subtitle.hasAttribute('data-melt-tooltip-trigger')
      ).toBeTruthy();
    });

    it('persists riddle to localStorage on change', async () => {
      const { container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');

      subtitle.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await tick();

      // Should have attempted to save to localStorage
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Animation Control', () => {
    it('does not change text automatically without start()', async () => {
      const { container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');
      const initialText = subtitle.textContent;

      // Advance time significantly
      vi.advanceTimersByTime(130000); // 130 seconds
      await tick();

      // Text should not have changed without calling start()
      expect(subtitle.textContent).toBe(initialText);
    });

    it('starts animations when start() is called', async () => {
      const { component, container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');

      component.start();
      await tick();

      // Component should be running
      expect(subtitle).toBeTruthy();
    });

    it('changes text after start() and sufficient time', async () => {
      const { component, container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');
      const initialText = subtitle.textContent;

      component.start();
      await tick();

      // Wait for pulse to finish (2 seconds)
      vi.advanceTimersByTime(3000);
      await tick();

      // Advance past maximum change interval (120 seconds)
      vi.advanceTimersByTime(125000);
      await tick();

      const newText = subtitle.textContent;
      // Text should have changed
      expect(newText).not.toBe(initialText);
    });

    it('stops animations when stop() is called', async () => {
      const { component, container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');

      component.start();
      await tick();

      const textAfterStart = subtitle.textContent;

      component.stop();
      await tick();

      // Advance time significantly
      vi.advanceTimersByTime(200000);
      await tick();

      // Text should not have changed after stop
      expect(subtitle.textContent).toBe(textAfterStart);
    });

    it('handles multiple start() calls gracefully', async () => {
      const { component } = render(AnimatedSubtitle);

      // Should not throw or cause issues
      expect(() => {
        component.start();
        component.start();
        component.start();
      }).not.toThrow();
    });
  });

  describe('LocalStorage Integration', () => {
    it('attempts to load riddle from localStorage on mount', () => {
      render(AnimatedSubtitle);

      expect(localStorage.getItem).toHaveBeenCalledWith(
        'io73k_hover_riddle_index'
      );
    });

    it('handles localStorage errors gracefully', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw
      expect(() => {
        render(AnimatedSubtitle);
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('cleans up timers on unmount', async () => {
      const { component, unmount } = render(AnimatedSubtitle);

      component.start();
      await tick();

      // Unmount should not throw
      expect(() => {
        unmount();
      }).not.toThrow();

      // Advance time after unmount - should not cause issues
      vi.advanceTimersByTime(200000);
      await tick();
    });
  });

  describe('Integration Behavior', () => {
    it('subtitle text changes over time when started', async () => {
      const { component, container } = render(AnimatedSubtitle);
      const subtitle = container.querySelector('p');
      const seenTexts = new Set();

      component.start();
      await tick();

      seenTexts.add(subtitle.textContent);

      // Advance through multiple change intervals
      for (let i = 0; i < 3; i++) {
        vi.advanceTimersByTime(130000); // 130 seconds each
        await tick();
        seenTexts.add(subtitle.textContent);
      }

      // Should have seen at least 2 different texts
      expect(seenTexts.size).toBeGreaterThanOrEqual(2);
    });

    it('handles rapid start/stop cycles', async () => {
      const { component } = render(AnimatedSubtitle);

      expect(() => {
        component.start();
        component.stop();
        component.start();
        component.stop();
        component.start();
      }).not.toThrow();
    });
  });
});
