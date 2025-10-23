import { GAME_CONFIG } from '../../config/gameConfig.js';

const LOCKOUT_KEY = 'io73k_lockout';
const DEFAULT_LOCKOUT_DURATION = GAME_CONFIG.lockout.META_BREAKING_DURATION_MS;

/**
 * Checks if the user is currently locked out
 * @returns {Object} { isLockedOut: boolean, remainingTime: number (in seconds) }
 */
export function checkLockout() {
  try {
    const lockoutData = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutData) {
      return { isLockedOut: false, remainingTime: 0 };
    }

    const lockoutEnd = parseInt(lockoutData, 10);
    const now = Date.now();

    if (now >= lockoutEnd) {
      // Lockout expired, clear it
      localStorage.removeItem(LOCKOUT_KEY);
      return { isLockedOut: false, remainingTime: 0 };
    }

    // Still locked out
    const remainingMs = lockoutEnd - now;
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return { isLockedOut: true, remainingTime: remainingSeconds };
  } catch (error) {
    console.error('Error checking lockout:', error);
    return { isLockedOut: false, remainingTime: 0 };
  }
}

/**
 * Sets a lockout for the user
 * @param {number} durationMs - Optional custom duration in milliseconds (defaults to meta-breaking duration)
 */
export function setLockout(durationMs = DEFAULT_LOCKOUT_DURATION) {
  try {
    const lockoutEnd = Date.now() + durationMs;
    localStorage.setItem(LOCKOUT_KEY, lockoutEnd.toString());
  } catch (error) {
    console.error('Error setting lockout:', error);
  }
}

/**
 * Clears the lockout (for testing or when timer expires)
 */
export function clearLockout() {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
  } catch (error) {
    console.error('Error clearing lockout:', error);
  }
}

/**
 * Gets the lockout duration in seconds
 */
export function getLockoutDuration() {
  return DEFAULT_LOCKOUT_DURATION / 1000;
}
