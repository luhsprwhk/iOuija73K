/**
 * Tracks meta-breaking lockouts across sessions
 * Used to award the "Killjoy" achievement after 3 lockouts
 */

const STORAGE_KEY = 'io73k_meta_lockout_count';

/**
 * Gets the current meta-lockout count from localStorage
 * @returns {number} - Number of times player has been locked out for meta-breaking
 */
export function getMetaLockoutCount() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.error('Failed to read meta-lockout count:', error);
    return 0;
  }
}

/**
 * Increments the meta-lockout count
 * @returns {number} - The new count after incrementing
 */
export function incrementMetaLockoutCount() {
  try {
    const currentCount = getMetaLockoutCount();
    const newCount = currentCount + 1;
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Failed to increment meta-lockout count:', error);
    return 0;
  }
}

/**
 * Resets the meta-lockout count (for testing purposes)
 */
export function resetMetaLockoutCount() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset meta-lockout count:', error);
  }
}
