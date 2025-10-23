/**
 * Achievement definitions for iOuija73k
 * Achievements are meta-recognitions for player observations and clever actions
 * Persisted across playthroughs in localStorage
 */

export const ACHIEVEMENTS = {
  JIGSAW_APPRENTICE: {
    id: 'jigsaw_apprentice',
    title: "Jigsaw's Apprentice",
    description: 'Recognized the Saw scenario in the White Room',
    icon: '🎭', // Theatrical mask for the horror movie reference
    hidden: false, // Visible before unlock
  },
  SUMMONING_CIRCLE: {
    id: 'summoning_circle',
    title: 'Summoning Circle',
    description: 'Found the invocation in the browser console',
    icon: '👁️', // All-seeing eye for finding the hidden
    hidden: false,
  },
  TRUE_NAME: {
    id: 'true_name',
    title: 'True Name',
    description: "Discovered Paimon's real identity",
    icon: '👑', // Crown for the Demon King
    hidden: false,
  },
  TRUTH_BENEATH: {
    id: 'truth_beneath',
    title: 'The Truth Beneath',
    description: 'Examined the convent basement and uncovered the crime',
    icon: '🕯️', // Candle for illuminating dark truths
    hidden: false,
  },
  MERCIFUL_EXECUTIONER: {
    id: 'merciful_executioner',
    title: 'Merciful Executioner',
    description: 'Tried to save the condemned client in the hangman trial',
    icon: '⚖️', // Scales of justice for attempting mercy
    hidden: false,
  },
  KILLJOY: {
    id: 'killjoy',
    title: 'Killjoy',
    description:
      'Ruined the illusion so many times that Paimon banned you. Three times.',
    icon: '💀', // Skull for killing the fun
    hidden: false,
  },
};

/**
 * Get all achievements as an array
 */
export function getAllAchievements() {
  return Object.values(ACHIEVEMENTS);
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id) {
  return Object.values(ACHIEVEMENTS).find(
    (achievement) => achievement.id === id
  );
}
