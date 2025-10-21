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
     * Claude 3.5 Sonnet - Most capable model
     * Use for: Creative narrative responses, complex reasoning, nuanced dialogue
     * Cost: Higher (~$3 per million input tokens, ~$15 per million output tokens)
     * Speed: Slower
     */
    MODEL_SONNET: 'claude-3-5-sonnet-20241022',

    /**
     * Claude Haiku 4.5 - Latest small model (Oct 2025)
     * Near-frontier performance at exceptional speed and cost
     * Use for: Simple classification, intent detection, yes/no decisions
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
