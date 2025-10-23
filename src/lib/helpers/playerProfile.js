/**
 * Player profile helpers: persist and retrieve player's name
 */

const STORAGE_KEY = 'io73k_player_name';

/**
 * Get the saved player name from localStorage
 * @returns {string|null}
 */
export function getPlayerName() {
  try {
    const name = localStorage.getItem(STORAGE_KEY);
    return name && typeof name === 'string' ? name : null;
  } catch (e) {
    console.error('Error reading player name from localStorage:', e);
    return null;
  }
}

/**
 * Save the player name to localStorage
 * @param {string} name
 */
export function setPlayerName(name) {
  try {
    if (typeof name === 'string' && name.trim().length > 0) {
      localStorage.setItem(STORAGE_KEY, name.trim());
    }
  } catch (e) {
    console.error('Error saving player name to localStorage:', e);
  }
}

/**
 * Clear the saved player name (for testing)
 */
export function clearPlayerName() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing player name from localStorage:', e);
  }
}
