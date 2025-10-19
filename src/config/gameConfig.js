/**
 * Centralized game configuration
 * Contains all magic numbers and tunable parameters
 */

export const GAME_CONFIG = {
  /**
   * Hangman trial settings
   */
  hangman: {
    /**
     * Maximum number of wrong guesses before game over
     * Traditional hangman uses 6 (head, body, left arm, right arm, left leg, right leg)
     */
    MAX_ATTEMPTS: 6,

    /**
     * Time limit for the hangman trial in seconds
     * Creates urgency and pressure on the player
     */
    TIME_LIMIT_SECONDS: 50,
  },

  /**
   * Name validation settings
   */
  nameValidation: {
    /**
     * Maximum number of attempts before forcing acceptance
     * Prevents infinite loops if player refuses to provide valid name
     */
    MAX_ATTEMPTS: 3,
  },

  /**
   * Lockout system settings
   */
  lockout: {
    /**
     * Duration of lockout period in milliseconds
     * 5 minutes = 5 * 60 * 1000 ms
     * Prevents spam/abuse of the game system
     */
    DURATION_MS: 5 * 60 * 1000,
  },

  /**
   * Message timing settings (in milliseconds)
   */
  timing: {
    /**
     * Delay for typical message responses
     */
    STANDARD_DELAY: 2000,

    /**
     * Delay for dramatic pauses
     */
    DRAMATIC_DELAY: 4000,

    /**
     * Delay for quick responses
     */
    QUICK_DELAY: 1000,
  },
};
