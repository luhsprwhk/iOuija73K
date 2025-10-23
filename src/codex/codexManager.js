/**
 * Codex Manager
 *
 * Handles persistence and state management for codex entries.
 * Stores unlocked entries in localStorage to persist across playthroughs.
 *
 * Storage key: io73k_codex
 * Storage format: Array of unlocked entry IDs (e.g., ['raphael', 'emma'])
 */

const STORAGE_KEY = 'io73k_codex';

/**
 * Load unlocked codex entries from localStorage
 * @returns {string[]} Array of unlocked entry IDs
 */
export function loadUnlockedCodex() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const unlocked = JSON.parse(stored);
    return Array.isArray(unlocked) ? unlocked : [];
  } catch (error) {
    console.error('Failed to load codex from localStorage:', error);
    return [];
  }
}

/**
 * Save unlocked codex entries to localStorage
 * @param {string[]} unlockedIds - Array of unlocked entry IDs
 */
function saveUnlockedCodex(unlockedIds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
  } catch (error) {
    console.error('Failed to save codex to localStorage:', error);
  }
}

/**
 * Unlock a codex entry
 * @param {string} entryId - ID of the entry to unlock
 * @returns {boolean} True if entry was newly unlocked, false if already unlocked
 */
export function unlockCodexEntry(entryId) {
  const unlocked = loadUnlockedCodex();

  if (unlocked.includes(entryId)) {
    return false; // Already unlocked
  }

  unlocked.push(entryId);
  saveUnlockedCodex(unlocked);
  return true; // Newly unlocked
}

/**
 * Check if a codex entry is unlocked
 * @param {string} entryId - ID of the entry to check
 * @returns {boolean}
 */
export function isCodexEntryUnlocked(entryId) {
  const unlocked = loadUnlockedCodex();
  return unlocked.includes(entryId);
}

/**
 * Get count of unlocked entries
 * @returns {number}
 */
export function getUnlockedCodexCount() {
  return loadUnlockedCodex().length;
}

/**
 * Reset all codex progress (clear localStorage)
 * Useful for testing or "new game" functionality
 */
export function resetCodexProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset codex progress:', error);
  }
}
