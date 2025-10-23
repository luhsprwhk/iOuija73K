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

  {
    id: 'the_convent',
    title: 'The Convent',
    category: 'Locations',
    description:
      'Moon-slashed stone and stained glass leaking prayer. The sisters kept quiet records and quieter sins; something in the mortar remembers the hymns.',
    icon: '⛪',
    order: 2,
  },
  {
    id: 'sister_margaret_diary',
    title: "Sister Margaret's Diary",
    category: 'Items',
    description:
      'Pressed violets, cramped handwriting, pages gone thin with touch. She writes of sleepless nights and a glimmering promise in lead that will not cleanse but consume.',
    icon: '📖',
    order: 3,
  },
  {
    id: 'the_basement',
    title: 'The Basement',
    category: 'Locations',
    description:
      'Steps sweat in the cold. Candles gutter toward something shackled and patient. The air tastes like coins and old prayers overturned.',
    icon: '🕯️',
    order: 4,
  },
  {
    id: 'philosophers_stone',
    title: "The Philosopher's Stone",
    category: 'Mysteries',
    description:
      'A promise of transmutation: sorrow to gold, guilt to grace. In practice, it turns mercy to metal and men to monsters—most of all in the mind that seeks it.',
    icon: '🜍',
    order: 5,
  },
  {
    id: 'bloodstained_rosary',
    title: 'Bloodstained Rosary',
    category: 'Items',
    description:
      'Carved beads slick with dried blood. Each bead inscribed with a name—Sister Agnes among them. The chain is broken at the third decade, as if torn away in violence.',
    icon: '📿',
    order: 6,
  },

  // Future entries will be added here as the convent trial is redesigned:
  // - Emma (the sacrificed village girl)
  // - Sister Margaret (diary keeper)
  // - Sister Agnes (referenced in bloodstained rosary)
  // - The Convent (location) ✓
  // - The Basement (location with dark secrets) ✓
  // - The Philosopher's Stone (corruption narrative) ✓
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
