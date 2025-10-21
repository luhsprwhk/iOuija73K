/**
 * Tests for AchievementPanel component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import AchievementPanel from '../../src/lib/components/AchievementPanel.svelte';
import * as achievementManager from '../../src/achievements/achievementManager.js';

describe('AchievementPanel', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(AchievementPanel, {
        props: { isOpen: false },
      });

      expect(container.querySelector('[role="button"]')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText('Achievements')).toBeInTheDocument();
    });

    it('should display the correct header title', () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      const header = screen.getByText('Achievements');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('H2');
    });

    it('should display close button', () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });
  });

  describe('Achievement Stats', () => {
    it('should display 0 of 6 when no achievements are unlocked', () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText(/0 of 6 \(0%\)/)).toBeInTheDocument();
    });

    it('should display correct stats when some achievements are unlocked', () => {
      // Set up localStorage directly instead of mocking
      const mockData = [
        { id: 'jigsaw_apprentice', unlockedAt: Date.now() },
        { id: 'summoning_circle', unlockedAt: Date.now() },
      ];
      localStorage.setItem('io73k_achievements', JSON.stringify(mockData));

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText('2 of 6 (33%)')).toBeInTheDocument();
    });

    it('should display 100% when all achievements are unlocked', () => {
      // Set up localStorage directly
      const mockData = [
        { id: 'jigsaw_apprentice', unlockedAt: Date.now() },
        { id: 'summoning_circle', unlockedAt: Date.now() },
        { id: 'true_name', unlockedAt: Date.now() },
        { id: 'truth_beneath', unlockedAt: Date.now() },
        { id: 'merciful_executioner', unlockedAt: Date.now() },
        { id: 'killjoy', unlockedAt: Date.now() },
      ];
      localStorage.setItem('io73k_achievements', JSON.stringify(mockData));

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText('6 of 6 (100%)')).toBeInTheDocument();
    });
  });

  describe('Achievement List', () => {
    it('should render all 5 achievements', () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText("Jigsaw's Apprentice")).toBeInTheDocument();
      expect(screen.getByText('Summoning Circle')).toBeInTheDocument();
      expect(screen.getByText('True Name')).toBeInTheDocument();
      expect(screen.getByText('The Truth Beneath')).toBeInTheDocument();
      expect(screen.getByText('Merciful Executioner')).toBeInTheDocument();
    });

    it('should display achievement icons', () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText('🎭')).toBeInTheDocument(); // Jigsaw's Apprentice
      expect(screen.getByText('👁️')).toBeInTheDocument(); // Summoning Circle
      expect(screen.getByText('👑')).toBeInTheDocument(); // True Name
      expect(screen.getByText('🕯️')).toBeInTheDocument(); // Truth Beneath
      expect(screen.getByText('⚖️')).toBeInTheDocument(); // Merciful Executioner
    });

    it('should show ??? for locked achievement descriptions', () => {
      // Ensure no achievements are unlocked
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      const lockedDescriptions = screen.getAllByText('???');
      expect(lockedDescriptions).toHaveLength(6); // All locked by default
    });

    it('should show actual description for unlocked achievements', () => {
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([
        { id: 'jigsaw_apprentice', unlockedAt: Date.now() },
      ]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(
        screen.getByText('Recognized the Saw scenario in the White Room')
      ).toBeInTheDocument();
      
      // Other achievements should still show ???
      const lockedDescriptions = screen.getAllByText('???');
      expect(lockedDescriptions).toHaveLength(5); // 6 total - 1 unlocked = 5 locked
    });

    it('should display checkmark for unlocked achievements', () => {
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([
        { id: 'jigsaw_apprentice', unlockedAt: Date.now() },
        { id: 'summoning_circle', unlockedAt: Date.now() },
      ]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(2);
    });

    it('should not display checkmark for locked achievements', () => {
      // Ensure no achievements are unlocked
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      const checkmarks = screen.queryAllByText('✓');
      expect(checkmarks).toHaveLength(0);
    });
  });

  describe('Interaction', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      render(AchievementPanel, {
        props: { isOpen: true, onClose },
      });

      const closeButton = screen.getByText('✕');
      await fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should close when backdrop is clicked', async () => {
      const onClose = vi.fn();
      const { container } = render(AchievementPanel, {
        props: { isOpen: true, onClose },
      });

      const backdrop = container.querySelector('[role="button"]');
      await fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside the panel', async () => {
      const onClose = vi.fn();
      render(AchievementPanel, {
        props: { isOpen: true, onClose },
      });

      const header = screen.getByText('Achievements');
      await fireEvent.click(header);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should render close button that can be clicked', async () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText('Achievements')).toBeInTheDocument();

      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeInTheDocument();
      
      // Close button should be clickable
      await fireEvent.click(closeButton);
      // Note: In a real app, the parent would update isOpen
    });
  });

  describe('Visual States', () => {
    it('should render achievement items with proper structure', () => {
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([
        { id: 'jigsaw_apprentice', unlockedAt: Date.now() },
      ]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      // Check that achievements are rendered
      expect(screen.getByText("Jigsaw's Apprentice")).toBeInTheDocument();
      expect(screen.getByText('Summoning Circle')).toBeInTheDocument();
    });

    it('should render all achievement icons', () => {
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      // All icons should be present
      expect(screen.getByText('🎭')).toBeInTheDocument();
      expect(screen.getByText('👁️')).toBeInTheDocument();
      expect(screen.getByText('👑')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty unlocked achievements array', () => {
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      expect(screen.getByText(/0 of 6 \(0%\)/)).toBeInTheDocument();
    });

    it('should handle missing onClose callback', async () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      const closeButton = screen.getByText('✕');
      
      // Should not throw error when onClose is undefined
      await expect(fireEvent.click(closeButton)).resolves.not.toThrow();
    });

    it('should render correctly with all achievements unlocked', () => {
      vi.spyOn(achievementManager, 'getUnlockedAchievements').mockReturnValue([
        { id: 'jigsaw_apprentice', unlockedAt: Date.now() },
        { id: 'summoning_circle', unlockedAt: Date.now() },
        { id: 'true_name', unlockedAt: Date.now() },
        { id: 'truth_beneath', unlockedAt: Date.now() },
        { id: 'merciful_executioner', unlockedAt: Date.now() },
        { id: 'killjoy', unlockedAt: Date.now() },
      ]);

      render(AchievementPanel, {
        props: { isOpen: true },
      });

      // All descriptions should be visible
      expect(
        screen.getByText('Recognized the Saw scenario in the White Room')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Found the invocation in the browser console')
      ).toBeInTheDocument();
      expect(
        screen.getByText("Discovered Paimon's real identity")
      ).toBeInTheDocument();
      expect(
        screen.getByText('Examined the convent basement and uncovered the crime')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Tried to save the condemned client in the hangman trial')
      ).toBeInTheDocument();

      // No ??? should be present
      expect(screen.queryByText('???')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role for backdrop', () => {
      const { container } = render(AchievementPanel, {
        props: { isOpen: true },
      });

      const backdrop = container.querySelector('[role="button"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should have proper tabindex for backdrop', () => {
      const { container } = render(AchievementPanel, {
        props: { isOpen: true },
      });

      const backdrop = container.querySelector('[role="button"]');
      expect(backdrop).toHaveAttribute('tabindex', '-1');
    });

    it('should have semantic heading structure', () => {
      render(AchievementPanel, {
        props: { isOpen: true },
      });

      const mainHeading = screen.getByText('Achievements');
      expect(mainHeading.tagName).toBe('H2');

      const achievementTitles = screen.getAllByRole('heading', { level: 3 });
      expect(achievementTitles.length).toBe(6); // Updated for Killjoy achievement
    });
  });
});
