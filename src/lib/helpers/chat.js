/**
 * Converts messages with interval delays to cumulative delays
 * @param {Array} messages - Array of message objects with interval delays
 * @returns {Array} - Array of message objects with cumulative delays
 */
export function intervalsToCumulative(messages) {
  let cumulative = 0;
  return messages.map((msg) => {
    cumulative += msg.delay;
    return { ...msg, delay: cumulative };
  });
}

export const MIN_DELAY = 2000;
export const MAX_DELAY = 4000;
export const DRAMATIC_DELAY = 6000;

/**
 * Limits conversation history to the most recent N messages
 * Keeps the history bounded to prevent unbounded growth and excessive AI context costs
 * @param {Array} history - Array of conversation message objects
 * @param {number} maxMessages - Maximum number of messages to keep (default: 10)
 * @returns {Array} - Trimmed conversation history
 */
export function limitConversationHistory(history, maxMessages = 10) {
  if (!Array.isArray(history) || history.length <= maxMessages) {
    return history;
  }
  
  // Keep only the last N messages
  return history.slice(-maxMessages);
}
