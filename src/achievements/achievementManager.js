/**
 * Achievement manager - handles localStorage persistence and unlock logic
 */

const STORAGE_KEY = 'io73k_achievements';

/**
 * Get all unlocked achievements from localStorage
 * @returns {Array<{id: string, unlockedAt: number}>}
 */
export function getUnlockedAchievements() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading achievements from localStorage:', error);
    return [];
  }
}

/**
 * Check if a specific achievement is unlocked
 * @param {string} achievementId
 * @returns {boolean}
 */
export function isAchievementUnlocked(achievementId) {
  const unlocked = getUnlockedAchievements();
  return unlocked.some((achievement) => achievement.id === achievementId);
}

/**
 * Unlock an achievement (idempotent - won't unlock twice)
 * @param {string} achievementId
 * @returns {boolean} - true if newly unlocked, false if already unlocked
 */
export function unlockAchievement(achievementId) {
  if (isAchievementUnlocked(achievementId)) {
    return false; // Already unlocked
  }

  try {
    const unlocked = getUnlockedAchievements();
    unlocked.push({
      id: achievementId,
      unlockedAt: Date.now(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    return true; // Newly unlocked
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return false;
  }
}

/**
 * Get achievement completion stats
 * @param {number} totalAchievements - total number of achievements in the game
 * @returns {{unlocked: number, total: number, percentage: number}}
 */
export function getAchievementStats(totalAchievements) {
  const unlocked = getUnlockedAchievements().length;
  return {
    unlocked,
    total: totalAchievements,
    percentage: totalAchievements > 0 ? Math.round((unlocked / totalAchievements) * 100) : 0,
  };
}

/**
 * Clear all achievements (for testing)
 */
export function clearAllAchievements() {
  localStorage.removeItem(STORAGE_KEY);
}
