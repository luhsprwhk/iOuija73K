/**
 * Tests for AchievementToast component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import AchievementToast from '../../src/lib/components/AchievementToast.svelte';
import { ACHIEVEMENTS } from '../../src/achievements/achievementData.js';

describe('AchievementToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should not render when achievement is null', () => {
      render(AchievementToast, {
        props: { achievement: null },
      });

      expect(screen.queryByText('Achievement Unlocked')).not.toBeInTheDocument();
    });

    it('should not render when achievement is undefined', () => {
      render(AchievementToast, {
        props: { achievement: undefined },
      });

      expect(screen.queryByText('Achievement Unlocked')).not.toBeInTheDocument();
    });

    it('should render when achievement is provided', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      expect(screen.getByText('Achievement Unlocked')).toBeInTheDocument();
    });

    it('should display "Achievement Unlocked" label', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      const label = screen.getByText('Achievement Unlocked');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Achievement Content', () => {
    it('should display achievement title', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      expect(screen.getByText("Jigsaw's Apprentice")).toBeInTheDocument();
    });

    it('should display achievement description', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      expect(
        screen.getByText('Recognized the Saw scenario in the White Room')
      ).toBeInTheDocument();
    });

    it('should display achievement icon', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      expect(screen.getByText('🎭')).toBeInTheDocument();
    });

    it('should render different achievement correctly', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.SUMMONING_CIRCLE },
      });

      expect(screen.getByText('Summoning Circle')).toBeInTheDocument();
      expect(
        screen.getByText('Found the invocation in the browser console')
      ).toBeInTheDocument();
      expect(screen.getByText('👁️')).toBeInTheDocument();
    });

    it('should render True Name achievement', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.TRUE_NAME },
      });

      expect(screen.getByText('True Name')).toBeInTheDocument();
      expect(screen.getByText("Discovered Paimon's real identity")).toBeInTheDocument();
      expect(screen.getByText('👑')).toBeInTheDocument();
    });

    it('should render Truth Beneath achievement', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.TRUTH_BENEATH },
      });

      expect(screen.getByText('The Truth Beneath')).toBeInTheDocument();
      expect(
        screen.getByText('Examined the convent basement and uncovered the crime')
      ).toBeInTheDocument();
      expect(screen.getByText('🕯️')).toBeInTheDocument();
    });

    it('should render Merciful Executioner achievement', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.MERCIFUL_EXECUTIONER },
      });

      expect(screen.getByText('Merciful Executioner')).toBeInTheDocument();
      expect(
        screen.getByText('Tried to save the condemned client in the hangman trial')
      ).toBeInTheDocument();
      expect(screen.getByText('⚖️')).toBeInTheDocument();
    });
  });

  describe('Auto-dismiss Behavior', () => {
    it('should call onDismiss after 5 seconds', async () => {
      const onDismiss = vi.fn();
      render(AchievementToast, {
        props: {
          achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE,
          onDismiss,
        },
      });

      expect(onDismiss).not.toHaveBeenCalled();

      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onDismiss before 5 seconds', async () => {
      const onDismiss = vi.fn();
      render(AchievementToast, {
        props: {
          achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE,
          onDismiss,
        },
      });

      // Fast-forward time by 4 seconds
      vi.advanceTimersByTime(4000);

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should not call onDismiss if achievement is null', () => {
      const onDismiss = vi.fn();
      render(AchievementToast, {
        props: {
          achievement: null,
          onDismiss,
        },
      });

      vi.advanceTimersByTime(5000);

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should handle missing onDismiss callback gracefully', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      // Should not throw error when onDismiss is undefined
      expect(() => {
        vi.advanceTimersByTime(5000);
      }).not.toThrow();
    });

    it('should clear timeout on unmount', () => {
      const onDismiss = vi.fn();
      const { unmount } = render(AchievementToast, {
        props: {
          achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE,
          onDismiss,
        },
      });

      unmount();
      vi.advanceTimersByTime(5000);

      // onDismiss should not be called after unmount
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should reset timeout when achievement changes', async () => {
      const onDismiss = vi.fn();
      const { rerender } = render(AchievementToast, {
        props: {
          achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE,
          onDismiss,
        },
      });

      // Advance 3 seconds
      vi.advanceTimersByTime(3000);

      // Change achievement using rerender
      await rerender({ achievement: ACHIEVEMENTS.SUMMONING_CIRCLE, onDismiss });

      // Advance 3 more seconds (total 6, but timer should have reset)
      vi.advanceTimersByTime(3000);

      // Should not have been called yet (only 3 seconds since reset)
      expect(onDismiss).not.toHaveBeenCalled();

      // Advance 2 more seconds to complete the 5 second timer
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Dynamic Updates', () => {
    it('should update content when achievement prop changes', async () => {
      const { rerender } = render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      expect(screen.getByText("Jigsaw's Apprentice")).toBeInTheDocument();

      await rerender({ achievement: ACHIEVEMENTS.SUMMONING_CIRCLE });

      await waitFor(() => {
        expect(screen.getByText('Summoning Circle')).toBeInTheDocument();
        expect(screen.queryByText("Jigsaw's Apprentice")).not.toBeInTheDocument();
      });
    });

    it('should hide toast when achievement is set to null', async () => {
      const { rerender } = render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      expect(screen.getByText('Achievement Unlocked')).toBeInTheDocument();

      await rerender({ achievement: null });

      await waitFor(() => {
        expect(screen.queryByText('Achievement Unlocked')).not.toBeInTheDocument();
      });
    });

    it('should show toast when achievement changes from null to valid', async () => {
      const { rerender } = render(AchievementToast, {
        props: { achievement: null },
      });

      expect(screen.queryByText('Achievement Unlocked')).not.toBeInTheDocument();

      await rerender({ achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE });

      await waitFor(() => {
        expect(screen.getByText('Achievement Unlocked')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle achievement with empty title', () => {
      const customAchievement = {
        id: 'test',
        title: '',
        description: 'Test description',
        icon: '🎯',
      };

      render(AchievementToast, {
        props: { achievement: customAchievement },
      });

      expect(screen.getByText('Achievement Unlocked')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should handle achievement with empty description', () => {
      const customAchievement = {
        id: 'test',
        title: 'Test Title',
        description: '',
        icon: '🎯',
      };

      render(AchievementToast, {
        props: { achievement: customAchievement },
      });

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should handle achievement with long title', () => {
      const customAchievement = {
        id: 'test',
        title: 'This is a very long achievement title that might wrap to multiple lines',
        description: 'Description',
        icon: '🎯',
      };

      render(AchievementToast, {
        props: { achievement: customAchievement },
      });

      expect(
        screen.getByText('This is a very long achievement title that might wrap to multiple lines')
      ).toBeInTheDocument();
    });

    it('should handle achievement with long description', () => {
      const customAchievement = {
        id: 'test',
        title: 'Title',
        description:
          'This is a very long achievement description that contains a lot of text and might wrap to multiple lines in the toast notification',
        icon: '🎯',
      };

      render(AchievementToast, {
        props: { achievement: customAchievement },
      });

      expect(
        screen.getByText(
          'This is a very long achievement description that contains a lot of text and might wrap to multiple lines in the toast notification'
        )
      ).toBeInTheDocument();
    });

    it('should handle achievement with special characters in text', () => {
      const customAchievement = {
        id: 'test',
        title: "Test's \"Special\" <Characters>",
        description: 'Description & more',
        icon: '🎯',
      };

      render(AchievementToast, {
        props: { achievement: customAchievement },
      });

      expect(screen.getByText("Test's \"Special\" <Characters>")).toBeInTheDocument();
      expect(screen.getByText('Description & more')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render toast container', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      // Toast should be visible with all its content
      expect(screen.getByText('Achievement Unlocked')).toBeInTheDocument();
      expect(screen.getByText("Jigsaw's Apprentice")).toBeInTheDocument();
    });

    it('should display all text elements in correct hierarchy', () => {
      render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      // Label should be present
      expect(screen.getByText('Achievement Unlocked')).toBeInTheDocument();
      
      // Title should be present
      expect(screen.getByText("Jigsaw's Apprentice")).toBeInTheDocument();
      
      // Description should be present
      expect(
        screen.getByText('Recognized the Saw scenario in the White Room')
      ).toBeInTheDocument();
      
      // Icon should be present
      expect(screen.getByText('🎭')).toBeInTheDocument();
    });
  });

  describe('Multiple Toast Scenarios', () => {
    it('should handle rapid achievement changes', async () => {
      const onDismiss = vi.fn();
      const { rerender } = render(AchievementToast, {
        props: {
          achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE,
          onDismiss,
        },
      });

      // Change achievement rapidly
      await rerender({ achievement: ACHIEVEMENTS.SUMMONING_CIRCLE, onDismiss });
      await rerender({ achievement: ACHIEVEMENTS.TRUE_NAME, onDismiss });

      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('should display correct achievement after multiple changes', async () => {
      const { rerender } = render(AchievementToast, {
        props: { achievement: ACHIEVEMENTS.JIGSAW_APPRENTICE },
      });

      await rerender({ achievement: ACHIEVEMENTS.SUMMONING_CIRCLE });
      await rerender({ achievement: ACHIEVEMENTS.TRUE_NAME });

      await waitFor(() => {
        expect(screen.getByText('True Name')).toBeInTheDocument();
        expect(screen.queryByText("Jigsaw's Apprentice")).not.toBeInTheDocument();
        expect(screen.queryByText('Summoning Circle')).not.toBeInTheDocument();
      });
    });
  });
});
