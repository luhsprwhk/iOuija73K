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
   * White Room trial settings
   */
  whiteRoom: {
    /**
     * Maximum number of exploration turns before forcing a choice
     * Prevents unbounded AI API calls and ensures game progression
     * After this limit, the mirror will force a confrontation
     */
    MAX_EXPLORATION_TURNS: 15,
  },

  /**
   * Convent trial settings
   */
  convent: {
    /**
     * Maximum number of exploration turns before alarm triggers
     * Prevents unbounded exploration and forces combat
     * After this limit, nuns discover the player and attack
     */
    MAX_EXPLORATION_TURNS: 12,
    HEAL_POTION_CHANCE: 0.3,
    MAX_POTIONS_PER_ROOM: 2,
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
     * Duration of lockout period for meta-breaking in milliseconds
     * 5 minutes = 5 * 60 * 1000 ms
     * Prevents spam/abuse of the game system
     */
    META_BREAKING_DURATION_MS: 5 * 60 * 1000,

    /**
     * Duration of lockout period for game over (death) in milliseconds
     * 1 minute = 1 * 60 * 1000 ms
     * Short cooldown after player dies in combat
     */
    GAME_OVER_DURATION_MS: 1 * 60 * 1000,
  },

  /**
   * Meta-breaking detection settings
   */
  metaBreaking: {
    /**
     * Maximum number of meta-breaking offenses before lockout
     * 1st offense: Warning with insult
     * 2nd offense: Harsh warning
     * 3rd offense: Lockout
     */
    MAX_OFFENSES: 2,

    /**
     * Whether to enable meta-breaking detection
     * Set to false to disable the system entirely
     */
    ENABLED: true,
  },

  /**
   * Message timing settings (in milliseconds)
   */
  timing: {
    /**
     * Minimum delay between messages
     */
    MIN_DELAY: 3000,

    /**
     * Maximum delay between messages
     */
    MAX_DELAY: 5000,

    /**
     * Delay for typical message responses
     */
    STANDARD_DELAY: 2000,

    /**
     * Delay for dramatic pauses
     */
    DRAMATIC_DELAY: 6000,

    /**
     * Delay for quick responses
     */
    QUICK_DELAY: 1000,
  },

  /**
   * Claude AI model configuration
   * Uses different models for different tasks to optimize cost and performance
   */
  ai: {
    /**
     * Claude Haiku 4.5 - Latest small model (Oct 2025)
     * Near-frontier performance at exceptional speed and cost
     * Use for: all AI responses
     * Performance: Similar to Claude Sonnet 4 (frontier model from 5 months ago)
     * Cost: $1 per million input tokens, $5 per million output tokens
     * Speed: 2x+ faster than Sonnet 4, even faster than 3.5 Haiku
     * Note: More capable than 3.5 Haiku, even surpasses Sonnet 4 at some tasks
     */
    MODEL_HAIKU: 'claude-haiku-4-5',

    /**
     * Maximum tokens for AI responses
     */
    MAX_TOKENS: 1024,

    /**
     * Maximum tokens for simple classification tasks
     * Lower token limit for faster, cheaper responses
     */
    MAX_TOKENS_CLASSIFICATION: 10,
  },
};
