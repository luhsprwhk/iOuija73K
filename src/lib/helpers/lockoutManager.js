import { GAME_CONFIG } from '../../config/gameConfig.js';

const LOCKOUT_KEY = 'io73k_lockout';
const LOCKOUT_DURATION = GAME_CONFIG.lockout.DURATION_MS;

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
 */
export function setLockout() {
  try {
    const lockoutEnd = Date.now() + LOCKOUT_DURATION;
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
  return LOCKOUT_DURATION / 1000;
}
