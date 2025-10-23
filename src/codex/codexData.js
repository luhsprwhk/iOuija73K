/**
 * Codex Entry Definitions
 *
 * The codex system provides Elden Ring-style environmental storytelling.
 * Entries are unlocked through exploration and discovery, persisting across playthroughs.
 *
 * Each entry represents a piece of lore, character background, or world detail
 * that players uncover through examination and investigation.
 */

/**
 * @typedef {Object} CodexEntry
 * @property {string} id - Unique identifier (snake_case)
 * @property {string} title - Entry title displayed to player
 * @property {string} category - Organizational category (e.g., "Characters", "Locations", "Items")
 * @property {string} description - Poetic, concise lore text (2-4 sentences)
 * @property {string} icon - Emoji icon representing the entry
 * @property {number} order - Display order within category (lower numbers first)
 */

/**
 * All codex entries in the game
 * @type {CodexEntry[]}
 */
export const CODEX_ENTRIES = [
  {
    id: 'raphael',
    title: 'Raphael',
    category: 'Characters',
    description:
      '"God heals" — yet some wounds deepen with His touch. A borrowed mantle, worn by one who rules where light turns to dusk. In the ledger of fallen names, seek the crowned king of the northwest wind.',
    icon: '👤',
    order: 1,
  },

  // Future entries will be added here as the convent trial is redesigned:
  // - Emma (the sacrificed village girl)
  // - Sister Margaret (diary keeper)
  // - Sister Agnes (ghost warning)
  // - The Philosopher's Stone (corruption narrative)
  // - The Convent (location)
  // - The Basement (location with dark secrets)
];

/**
 * Get codex entry by ID
 * @param {string} id - Entry identifier
 * @returns {CodexEntry|undefined}
 */
export function getCodexEntryById(id) {
  return CODEX_ENTRIES.find((entry) => entry.id === id);
}

/**
 * Get all entries in a specific category
 * @param {string} category - Category name
 * @returns {CodexEntry[]}
 */
export function getCodexEntriesByCategory(category) {
  return CODEX_ENTRIES.filter((entry) => entry.category === category).sort(
    (a, b) => a.order - b.order
  );
}

/**
 * Get all unique categories
 * @returns {string[]}
 */
export function getCodexCategories() {
  const categories = new Set(CODEX_ENTRIES.map((entry) => entry.category));
  return Array.from(categories).sort();
}
